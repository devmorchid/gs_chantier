
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, ArrowLeftRight, CalendarDays, Package, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { StockMouvement, PaginatedStockMouvements } from '@/types/stock_mouvement';

interface Props {
  mouvements: PaginatedStockMouvements;
  filters: {
    produit?: string;
    type?: string;
    origine?: string;
    destination?: string;
    date_from?: string;
    date_to?: string;
  };
  produitOptions: string[];
  origineOptions: string[];
  destinationOptions: string[];
}

export default function StockMouvementsIndex({ mouvements, filters, produitOptions, origineOptions, destinationOptions }: Props) {
  const [filterState, setFilterState] = useState({
    produit: filters.produit ?? '',
    type: filters.type ?? '',
    origine: filters.origine ?? '',
    destination: filters.destination ?? '',
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
  });
  const [dateError, setDateError] = useState('');
  const didMount = useRef(false);

  const isSameFilters = (left: typeof filterState, right: typeof filterState) =>
    left.produit === right.produit &&
    left.type === right.type &&
    left.origine === right.origine &&
    left.destination === right.destination &&
    left.date_from === right.date_from &&
    left.date_to === right.date_to;

  const applyFilters = (nextFilters: typeof filterState) => {
    if (nextFilters.date_from && nextFilters.date_to && nextFilters.date_from > nextFilters.date_to) {
      setDateError('La date de début ne peut pas dépasser la date de fin.');
      return;
    }
    setDateError('');
    setFilterState(nextFilters);
  };

  const resetFilters = () => {
    const cleared = { produit: '', type: '', origine: '', destination: '', date_from: '', date_to: '' };
    setFilterState(cleared);
    router.get('/stock-mouvements', {}, { preserveState: true, replace: true, preserveScroll: true });
  };

  useEffect(() => {
    const nextState = {
      produit: filters.produit ?? '',
      type: filters.type ?? '',
      origine: filters.origine ?? '',
      destination: filters.destination ?? '',
      date_from: filters.date_from ?? '',
      date_to: filters.date_to ?? '',
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

    if (filterState.date_from && filterState.date_to && filterState.date_from > filterState.date_to) {
      setDateError('La date de début ne peut pas dépasser la date de fin.');
      return;
    }
    setDateError('');

    if (isSameFilters(filterState, {
      produit: filters.produit ?? '',
      type: filters.type ?? '',
      origine: filters.origine ?? '',
      destination: filters.destination ?? '',
      date_from: filters.date_from ?? '',
      date_to: filters.date_to ?? '',
    })) {
      return;
    }

    const timer = setTimeout(() => {
      router.get('/stock-mouvements', filterState, { preserveState: true, replace: true, preserveScroll: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [filterState]);


  return (
    <AppLayout>
      <Head title="Mouvements de stock" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mouvements de stock</h1>
              <p className="text-muted-foreground">Historique des mouvements de stock et transferts.</p>
            </div>
            <Button asChild>
              <Link href="/stock-mouvements/create">
                <Plus className="mr-2 h-4 w-4" /> Nouveau mouvement
              </Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <ArrowLeftRight className="h-4 w-4" />
                </span>
                Total mouvements
              </div>
              <p className="text-2xl font-semibold">{mouvements.total}</p>
              <p className="text-xs text-muted-foreground">Enregistrés</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Package className="h-4 w-4" />
                </span>
                Affichage
              </div>
              <p className="text-2xl font-semibold">{mouvements.from ?? 0}-{mouvements.to ?? 0}</p>
              <p className="text-xs text-muted-foreground">Éléments visibles</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <CalendarDays className="h-4 w-4" />
                </span>
                Dernières lignes
              </div>
              <p className="text-2xl font-semibold">{mouvements.data.length}</p>
              <p className="text-xs text-muted-foreground">Sur cette page</p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Liste des mouvements</CardTitle>
            <p className="text-sm text-muted-foreground">
              Filtrez et consultez l’historique des mouvements de stock.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Filtres rapides</p>
                  <p className="text-xs text-muted-foreground">Affinez la liste en temps réel</p>
                </div>
                <Button variant="outline" onClick={resetFilters}>Réinitialiser</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Produit</label>
                  <Input
                    value={filterState.produit}
                    onChange={(e) => {
                      const next = { ...filterState, produit: e.target.value };
                      applyFilters(next);
                    }}
                    placeholder="Nom du produit"
                    list="produit-options"
                  />
                  <datalist id="produit-options">
                    {produitOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={filterState.type || '__all__'}
                    onValueChange={(value) => {
                      const normalizedValue = value === '__all__' ? '' : value;
                      const next = { ...filterState, type: normalizedValue };
                      applyFilters(next);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      {filterState.type === 'transfert'
                        ? 'Transfert'
                        : filterState.type === 'retour'
                          ? 'Retour'
                          : 'Tous'}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tous</SelectItem>
                      <SelectItem value="transfert">Transfert</SelectItem>
                      <SelectItem value="retour">Retour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Origine</label>
                  <Input
                    value={filterState.origine}
                    onChange={(e) => {
                      const next = { ...filterState, origine: e.target.value };
                      applyFilters(next);
                    }}
                    placeholder="Ex: Depot"
                    list="origine-options"
                  />
                  <datalist id="origine-options">
                    {origineOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <Input
                    value={filterState.destination}
                    onChange={(e) => {
                      const next = { ...filterState, destination: e.target.value };
                      applyFilters(next);
                    }}
                    placeholder="Chantier..."
                    list="destination-options"
                  />
                  <datalist id="destination-options">
                    {destinationOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date du</label>
                  <Input
                    type="date"
                    value={filterState.date_from}
                    onChange={(e) => {
                      const next = { ...filterState, date_from: e.target.value };
                      applyFilters(next);
                    }}
                    max={filterState.date_to || undefined}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date au</label>
                  <Input
                    type="date"
                    value={filterState.date_to}
                    onChange={(e) => {
                      const next = { ...filterState, date_to: e.target.value };
                      applyFilters(next);
                    }}
                    min={filterState.date_from || undefined}
                  />
                  {dateError && <p className="text-xs text-red-500">{dateError}</p>}
                </div>
              </div>
            </div>
            <div className="border-t" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Origine</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mouvements.data.map((m: StockMouvement) => {
                  const items = m.items ?? [];
                  const totalQuantite = items.length
                    ? items.reduce((sum, item) => sum + (item.quantite ?? 0), 0)
                    : m.quantite;
                  const firstName = items.length ? items[0].produit?.name : m.produit?.name;
                  return (
                  <TableRow key={m.id}>
                    <TableCell>
                      {firstName || '-'}
                      {items.length > 1 && (
                        <span className="ml-2 text-xs text-muted-foreground">+{items.length - 1}</span>
                      )}
                    </TableCell>
                    <TableCell>{m.reference || '-'}</TableCell>
                    <TableCell>{m.type}</TableCell>
                    <TableCell>{m.origine || '-'}</TableCell>
                    <TableCell>{m.destination}</TableCell>
                    <TableCell>{totalQuantite}</TableCell>
                    <TableCell>{m.date}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild size="icon" variant="ghost">
                        <Link href={`/stock-mouvements/${m.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button asChild size="icon" variant="ghost">
                        <a href={`/stock-mouvements/${m.id}/pdf`} target="_blank" rel="noreferrer">
                          <FileText className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Pagination can be added here if needed */}
      </div>
    </AppLayout>
  );
}
