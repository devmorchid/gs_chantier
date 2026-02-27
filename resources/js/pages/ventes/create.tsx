import AppLayout from '@/layouts/app-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import VenteMultiStepConfirmation from '@/components/ui/vente-multi-step-confirmation';
import { Input } from '@/components/ui/input';
import { ProductAutocomplete } from '@/components/ui/product-autocomplete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
const modesPaiement: Record<string, string> = {
  espece: 'Espèces',
  cheque: 'Chèque',
  virement: 'Virement',
  carte: 'Carte bancaire',
  autre: 'Autre',
};
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';

interface ProduitOption {
  id: number;
  name: string;
  prix_vente: number | string | null;
  code_barre: string;
  stock_disponible: number | string | null;
}

interface ClientOption {
  id: number;
  nom: string;
  reference: string;
}

interface VenteItemForm {
  produit_id: number | '';
  produit_name: string;
  quantite: number;
  prix_vente: string;
}

interface VenteForm {
  date: string;
  client_id: number | '';
  client_name: string;
  remise: string;
  tva_rate: string;
  notes: string;
  mode_paiement: string;
  montant_paye: string;
  items: VenteItemForm[];
}

interface Props {
  produits: ProduitOption[];
  clients: ClientOption[];
}

export default function VentesCreate({ produits, clients }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [stockErrors, setStockErrors] = useState<Record<number, string>>({});
  const { data, setData, post, processing, errors } = useForm<VenteForm>({
    date: '',
    client_id: '',
    client_name: '',
    remise: '0',
    tva_rate: '0',
    notes: '',
    mode_paiement: '',
    montant_paye: '',
    items: [
      { produit_id: '', produit_name: '', quantite: 1, prix_vente: '' },
    ],
  });

  const updateItem = (index: number, patch: Partial<VenteItemForm>) => {
    const next = [...data.items];
    next[index] = { ...next[index], ...patch };
    setData('items', next);
  };

  const getStockDisponible = (produitId: number | '') => {
    if (produitId === '') return 0;
    const produit = produits.find((p) => p.id === produitId);
    const stock = Number(produit?.stock_disponible ?? 0);
    return Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;
  };

  const getStockMessage = (item: VenteItemForm) => {
    if (item.produit_id === '') return null;

    const stockDisponible = getStockDisponible(item.produit_id);
    if (stockDisponible <= 0) {
      return 'Stock indisponible pour ce produit.';
    }

    if (item.quantite > stockDisponible) {
      return `Quantité maximale disponible: ${stockDisponible}.`;
    }

    return null;
  };

  const handleSelectProduit = (index: number, produitId: number) => {
    const produit = produits.find((p) => p.id === produitId);
    const stockDisponible = getStockDisponible(produitId);
    const quantiteActuelle = data.items[index]?.quantite ?? 1;
    const quantiteValide = stockDisponible > 0
      ? Math.min(Math.max(quantiteActuelle, 1), stockDisponible)
      : 1;

    updateItem(index, {
      produit_name: produit ? produit.name : '',
      produit_id: produit ? produit.id : '',
      prix_vente: produit ? formatNumber(produit.prix_vente) : '',
      quantite: quantiteValide,
    });

    const message = produit ? getStockMessage({
      produit_id: produit.id,
      produit_name: produit.name,
      prix_vente: formatNumber(produit.prix_vente),
      quantite: quantiteValide,
    }) : null;

    setStockErrors((prev) => {
      const next = { ...prev };
      if (message) {
        next[index] = message;
      } else {
        delete next[index];
      }
      return next;
    });
  };

  const addItem = () => {
    setStockErrors({});
    setData('items', [
      ...data.items,
      { produit_id: '', produit_name: '', quantite: 1, prix_vente: '' },
    ]);
  };

  const removeItem = (index: number) => {
    setStockErrors({});
    const next = data.items.filter((_, i) => i !== index);
    setData('items', next.length ? next : data.items);
  };

  const parseNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatNumber = (value: number | string | null | undefined) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return '';
    return numericValue.toFixed(2);
  };

  const getLineTotal = (item: VenteItemForm) => {
    const prixVente = parseNumber(item.prix_vente);
    if (prixVente === null) return null;
    return prixVente * item.quantite;
  };

  const totalHt = useMemo(
    () => data.items.reduce((sum, item) => {
      const prixVente = parseNumber(item.prix_vente);
      if (prixVente === null) return sum;
      return sum + prixVente * item.quantite;
    }, 0),
    [data.items],
  );
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextStockErrors: Record<number, string> = {};
    data.items.forEach((item, index) => {
      const message = getStockMessage(item);
      if (message) {
        nextStockErrors[index] = message;
      }
    });

    setStockErrors(nextStockErrors);
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmOpen(false);
    post('/ventes');
  };

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/ventes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Nouvelle vente</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Renseignez les informations de la vente</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-medium">Date <span className="text-destructive">*</span></label>
                <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} required />
                {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <label className="font-medium">Client (optionnel)</label>
                <Input
                  value={data.client_name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setData('client_name', value);
                    const match = clients.find((c) => c.nom === value);
                    setData('client_id', match ? match.id : '');
                  }}
                  placeholder="Nom du client"
                  list="clients-options"
                />
                <datalist id="clients-options">
                  {clients.map((client) => (
                    <option key={client.id} value={client.nom} />
                  ))}
                </datalist>
                {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
              </div>
              <div className="space-y-2">
                <label className="font-medium">Remise (DH)</label>
                <Input type="number" min="0" step="0.01" value={data.remise} onChange={(e) => setData('remise', e.target.value)} />
                {errors.remise && <p className="text-sm text-destructive">{errors.remise}</p>}
              </div>
              <div className="space-y-2">
                <label className="font-medium">TVA (%)</label>
                <Input type="number" min="0" step="0.01" value={data.tva_rate} onChange={(e) => setData('tva_rate', e.target.value)} />
                {errors.tva_rate && <p className="text-sm text-destructive">{errors.tva_rate}</p>}
              </div>
              {/* Mode de paiement field removed from Informations générales. Now only in confirmation popup. */}
              <div className="space-y-2 md:col-span-2">
                <label className="font-medium">Notes</label>
                <Input value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Notes..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produits</CardTitle>
              <CardDescription>Ajoutez les produits vendus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.items.map((item, index) => (
                <div key={index} className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">Produit #{index + 1}</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeItem(index)} disabled={data.items.length === 1}>
                      <Trash2 className="mr-2 h-4 w-4" /> Retirer
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="font-medium">Produit <span className="text-destructive">*</span></label>
                      <ProductAutocomplete
                        value={item.produit_name}
                        onChange={(value, selected) => {
                          if (selected && typeof selected.id === 'number') {
                            handleSelectProduit(index, selected.id);
                          } else {
                            // If user types a value that doesn't match, clear produit_id/prix_vente
                            updateItem(index, {
                              produit_name: value,
                              produit_id: '',
                              prix_vente: '',
                            });
                          }
                        }}
                        options={produits.map(p => ({
                          ...p,
                          quantite: Number.isFinite(Number(p.stock_disponible)) ? Number(p.stock_disponible) : 0
                        }))}
                        placeholder="Nom du produit"
                        displayQuantity
                        error={errors[`items.${index}.produit_id`]}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-medium">Quantité <span className="text-destructive">*</span></label>
                      <Input
                        type="number"
                        min="1"
                        max={item.produit_id === '' ? undefined : getStockDisponible(item.produit_id)}
                        value={item.quantite}
                        onChange={(e) => {
                          const requestedQuantity = Number(e.target.value) || 1;
                          const stockDisponible = getStockDisponible(item.produit_id);

                          if (stockDisponible <= 0) {
                            updateItem(index, { quantite: 1 });
                            setStockErrors((prev) => ({
                              ...prev,
                              [index]: 'Stock indisponible pour ce produit.',
                            }));
                            return;
                          }

                          const clampedQuantity = Math.min(Math.max(requestedQuantity, 1), stockDisponible);
                          updateItem(index, { quantite: clampedQuantity });

                          setStockErrors((prev) => {
                            const next = { ...prev };
                            if (requestedQuantity > stockDisponible) {
                              next[index] = `Quantité maximale disponible: ${stockDisponible}.`;
                            } else {
                              delete next[index];
                            }
                            return next;
                          });
                        }}
                      />
                      {item.produit_id !== '' && (
                        <p className="text-xs text-muted-foreground">
                          Stock disponible: {getStockDisponible(item.produit_id)}
                        </p>
                      )}
                      {errors[`items.${index}.quantite`] && (
                        <p className="text-sm text-destructive">{errors[`items.${index}.quantite`]}</p>
                      )}
                      {!errors[`items.${index}.quantite`] && stockErrors[index] && (
                        <p className="text-sm text-destructive">{stockErrors[index]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="font-medium">Prix de vente <span className="text-destructive">*</span></label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.prix_vente}
                        readOnly
                        placeholder="Auto"
                      />
                      {errors[`items.${index}.prix_vente`] && (
                        <p className="text-sm text-destructive">{errors[`items.${index}.prix_vente`]}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 rounded-md border border-border/60 bg-background p-3 text-sm">
                    Total ligne: <span className="font-medium">{(getLineTotal(item) ?? 0).toFixed(2)} DH</span>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="flex items-center justify-between"><span>Total HT</span><span>{totalHt.toFixed(2)} DH</span></div>
              <div className="flex items-center justify-between"><span>Total après remise</span><span>{totalApresRemise.toFixed(2)} DH</span></div>
              <div className="flex items-center justify-between"><span>TVA</span><span>{totalTva.toFixed(2)} DH</span></div>
              <div className="flex items-center justify-between text-base font-semibold"><span>Total TTC</span><span>{totalTtc.toFixed(2)} DH</span></div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.get('/ventes')}>Annuler</Button>
            <Button type="submit" disabled={processing}>Enregistrer la vente</Button>
          </div>
        </form>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <VenteMultiStepConfirmation
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
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
