import AppLayout from '@/layouts/app-layout';
import { Link, useForm, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Produit } from '@/types';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

interface StockMouvementForm {
  type: string;
  origine: string;
  destination: string;
  date: string;
  items: { produit: string; quantite: number }[];
}

type ChantierOption = {
  id: number;
  nom: string;
};

interface Props {
  produits: Produit[];
  chantiers: ChantierOption[];
  destinationChantiers: ChantierOption[];
  isChefChantier: boolean;
  produitsByChantier: Record<number, { id: number; name: string; quantite: number }[]>;
}

export default function StockMouvementsCreate({ produits, chantiers, destinationChantiers, isChefChantier, produitsByChantier }: Props) {
  const { data, setData, post, processing, errors } = useForm<StockMouvementForm>({
    type: 'transfert',
    origine: '',
    destination: '',
    date: '',
    items: [{ produit: '', quantite: 1 }],
  });
  const [showProduitSuggestions, setShowProduitSuggestions] = useState(false);
  const [activeProduitIndex, setActiveProduitIndex] = useState<number | null>(null);
  const [showOrigineSuggestions, setShowOrigineSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [localErrors, setLocalErrors] = useState<{ origine?: string; destination?: string }>({});

  const originChantier = useMemo(() => chantiers.find((chantier) => chantier.nom === data.origine), [chantiers, data.origine]);
  const originProduits = useMemo(() => {
    if (!data.origine) return [];
    if (data.origine === 'Depot') return produits;
    if (!originChantier) return [];
    return produitsByChantier[originChantier.id] ?? [];
  }, [data.origine, originChantier, produits, produitsByChantier]);

  const getFilteredProduits = (query: string, currentIndex: number) => {
    const normalized = query.trim().toLowerCase();
    const selectedNames = new Set(
      data.items
        .filter((_, index) => index !== currentIndex)
        .map((item) => item.produit)
        .filter(Boolean)
    );
    const base = originProduits.filter((produit) => !selectedNames.has(produit.name));
    if (!normalized) return base.slice(0, 8);
    return base.filter((produit) => produit.name.toLowerCase().includes(normalized)).slice(0, 8);
  };

  const depotOption = useMemo(() => ({ id: 0, nom: 'Depot' }), []);
  const allowedOriginNames = useMemo(() => {
    return new Set(isChefChantier ? chantiers.map((chantier) => chantier.nom) : [depotOption.nom, ...chantiers.map((chantier) => chantier.nom)]);
  }, [chantiers, depotOption.nom, isChefChantier]);

  const allowedDestinationNames = useMemo(() => {
    return new Set(isChefChantier ? destinationChantiers.map((chantier) => chantier.nom) : [depotOption.nom, ...destinationChantiers.map((chantier) => chantier.nom)]);
  }, [destinationChantiers, depotOption.nom, isChefChantier]);

  const filteredOrigines = useMemo(() => {
    const query = (data.origine ?? '').trim().toLowerCase();
    const matches = chantiers
      .filter((chantier) => chantier.nom.toLowerCase().includes(query))
      .slice(0, 7);
    return isChefChantier ? matches : [depotOption, ...matches];
  }, [data.origine, chantiers, depotOption, isChefChantier]);

  const filteredDestinations = useMemo(() => {
    const query = data.destination.trim().toLowerCase();
    const matches = destinationChantiers
      .filter((chantier) => chantier.nom.toLowerCase().includes(query))
      .slice(0, 7);
    return isChefChantier ? matches : [depotOption, ...matches];
  }, [data.destination, destinationChantiers, depotOption, isChefChantier]);

  useEffect(() => {
    if (data.origine === 'Depot' && data.destination === 'Depot') {
      setData('destination', '');
    }
  }, [data.origine, data.destination, setData]);

  useEffect(() => {
    if (data.destination === 'Depot' && data.origine === 'Depot') {
      setData('origine', '');
    }
  }, [data.destination, data.origine, setData]);

  useEffect(() => {
    if (isChefChantier) {
      setData('type', 'transfert');
    }
  }, [isChefChantier, setData]);

  const getSelectedProduit = (index: number) => {
    const name = data.items[index]?.produit ?? '';
    return originProduits.find((produit) => produit.name === name);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: { origine?: string; destination?: string } = {};
    if (data.origine && !allowedOriginNames.has(data.origine)) {
      nextErrors.origine = 'Valeur non valide. Choisissez une option.';
    }
    if (!allowedDestinationNames.has(data.destination)) {
      nextErrors.destination = 'Valeur non valide. Choisissez une option.';
    }
    setLocalErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    post('/stock-mouvements', data as unknown as Record<string, any>);
  }

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/stock-mouvements">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Ajouter un mouvement de stock</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Informations du mouvement</CardTitle>
              <CardDescription>
                Renseignez les informations principales du mouvement de stock
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Trajet du mouvement</p>
                  <p className="text-xs text-muted-foreground">D’où vient et où va le stock</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-medium">Origine</label>
                    <div className="relative">
                      <Input
                        value={data.origine ?? ''}
                        onChange={e => {
                          setData('origine', e.target.value);
                          setShowOrigineSuggestions(true);
                        }}
                        onFocus={() => setShowOrigineSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => setShowOrigineSuggestions(false), 120);
                          if (data.origine && !allowedOriginNames.has(data.origine)) {
                            setLocalErrors((prev) => ({
                              ...prev,
                              origine: 'Valeur non valide. Choisissez une option.',
                            }));
                            setData('origine', '');
                          } else {
                            setLocalErrors((prev) => ({ ...prev, origine: undefined }));
                          }
                        }}
                        placeholder="Ex: Dépôt central"
                        autoComplete="off"
                      />
                      {showOrigineSuggestions && filteredOrigines.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-border/60 bg-background shadow-lg">
                          <ul className="max-h-48 overflow-auto py-1 text-sm">
                            {filteredOrigines.map((chantier, index) => {
                              const depotDisabled = chantier.id === 0 && data.destination === 'Depot';
                              return (
                              <li key={`${chantier.id}-${index}`}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (depotDisabled) return;
                                    setData('origine', chantier.nom);
                                    setShowOrigineSuggestions(false);
                                  }}
                                  disabled={depotDisabled}
                                  aria-disabled={depotDisabled}
                                  className={
                                    chantier.id === 0
                                      ? depotDisabled
                                        ? 'flex w-full items-center px-3 py-2 text-left font-semibold text-muted-foreground bg-muted/40 cursor-not-allowed'
                                        : 'flex w-full items-center px-3 py-2 text-left font-semibold text-foreground bg-muted/80'
                                      : 'flex w-full items-center px-3 py-2 text-left hover:bg-muted/60'
                                  }
                                >
                                  <span className="truncate">{chantier.nom}</span>
                                </button>
                              </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isChefChantier ? 'Origine obligatoire (vos chantiers).' : 'Origine obligatoire pour filtrer les produits.'}
                    </p>
                    {errors.origine && <div className="text-red-500 text-xs mt-1">{errors.origine}</div>}
                    {localErrors.origine && <div className="text-red-500 text-xs mt-1">{localErrors.origine}</div>}
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Destination <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <Input
                        value={data.destination}
                        onChange={e => {
                          setData('destination', e.target.value);
                          setShowDestinationSuggestions(true);
                        }}
                        onFocus={() => setShowDestinationSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => setShowDestinationSuggestions(false), 120);
                          if (!allowedDestinationNames.has(data.destination)) {
                            setLocalErrors((prev) => ({
                              ...prev,
                              destination: 'Valeur non valide. Choisissez une option.',
                            }));
                            setData('destination', '');
                          } else {
                            setLocalErrors((prev) => ({ ...prev, destination: undefined }));
                          }
                        }}
                        required
                        placeholder="Ex: Chantier Racine F"
                        autoComplete="off"
                      />
                      {showDestinationSuggestions && filteredDestinations.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-border/60 bg-background shadow-lg">
                          <ul className="max-h-48 overflow-auto py-1 text-sm">
                            {filteredDestinations.map((chantier, index) => {
                              const depotDisabled = chantier.id === 0 && data.origine === 'Depot';
                              return (
                              <li key={`${chantier.id}-${index}`}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (depotDisabled) return;
                                    setData('destination', chantier.nom);
                                    setShowDestinationSuggestions(false);
                                  }}
                                  disabled={depotDisabled}
                                  aria-disabled={depotDisabled}
                                  className={
                                    chantier.id === 0
                                      ? depotDisabled
                                        ? 'flex w-full items-center px-3 py-2 text-left font-semibold text-muted-foreground bg-muted/40 cursor-not-allowed'
                                        : 'flex w-full items-center px-3 py-2 text-left font-semibold text-foreground bg-muted/80'
                                      : 'flex w-full items-center px-3 py-2 text-left hover:bg-muted/60'
                                  }
                                >
                                  <span className="truncate">{chantier.nom}</span>
                                </button>
                              </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Indiquez le lieu ou l’équipe de destination.</p>
                    {errors.destination && <div className="text-red-500 text-xs mt-1">{errors.destination}</div>}
                    {localErrors.destination && <div className="text-red-500 text-xs mt-1">{localErrors.destination}</div>}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Produit & type</p>
                    <p className="text-xs text-muted-foreground">Identifiez clairement le mouvement</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Champs requis *</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-medium">Produits <span className="text-destructive">*</span></label>
                    <div className="space-y-3">
                      {data.items.map((item, index) => {
                        const filteredProduits = getFilteredProduits(item.produit, index);
                        const selectedProduit = getSelectedProduit(index);
                        const maxQuantite = selectedProduit?.quantite;
                        const quantityLabel = data.origine === 'Depot' ? 'Qté dépôt' : 'Qté chantier';
                        return (
                          <div key={index} className="grid gap-2 md:grid-cols-[2fr_1fr_auto] items-start">
                            <div className="relative">
                              <Input
                                value={item.produit}
                                onChange={(e) => {
                                  const next = [...data.items];
                                  next[index] = { ...next[index], produit: e.target.value };
                                  setData('items', next);
                                  setActiveProduitIndex(index);
                                  setShowProduitSuggestions(true);
                                }}
                                onFocus={() => {
                                  setActiveProduitIndex(index);
                                  setShowProduitSuggestions(true);
                                }}
                                onBlur={() => setTimeout(() => setShowProduitSuggestions(false), 120)}
                                  disabled={!data.origine}
                                required
                                placeholder={
                                    !data.origine
                                      ? 'Sélectionnez une origine'
                                    : 'Nom du produit'
                                }
                                autoComplete="off"
                              />
                              {showProduitSuggestions && activeProduitIndex === index && filteredProduits.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full rounded-md border border-border/60 bg-background shadow-lg">
                                  <ul className="max-h-48 overflow-auto py-1 text-sm">
                                    {filteredProduits.map((produit) => (
                                      <li key={produit.id}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const next = [...data.items];
                                            next[index] = { ...next[index], produit: produit.name };
                                            setData('items', next);
                                            setShowProduitSuggestions(false);
                                          }}
                                          className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted/60"
                                        >
                                          <span className="truncate">{produit.name}</span>
                                          <span className="text-xs text-muted-foreground">{quantityLabel}: {produit.quantite ?? 0}</span>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {data.origine && data.origine !== 'Depot' && selectedProduit && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Disponible chantier: {selectedProduit.quantite ?? 0}
                                </p>
                              )}
                            </div>
                            <Input
                              type="number"
                              min={1}
                              max={isChefChantier && typeof maxQuantite === 'number' ? Math.max(maxQuantite, 1) : undefined}
                              value={item.quantite}
                              onChange={(e) => {
                                const nextValue = Number(e.target.value);
                                const next = [...data.items];
                                if (isChefChantier && typeof maxQuantite === 'number') {
                                  next[index] = { ...next[index], quantite: Math.min(nextValue, Math.max(maxQuantite, 1)) };
                                } else {
                                  next[index] = { ...next[index], quantite: nextValue };
                                }
                                setData('items', next);
                              }}
                              required
                            />
                            <div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const next = data.items.filter((_, i) => i !== index);
                                  setData('items', next.length ? next : [{ produit: '', quantite: 1 }]);
                                }}
                              >
                                Retirer
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setData('items', [...data.items, { produit: '', quantite: 1 }])}
                      >
                        Ajouter un produit
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Sélectionnez une origine pour afficher les produits.</p>
                    {errors.items && <div className="text-red-500 text-xs mt-1">{errors.items}</div>}
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Type <span className="text-destructive">*</span></label>
                    <Select value={data.type} onValueChange={(v: string) => setData('type', v)} required disabled={isChefChantier}>
                      <SelectTrigger className="w-full">
                        {data.type === 'transfert' ? 'Transfert' : data.type === 'retour' ? 'Retour' : 'Sélectionner...'}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transfert">Transfert</SelectItem>
                        {!isChefChantier && <SelectItem value="retour">Retour</SelectItem>}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Choisissez la nature du mouvement.</p>
                    {errors.type && <div className="text-red-500 text-xs mt-1">{errors.type}</div>}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Date</p>
                  <p className="text-xs text-muted-foreground">Définissez la date du mouvement</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-medium">Date <span className="text-destructive">*</span></label>
                    <Input
                      type="date"
                      value={data.date}
                      onChange={e => setData('date', e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Date effective du mouvement.</p>
                    {errors.date && <div className="text-red-500 text-xs mt-1">{errors.date}</div>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.get('/stock-mouvements')}>Annuler</Button>
            <Button type="submit" disabled={processing}>Créer</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
