import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Category {
  id: number;
  name: string;
}

interface Props {
  categories: Category[];
  fournisseurs: { id: number; name: string }[];
}

export default function ProduitsCreate({ categories, fournisseurs }: Props) {
  const [form, setForm] = useState({
    code_barre: '',
    name: '',
    category_name: '',
    category_id: '',
    fournisseur_name: '',
    fournisseur_id: '',
    prix_achat: '',
    prix_vente: '',
    profit_pct: '',
    quantite: '',
    imageFile: null as File | null,
  });
  const [errors, setErrors] = useState<any>({});
  const [lastChanged, setLastChanged] = useState<'prix_vente' | 'profit_pct' | null>(null);

  const parseNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatNumber = (value: number) => {
    if (!Number.isFinite(value)) return '';
    return value.toFixed(2);
  };

  const computeProfitPercent = (prixAchat: number | null, prixVente: number | null) => {
    if (!prixAchat || prixAchat <= 0 || prixVente === null) return '';
    return formatNumber(((prixVente - prixAchat) / prixAchat) * 100);
  };

  const computePrixVente = (prixAchat: number | null, profitPct: number | null) => {
    if (!prixAchat || prixAchat <= 0 || profitPct === null) return '';
    return formatNumber(prixAchat * (1 + profitPct / 100));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.type === 'file') {
      setForm({ ...form, imageFile: e.target.files ? e.target.files[0] : null });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handlePrixAchatChange = (value: string) => {
    setForm((prev) => {
      const prixAchat = parseNumber(value);
      if (!prixAchat || prixAchat <= 0) {
        return {
          ...prev,
          prix_achat: value,
          prix_vente: lastChanged === 'profit_pct' ? '' : prev.prix_vente,
          profit_pct: lastChanged === 'prix_vente' ? '' : prev.profit_pct,
        };
      }

      if (lastChanged === 'profit_pct') {
        const profitPct = parseNumber(prev.profit_pct);
        return {
          ...prev,
          prix_achat: value,
          prix_vente: computePrixVente(prixAchat, profitPct),
        };
      }

      if (lastChanged === 'prix_vente') {
        const prixVente = parseNumber(prev.prix_vente);
        return {
          ...prev,
          prix_achat: value,
          profit_pct: computeProfitPercent(prixAchat, prixVente),
        };
      }

      return { ...prev, prix_achat: value };
    });
  };

  const handlePrixVenteChange = (value: string) => {
    setLastChanged('prix_vente');
    setForm((prev) => {
      const prixAchat = parseNumber(prev.prix_achat);
      const prixVente = parseNumber(value);
      return {
        ...prev,
        prix_vente: value,
        profit_pct: computeProfitPercent(prixAchat, prixVente),
      };
    });
  };

  const handleProfitPctChange = (value: string) => {
    setLastChanged('profit_pct');
    setForm((prev) => {
      const prixAchat = parseNumber(prev.prix_achat);
      const profitPct = parseNumber(value);
      return {
        ...prev,
        profit_pct: value,
        prix_vente: computePrixVente(prixAchat, profitPct),
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'imageFile' && value) {
        data.append('image', value as File);
      } else if (
        key !== 'imageFile' &&
        key !== 'category_name' &&
        key !== 'fournisseur_name' &&
        key !== 'profit_pct' &&
        value !== null
      ) {
        data.append(key, value as any);
      }
    });
    router.post('/produits', data, {
      forceFormData: true,
      onError: (err) => setErrors(err),
    });
  };

  return (
    <AppLayout>
      <Head title="Nouveau produit" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/produits">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Ajouter un produit</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Informations du produit</CardTitle>
              <CardDescription>
                Renseignez les informations principales du produit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Identification</p>
                    <p className="text-xs text-muted-foreground">Nom et référence produit</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Champs requis *</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="code_barre" className="font-medium">
                      Code barre <span className="text-destructive">*</span>
                    </label>
                    <Input name="code_barre" id="code_barre" value={form.code_barre} onChange={handleChange} required maxLength={30} placeholder="Ex: 1234567890" />
                    {errors.code_barre && <p className="text-sm text-destructive">{errors.code_barre}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="name" className="font-medium">
                      Nom du produit <span className="text-destructive">*</span>
                    </label>
                    <Input name="name" id="name" value={form.name} onChange={handleChange} required maxLength={255} placeholder="Ex: Perceuse électrique" />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Classification</p>
                  <p className="text-xs text-muted-foreground">Catégorie et fournisseur</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="category_name" className="font-medium">
                      Catégorie
                    </label>
                    <Input
                      name="category_name"
                      id="category_name"
                      value={form.category_name}
                      onChange={(e) => {
                        const value = e.target.value;
                        const selected = categories.find((category) => category.name === value);
                        setForm({
                          ...form,
                          category_name: value,
                          category_id: selected ? String(selected.id) : '',
                        });
                      }}
                      placeholder="Choisir une catégorie"
                      list="category-options"
                      required
                    />
                    <datalist id="category-options">
                      {categories.map((category) => (
                        <option key={category.id} value={category.name} />
                      ))}
                    </datalist>
                    {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="fournisseur_name" className="font-medium">
                      Fournisseur
                    </label>
                    <Input
                      name="fournisseur_name"
                      id="fournisseur_name"
                      value={form.fournisseur_name}
                      onChange={(e) => {
                        const value = e.target.value;
                        const selected = fournisseurs.find((f) => f.name === value);
                        setForm({
                          ...form,
                          fournisseur_name: value,
                          fournisseur_id: selected ? String(selected.id) : '',
                        });
                      }}
                      placeholder="Choisir un fournisseur"
                      list="fournisseur-options"
                    />
                    <datalist id="fournisseur-options">
                      {fournisseurs.map((f) => (
                        <option key={f.id} value={f.name} />
                      ))}
                    </datalist>
                    {errors.fournisseur_id && <p className="text-sm text-destructive">{errors.fournisseur_id}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Tarification & stock</p>
                  <p className="text-xs text-muted-foreground">Définissez les valeurs de base</p>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <label htmlFor="prix_achat" className="font-medium">
                      Prix d'achat <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="prix_achat"
                      id="prix_achat"
                      value={form.prix_achat}
                      onChange={(e) => handlePrixAchatChange(e.target.value)}
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="Ex: 120.00"
                    />
                    {errors.prix_achat && <p className="text-sm text-destructive">{errors.prix_achat}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="prix_vente" className="font-medium">
                      Prix de vente <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="prix_vente"
                      id="prix_vente"
                      value={form.prix_vente}
                      onChange={(e) => handlePrixVenteChange(e.target.value)}
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="Ex: 180.00"
                    />
                    {errors.prix_vente && <p className="text-sm text-destructive">{errors.prix_vente}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="profit_pct" className="font-medium">
                      Pourcentage de profit (%)
                    </label>
                    <Input
                      name="profit_pct"
                      id="profit_pct"
                      value={form.profit_pct}
                      onChange={(e) => handleProfitPctChange(e.target.value)}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="quantite" className="font-medium">
                      Quantité <span className="text-destructive">*</span>
                    </label>
                    <Input name="quantite" id="quantite" value={form.quantite} onChange={handleChange} type="number" min="0" required placeholder="Ex: 10" />
                    {errors.quantite && <p className="text-sm text-destructive">{errors.quantite}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Visuel</p>
                  <p className="text-xs text-muted-foreground">Image du produit (optionnel)</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 items-center">
                  <div className="space-y-2">
                    <label htmlFor="image" className="font-medium">
                      Image du produit
                    </label>
                    <Input type="file" name="image" id="image" accept="image/*" onChange={handleChange} />
                    {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                  </div>
                  <div className="flex justify-start">
                    {form.imageFile && (
                      <img
                        src={URL.createObjectURL(form.imageFile)}
                        alt="Aperçu"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-4">
            <Button asChild variant="outline">
              <Link href="/produits">Annuler</Link>
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
