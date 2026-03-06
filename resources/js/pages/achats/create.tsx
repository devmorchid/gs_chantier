import AppLayout from '@/layouts/app-layout';
import MultiStepConfirmation from '@/components/ui/multi-step-confirmation';
import { Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { ProductAutocomplete } from '@/components/ui/product-autocomplete';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProduitOption {
  id: number;
  name: string;
  prix_achat: number;
  prix_vente: number;
  code_barre: string;
  quantite?: number;
  stock?: number;
}

interface Option { id: number; name: string }

interface AchatItemForm {
  mode: 'existing' | 'new';
  produit_id: number | '';
  produit_name: string;
  quantite: number;
  prix_achat: string;
  new_produit: {
    name: string;
    code_barre: string;
    prix_vente: string;
    profit_pct: string;
    category_id: number | '';
    fournisseur_id: number | '';
    category_name: string;
    fournisseur_name: string;
  };
}

interface AchatForm {
  date: string;
  fournisseur_id: number | '';
  fournisseur_name: string;
  remise: string;
  tva_rate: string;
  notes: string;
  mode_paiement: string;
  montant_paye: string;
  cheque_numero: string;
  cheque_banque: string;
  cheque_echeance: string;
  cheque_titulaire: string;
  items: AchatItemForm[];
}

interface Props {
  produits: ProduitOption[];
  categories: Option[];
  fournisseurs: Option[];
}

const emptyNewProduit: AchatItemForm['new_produit'] = {
  name: '',
  code_barre: '',
  prix_vente: '',
  profit_pct: '',
  category_id: '',
  fournisseur_id: '',
  category_name: '',
  fournisseur_name: '',
};

export default function AchatsCreate({ produits, categories, fournisseurs }: Props) {
  const [lastChangedByIndex, setLastChangedByIndex] = useState<Record<number, 'prix_vente' | 'profit_pct' | null>>({});
  const [newFournisseurName, setNewFournisseurName] = useState('');
  const [newFournisseurType, setNewFournisseurType] = useState<'personne' | 'societe'>('societe');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingFournisseur, setCreatingFournisseur] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [openFournisseurDialog, setOpenFournisseurDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data, setData, post, processing, errors } = useForm<AchatForm>({
    date: '',
    fournisseur_id: '',
    fournisseur_name: '',
    remise: '0',
    tva_rate: '0',
    notes: '',
    mode_paiement: '',
    montant_paye: '',
    cheque_numero: '',
    cheque_banque: '',
    cheque_echeance: '',
    cheque_titulaire: '',
    items: [
      {
        mode: 'existing',
        produit_id: '',
        produit_name: '',
        quantite: 1,
        prix_achat: '',
        new_produit: { ...emptyNewProduit },
      },
    ],
  });

  const addItem = () => {
    setData('items', [
      ...data.items,
      {
        mode: 'existing',
        produit_id: '',
        produit_name: '',
        quantite: 1,
        prix_achat: '',
        new_produit: { ...emptyNewProduit },
      },
    ]);
  };

  const removeItem = (index: number) => {
    const next = data.items.filter((_, i) => i !== index);
    setData('items', next.length ? next : data.items);
  };

  const updateItem = (index: number, patch: Partial<AchatItemForm>) => {
    const next = [...data.items];
    next[index] = { ...next[index], ...patch };
    setData('items', next);
  };

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

  const updatePrixAchatForNew = (index: number, value: string) => {
    const next = [...data.items];
    const current = next[index];
    const prixAchat = parseNumber(value);
    const lastChanged = lastChangedByIndex[index] ?? null;

    if (!current) return;

    if (!prixAchat || prixAchat <= 0) {
      next[index].prix_achat = value;
      if (lastChanged === 'profit_pct') {
        next[index].new_produit.prix_vente = '';
      }
      if (lastChanged === 'prix_vente') {
        next[index].new_produit.profit_pct = '';
      }
      setData('items', next);
      return;
    }

    if (lastChanged === 'profit_pct') {
      const profitPct = parseNumber(current.new_produit.profit_pct);
      next[index].prix_achat = value;
      next[index].new_produit.prix_vente = computePrixVente(prixAchat, profitPct);
      setData('items', next);
      return;
    }

    if (lastChanged === 'prix_vente') {
      const prixVente = parseNumber(current.new_produit.prix_vente);
      next[index].prix_achat = value;
      next[index].new_produit.profit_pct = computeProfitPercent(prixAchat, prixVente);
      setData('items', next);
      return;
    }

    next[index].prix_achat = value;
    setData('items', next);
  };

  const handleSelectProduit = (index: number, produitId: number) => {
    const selected = produits.find((p) => p.id === produitId);
    updateItem(index, {
      produit_id: produitId,
      produit_name: selected ? selected.name : '',
      prix_achat: selected ? String(selected.prix_achat) : '',
    });
  };

  useEffect(() => {
    if (!data.fournisseur_name) {
      return;
    }

    const match = fournisseurs.find((f) => f.name === data.fournisseur_name);
    if (match && data.fournisseur_id !== match.id) {
      setData('fournisseur_id', match.id);
    }
  }, [data.fournisseur_name, data.fournisseur_id, fournisseurs, setData]);

  const handleCreateFournisseur = () => {
    const name = newFournisseurName.trim();
    if (!name || creatingFournisseur) {
      return;
    }

    setCreatingFournisseur(true);
    router.post('/fournisseurs', {
      name,
      type: newFournisseurType,
      status: 'actif',
      redirect_to: '/achats/create',
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setData('fournisseur_name', name);
        setNewFournisseurName('');
        setOpenFournisseurDialog(false);
      },
      onFinish: () => setCreatingFournisseur(false),
    });
  };

  const handleCreateCategory = () => {
    const name = newCategoryName.trim();
    if (!name || creatingCategory) {
      return;
    }

    setCreatingCategory(true);
    router.post('/product-categories', {
      name,
      redirect_to: '/achats/create',
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setNewCategoryName('');
        setOpenCategoryDialog(false);
      },
      onFinish: () => setCreatingCategory(false),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmOpen(false);
    post('/achats');
  };

  const formatValue = (value: number | null) => {
    if (value === null) return '-';
    return formatNumber(value);
  };

  const getLineTotal = (item: AchatItemForm) => {
    const prixAchat = parseNumber(item.prix_achat);
    if (prixAchat === null) return null;
    return prixAchat * item.quantite;
  };

  const totalHt = data.items.reduce((sum, item) => {
    const prixAchat = parseNumber(item.prix_achat);
    if (prixAchat === null) return sum;
    return sum + prixAchat * item.quantite;
  }, 0);
  const remiseValue = parseNumber(data.remise) ?? 0;
  const tvaRate = parseNumber(data.tva_rate) ?? 0;
  const totalApresRemise = Math.max(totalHt - remiseValue, 0);
  const totalTva = totalApresRemise * (tvaRate / 100);
  const totalTtc = totalApresRemise + totalTva;
  useEffect(() => {
    // Set montant_paye to totalTtc if not manually changed
    if (!data.montant_paye) {
      setData('montant_paye', totalTtc.toFixed(2));
    }
  }, [totalTtc]);

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/achats">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Nouvel achat</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Renseignez les informations de l'achat</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                    {/* Montant payé field removed as requested */}
              <div className="space-y-2">
                <label className="font-medium">Date <span className="text-destructive">*</span></label>
                <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} required />
                {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <label className="font-medium">Fournisseur</label>
                <label className="font-medium">Fournisseur <span className="text-destructive">*</span></label>
                <Input
                  value={data.fournisseur_name}
                  onChange={(e) => {
                    const value = e.target.value;
                    const match = fournisseurs.find((f) => f.name === value);
                    setData('fournisseur_name', value);
                    setData('fournisseur_id', match ? match.id : '');
                  }}
                  placeholder="Nom du fournisseur"
                  list="fournisseurs-options"
                  required
                />
                <datalist id="fournisseurs-options">
                  {fournisseurs.map((f) => (
                    <option key={f.id} value={f.name} />
                  ))}
                </datalist>
                {errors.fournisseur_id && <p className="text-sm text-destructive">{errors.fournisseur_id}</p>}
                <Dialog open={openFournisseurDialog} onOpenChange={setOpenFournisseurDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="mt-3">
                      <Plus className="mr-1 h-4 w-4" /> Ajouter un fournisseur
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouveau fournisseur</DialogTitle>
                      <DialogDescription>Créez rapidement un fournisseur.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nom</label>
                        <Input
                          value={newFournisseurName}
                          onChange={(e) => setNewFournisseurName(e.target.value)}
                          placeholder="Nom du fournisseur"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={newFournisseurType}
                          onValueChange={(value) => setNewFournisseurType(value as 'personne' | 'societe')}
                        >
                          <SelectTrigger className="w-full">
                            {newFournisseurType === 'personne' ? 'Personne' : 'Société'}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personne">Personne</SelectItem>
                            <SelectItem value="societe">Société</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpenFournisseurDialog(false)}>
                        Annuler
                      </Button>
                      <Button type="button" onClick={handleCreateFournisseur} disabled={creatingFournisseur}>
                        Ajouter
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                <label className="font-medium">Remise (DH)</label>
                <Input type="number" min="0" step="0.01" value={data.remise} onChange={(e) => setData('remise', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="font-medium">TVA (%)</label>
                <Input type="number" min="0" step="0.01" value={data.tva_rate} onChange={(e) => setData('tva_rate', e.target.value)} />
              </div>
              {/* Méthode de paiement field removed as requested */}
              <div className="space-y-2 md:col-span-2">
                <label className="font-medium">Notes</label>
                <Input value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Notes..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produits</CardTitle>
              <CardDescription>Ajoutez les produits achetés</CardDescription>
              <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
                <DialogTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="mt-4 w-fit justify-start border border-border/60 text-primary">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une catégorie
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouvelle catégorie</DialogTitle>
                    <DialogDescription>Ajoutez une catégorie sans quitter l'achat.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nom de la catégorie"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenCategoryDialog(false)}>
                      Annuler
                    </Button>
                    <Button type="button" onClick={handleCreateCategory} disabled={creatingCategory}>
                      Ajouter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.items.map((item, index) => (
                <div key={index} className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">Produit #{index + 1}</p>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="font-medium">Type</label>
                      <Select
                        value={item.mode}
                        onValueChange={(value) => {
                          updateItem(index, {
                            mode: value as AchatItemForm['mode'],
                            produit_id: '',
                            produit_name: '',
                            new_produit: { ...emptyNewProduit },
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          {item.mode === 'existing' ? 'Produit existant' : 'Nouveau produit'}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="existing">Produit existant</SelectItem>
                          <SelectItem value="new">Nouveau produit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {item.mode === 'existing' ? (
                        <div className="space-y-2 md:col-span-2">
                          <label className="font-medium">Produit</label>
                          <ProductAutocomplete
                            value={item.produit_name}
                            onChange={(value, selected) => {
                              if (selected && typeof selected.id === 'number') {
                                updateItem(index, {
                                  produit_id: selected.id,
                                  produit_name: selected.name,
                                  prix_achat: String(selected.prix_achat),
                                });
                              } else {
                                updateItem(index, {
                                  produit_id: '',
                                  produit_name: value,
                                  prix_achat: '',
                                });
                              }
                            }}
                            options={produits.map(p => ({
                              ...p,
                              quantite: typeof p.quantite === 'number' ? p.quantite : (typeof p.stock === 'number' ? p.stock : 0)
                            }))}
                            placeholder="Nom du produit"
                            displayQuantity
                            allowZeroQuantitySelect
                            error={errors[`items.${index}.produit_id`]}
                          />
                        </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="font-medium">Nom</label>
                          <Input
                            value={item.new_produit.name}
                            onChange={(e) => {
                              const next = [...data.items];
                              next[index].new_produit.name = e.target.value;
                              setData('items', next);
                            }}
                            placeholder="Nom du produit"
                          />
                          {errors[`items.${index}.new_produit.name`] && (
                            <p className="text-sm text-destructive">{errors[`items.${index}.new_produit.name`]}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium">Code barre</label>
                          <Input
                            value={item.new_produit.code_barre}
                            onChange={(e) => {
                              const next = [...data.items];
                              next[index].new_produit.code_barre = e.target.value;
                              setData('items', next);
                            }}
                            placeholder="Code barre"
                          />
                          {errors[`items.${index}.new_produit.code_barre`] && (
                            <p className="text-sm text-destructive">{errors[`items.${index}.new_produit.code_barre`]}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium">Catégorie</label>
                          <Input
                            value={item.new_produit.category_name}
                            onChange={(e) => {
                              const value = e.target.value;
                              const match = categories.find((c) => c.name === value);
                              const next = [...data.items];
                              next[index].new_produit.category_name = value;
                              next[index].new_produit.category_id = match ? match.id : '';
                              setData('items', next);
                            }}
                            placeholder="Nom de catégorie"
                            list={`categories-options-${index}`}
                          />
                          <datalist id={`categories-options-${index}`}>
                            {categories.map((c) => (
                              <option key={c.id} value={c.name} />
                            ))}
                          </datalist>
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium">Fournisseur</label>
                          <Input
                            value={item.new_produit.fournisseur_name}
                            onChange={(e) => {
                              const value = e.target.value;
                              const match = fournisseurs.find((f) => f.name === value);
                              const next = [...data.items];
                              next[index].new_produit.fournisseur_name = value;
                              next[index].new_produit.fournisseur_id = match ? match.id : '';
                              setData('items', next);
                            }}
                            placeholder="Nom du fournisseur"
                            list={`new-fournisseurs-options-${index}`}
                          />
                          <datalist id={`new-fournisseurs-options-${index}`}>
                            {fournisseurs.map((f) => (
                              <option key={f.id} value={f.name} />
                            ))}
                          </datalist>
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium">Quantité</label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantite}
                            onChange={(e) => updateItem(index, { quantite: Number(e.target.value) })}
                          />
                          {errors[`items.${index}.quantite`] && (
                            <p className="text-sm text-destructive">{errors[`items.${index}.quantite`]}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium">Prix d'achat</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.prix_achat}
                            onChange={(e) => updatePrixAchatForNew(index, e.target.value)}
                          />
                          {errors[`items.${index}.prix_achat`] && (
                            <p className="text-sm text-destructive">{errors[`items.${index}.prix_achat`]}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium">Prix de vente</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.new_produit.prix_vente}
                            onChange={(e) => {
                              setLastChangedByIndex((prev) => ({ ...prev, [index]: 'prix_vente' }));
                              const next = [...data.items];
                              const prixAchat = parseNumber(next[index].prix_achat);
                              const prixVente = parseNumber(e.target.value);
                              next[index].new_produit.prix_vente = e.target.value;
                              next[index].new_produit.profit_pct = computeProfitPercent(prixAchat, prixVente);
                              setData('items', next);
                            }}
                            placeholder="Prix de vente"
                          />
                          {errors[`items.${index}.new_produit.prix_vente`] && (
                            <p className="text-sm text-destructive">{errors[`items.${index}.new_produit.prix_vente`]}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium">Pourcentage de profit (%)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.new_produit.profit_pct}
                            onChange={(e) => {
                              setLastChangedByIndex((prev) => ({ ...prev, [index]: 'profit_pct' }));
                              const next = [...data.items];
                              const prixAchat = parseNumber(next[index].prix_achat);
                              const profitPct = parseNumber(e.target.value);
                              next[index].new_produit.profit_pct = e.target.value;
                              next[index].new_produit.prix_vente = computePrixVente(prixAchat, profitPct);
                              setData('items', next);
                            }}
                            placeholder="Ex: 50"
                          />
                        </div>
                      </>
                    )}

                    {item.mode === 'existing' && (
                      <>
                        <div className="space-y-2">
                          <label className="font-medium">Quantité</label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantite}
                            onChange={(e) => updateItem(index, { quantite: Number(e.target.value) })}
                          />
                          {errors[`items.${index}.quantite`] && (
                            <p className="text-sm text-destructive">{errors[`items.${index}.quantite`]}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium">Prix d'achat</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.prix_achat}
                            onChange={(e) => updateItem(index, { prix_achat: e.target.value })}
                          />
                          {errors[`items.${index}.prix_achat`] && (
                            <p className="text-sm text-destructive">{errors[`items.${index}.prix_achat`]}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={processing}>Enregistrer l'achat</Button>
          </div>
        </form>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'achat</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <MultiStepConfirmation
              data={data}
              errors={errors}
              setData={setData}
              totalHt={totalHt}
              totalApresRemise={totalApresRemise}
              totalTva={totalTva}
              totalTtc={totalTtc}
              onConfirm={handleConfirmSubmit}
              onCancel={() => setConfirmOpen(false)}
            />
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
