import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Eye, Package, Boxes, Barcode, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Produit {
  id: number;
  code_barre: string;
  name: string;
  category?: { id: number; name: string } | null;
  prix_achat: string;
  prix_vente: string;
  fournisseur?: { id: number; name: string } | null;
  quantite?: number | string | null;
}

interface Props {
  produits: {
    data: Produit[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  filters: {
    name?: string;
    code_barre?: string;
    category?: string;
    fournisseur?: string;
    prix_min?: string;
    prix_max?: string;
  };
  nameOptions: string[];
  codeOptions: string[];
  categoryOptions: string[];
  fournisseurOptions: string[];
  priceMin: number;
  priceMax: number;
}

export default function ProduitsIndex({
  produits,
  filters,
  nameOptions,
  codeOptions,
  categoryOptions,
  fournisseurOptions,
  priceMin,
  priceMax,
}: Props) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filterState, setFilterState] = useState({
    name: filters.name ?? '',
    code_barre: filters.code_barre ?? '',
    category: filters.category ?? '',
    fournisseur: filters.fournisseur ?? '',
    prix_min: filters.prix_min ?? '',
    prix_max: filters.prix_max ?? '',
  });
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const [minInputDraft, setMinInputDraft] = useState<string | null>(null);
  const [maxInputDraft, setMaxInputDraft] = useState<string | null>(null);
  const [activeFilterField, setActiveFilterField] = useState<'category' | 'fournisseur' | null>(null);
  const didMount = useRef(false);

  const isSameFilters = (left: typeof filterState, right: typeof filterState) =>
    left.name === right.name &&
    left.code_barre === right.code_barre &&
    left.category === right.category &&
    left.fournisseur === right.fournisseur &&
    left.prix_min === right.prix_min &&
    left.prix_max === right.prix_max;

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      router.delete(`/produits/${deleteId}`);
      setOpen(false);
      setDeleteId(null);
    }
  };

  useEffect(() => {
    const nextState = {
      name: filters.name ?? '',
      code_barre: filters.code_barre ?? '',
      category: filters.category ?? '',
      fournisseur: filters.fournisseur ?? '',
      prix_min: filters.prix_min ?? '',
      prix_max: filters.prix_max ?? '',
    };

    if (!isSameFilters(filterState, nextState)) {
      setFilterState(nextState);
    }
  }, [filters]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (activeFilterField === 'category' || activeFilterField === 'fournisseur') {
      return;
    }

    if (isSameFilters(filterState, {
      name: filters.name ?? '',
      code_barre: filters.code_barre ?? '',
      category: filters.category ?? '',
      fournisseur: filters.fournisseur ?? '',
      prix_min: filters.prix_min ?? '',
      prix_max: filters.prix_max ?? '',
    })) {
      return;
    }
    const timer = setTimeout(() => {
      router.get('/produits', filterState, { preserveState: true, replace: true, preserveScroll: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [filterState, activeFilterField]);

  const submitFilters = (nextFilters: typeof filterState) => {
    router.get('/produits', nextFilters, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const resetFilters = () => {
    const cleared = {
      name: '',
      code_barre: '',
      category: '',
      fournisseur: '',
      prix_min: '',
      prix_max: '',
    };
    setFilterState(cleared);
    router.get('/produits', {}, { preserveState: true, replace: true, preserveScroll: true });
  };

  const priceMinBound = Number.isFinite(priceMin) ? Math.floor(priceMin) : 0;
  const priceMaxBound = Number.isFinite(priceMax) ? Math.ceil(priceMax) : 0;
  const safeMaxBound = priceMaxBound > priceMinBound ? priceMaxBound : priceMinBound + 1;
  const parsedMin = filterState.prix_min !== '' ? Number(filterState.prix_min) : priceMinBound;
  const parsedMax = filterState.prix_max !== '' ? Number(filterState.prix_max) : safeMaxBound;
  const currentMin = Number.isFinite(parsedMin) ? parsedMin : priceMinBound;
  const currentMax = Number.isFinite(parsedMax) ? parsedMax : safeMaxBound;
  const boundedMin = Math.max(priceMinBound, Math.min(currentMin, safeMaxBound));
  const boundedMax = Math.max(priceMinBound, Math.min(currentMax, safeMaxBound));
  const clampedMin = boundedMin;
  const clampedMax = Math.max(boundedMax, boundedMin);
  const rangeSpan = safeMaxBound - priceMinBound || 1;
  const minPercent = ((clampedMin - priceMinBound) / rangeSpan) * 100;
  const maxPercent = ((clampedMax - priceMinBound) / rangeSpan) * 100;

  const normalizeMinValue = (raw: number, currentMaxRaw: number) => {
    const currentMaxNormalized = Number.isFinite(currentMaxRaw)
      ? Math.max(priceMinBound, Math.min(currentMaxRaw, safeMaxBound))
      : safeMaxBound;

    const minNormalized = Number.isFinite(raw)
      ? Math.max(priceMinBound, Math.min(raw, currentMaxNormalized))
      : priceMinBound;

    return {
      min: minNormalized,
      max: Math.max(currentMaxNormalized, minNormalized),
    };
  };

  const normalizeMaxValue = (raw: number, currentMinRaw: number) => {
    const currentMinNormalized = Number.isFinite(currentMinRaw)
      ? Math.max(priceMinBound, Math.min(currentMinRaw, safeMaxBound))
      : priceMinBound;

    const maxNormalized = Number.isFinite(raw)
      ? Math.max(currentMinNormalized, Math.min(raw, safeMaxBound))
      : safeMaxBound;

    return {
      min: currentMinNormalized,
      max: maxNormalized,
    };
  };

  const commitMinDraftValue = () => {
    setFilterState((prev) => {
      const draftSource = minInputDraft ?? prev.prix_min ?? String(priceMinBound);
      const draftRaw = Number(draftSource);
      const currentMinRaw = Number.isFinite(draftRaw) ? draftRaw : priceMinBound;
      const currentMaxRaw = Number(prev.prix_max || safeMaxBound);
      const next = normalizeMinValue(currentMinRaw, currentMaxRaw);

      return {
        ...prev,
        prix_min: String(next.min),
        prix_max: String(next.max),
      };
    });
    setMinInputDraft(null);
  };

  const commitMaxDraftValue = () => {
    setFilterState((prev) => {
      const draftSource = maxInputDraft ?? prev.prix_max ?? String(safeMaxBound);
      const draftRaw = Number(draftSource);
      const currentMaxRaw = Number.isFinite(draftRaw) ? draftRaw : safeMaxBound;
      const currentMinRaw = Number(prev.prix_min || priceMinBound);
      const next = normalizeMaxValue(currentMaxRaw, currentMinRaw);

      return {
        ...prev,
        prix_min: String(next.min),
        prix_max: String(next.max),
      };
    });
    setMaxInputDraft(null);
  };

  return (
    <AppLayout>
      <Head title="Produits" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Produits</h1>
              <p className="text-muted-foreground">Gérez vos produits et consultez l'inventaire.</p>
            </div>
            <Button asChild>
              <Link href="/produits/create">
                <Plus className="mr-2 h-4 w-4" /> Nouveau produit
              </Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Boxes className="h-4 w-4" />
                </span>
                Total produits
              </div>
              <p className="text-2xl font-semibold">{produits.total}</p>
              <p className="text-xs text-muted-foreground">Références enregistrées</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Package className="h-4 w-4" />
                </span>
                Affichage
              </div>
              <p className="text-2xl font-semibold">
                {produits.from ?? 0}-{produits.to ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Éléments visibles</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Barcode className="h-4 w-4" />
                </span>
                Derniers ajouts
              </div>
              <p className="text-2xl font-semibold">{produits.data.length}</p>
              <p className="text-xs text-muted-foreground">Sur cette page</p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Liste des produits</CardTitle>
            <p className="text-sm text-muted-foreground">
              Consultez l’inventaire et gérez vos références produits.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Filtres</p>
                  <p className="text-xs text-muted-foreground">Recherchez par nom, code, catégorie, fournisseur</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={resetFilters}>Réinitialiser</Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters((prev) => !prev)}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </div>
              {showFilters && (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom</label>
                      <Input
                        value={filterState.name}
                        onChange={(e) => setFilterState({ ...filterState, name: e.target.value })}
                        placeholder="Nom du produit"
                        list="produit-noms"
                      />
                      <datalist id="produit-noms">
                        {nameOptions.map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Code barre</label>
                      <Input
                        value={filterState.code_barre}
                        onChange={(e) => setFilterState({ ...filterState, code_barre: e.target.value })}
                        placeholder="Code barre"
                        list="produit-codes"
                      />
                      <datalist id="produit-codes">
                        {codeOptions.map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Catégorie</label>
                      <Input
                        value={filterState.category}
                        onChange={(e) => setFilterState({ ...filterState, category: e.target.value })}
                        onFocus={() => setActiveFilterField('category')}
                        onBlur={() => {
                          setActiveFilterField(null);
                          submitFilters({ ...filterState });
                        }}
                        placeholder="Catégorie"
                        list="categorie-options"
                      />
                      <datalist id="categorie-options">
                        {categoryOptions.map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fournisseur</label>
                      <Input
                        value={filterState.fournisseur}
                        onChange={(e) => setFilterState({ ...filterState, fournisseur: e.target.value })}
                        onFocus={() => setActiveFilterField('fournisseur')}
                        onBlur={() => {
                          setActiveFilterField(null);
                          submitFilters({ ...filterState });
                        }}
                        placeholder="Fournisseur"
                        list="fournisseur-options"
                      />
                      <datalist id="fournisseur-options">
                        {fournisseurOptions.map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">Prix de vente</p>
                      <span className="text-xs text-muted-foreground">Min / Max</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{priceMinBound} DH</span>
                        <span>{priceMaxBound} DH</span>
                      </div>
                      <div className="relative h-10">
                        <div
                          className={`absolute -top-6 -translate-x-1/2 ${activeThumb === 'min' ? 'z-40' : 'z-30'}`}
                          style={{ left: `${minPercent}%` }}
                        >
                          <div className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-black shadow ring-1 ring-border/60">
                            <input
                              type="number"
                              min={priceMinBound}
                              max={safeMaxBound}
                              value={minInputDraft ?? String(clampedMin)}
                              onFocus={() => {
                                setActiveThumb('min');
                                setMinInputDraft(String(clampedMin));
                              }}
                              onBlur={commitMinDraftValue}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  commitMinDraftValue();
                                }
                              }}
                              onChange={(e) => {
                                setMinInputDraft(e.target.value);
                              }}
                              className="h-5 w-14 bg-transparent text-right text-[11px] font-semibold text-black outline-none"
                            />
                            <span className="text-[11px] font-semibold text-black">DH</span>
                          </div>
                        </div>
                        <div
                          className={`absolute -top-6 -translate-x-1/2 ${activeThumb === 'max' ? 'z-40' : 'z-30'}`}
                          style={{ left: `${maxPercent}%` }}
                        >
                          <div className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-black shadow ring-1 ring-border/60">
                            <input
                              type="number"
                              min={priceMinBound}
                              max={safeMaxBound}
                              value={maxInputDraft ?? String(clampedMax)}
                              onFocus={() => {
                                setActiveThumb('max');
                                setMaxInputDraft(String(clampedMax));
                              }}
                              onBlur={commitMaxDraftValue}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  commitMaxDraftValue();
                                }
                              }}
                              onChange={(e) => {
                                setMaxInputDraft(e.target.value);
                              }}
                              className="h-5 w-14 bg-transparent text-right text-[11px] font-semibold text-black outline-none"
                            />
                            <span className="text-[11px] font-semibold text-black">DH</span>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white shadow-inner" />
                        <input
                          type="range"
                          min={priceMinBound}
                          max={safeMaxBound}
                          step={1}
                          value={clampedMin}
                          onPointerDown={() => setActiveThumb('min')}
                          onChange={(e) => {
                            const inputRaw = Number(e.target.value);
                            setFilterState((prev) => {
                              const currentMaxRaw = Number(prev.prix_max || safeMaxBound);
                              const next = normalizeMinValue(inputRaw, currentMaxRaw);

                              return {
                                ...prev,
                                prix_min: String(next.min),
                                prix_max: String(next.max),
                              };
                            });
                          }}
                          className={`absolute inset-0 w-full appearance-none bg-transparent accent-white pointer-events-none ${
                            activeThumb === 'min' ? 'z-20' : 'z-10'
                          } [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-muted
                            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-muted`}
                        />
                        <input
                          type="range"
                          min={priceMinBound}
                          max={safeMaxBound}
                          step={1}
                          value={clampedMax}
                          onPointerDown={() => setActiveThumb('max')}
                          onChange={(e) => {
                            const inputRaw = Number(e.target.value);
                            setFilterState((prev) => {
                              const currentMinRaw = Number(prev.prix_min || priceMinBound);
                              const next = normalizeMaxValue(inputRaw, currentMinRaw);

                              return {
                                ...prev,
                                prix_min: String(next.min),
                                prix_max: String(next.max),
                              };
                            });
                          }}
                          className={`absolute inset-0 w-full appearance-none bg-transparent accent-white pointer-events-none ${
                            activeThumb === 'max' ? 'z-20' : 'z-10'
                          } [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-muted
                            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-muted`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Min: {clampedMin} DH</span>
                        <span>Max: {clampedMax} DH</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code barre</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix achat</TableHead>
                    <TableHead>Prix vente</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produits.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Aucun produit trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    produits.data.map((produit) => (
                      <TableRow key={produit.id}>
                        <TableCell>{produit.code_barre}</TableCell>
                        <TableCell>{produit.name}</TableCell>
                        <TableCell>{produit.category?.name || '-'}</TableCell>
                        <TableCell>{produit.prix_achat} DH</TableCell>
                        <TableCell>{produit.prix_vente} DH</TableCell>
                        <TableCell>{produit.quantite ?? 0}</TableCell>
                        <TableCell>{produit.fournisseur?.name || '-'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/produits/${produit.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/produits/${produit.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => handleDelete(produit.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        {/* Pagination can be added here if needed */}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
