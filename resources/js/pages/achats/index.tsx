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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Achat, PaginatedAchats } from '@/types/achat';

import { Badge } from '@/components/ui/badge';
import { Achat as AchatType } from '@/types/achat';

interface Props {
  achats: PaginatedAchats;
  filters: {
    reference?: string;
    fournisseur?: string;
    date_from?: string;
    date_to?: string;
    statut?: string;
  };
  fournisseurOptions: string[];
  statuts?: Record<string, string>;
}

export default function AchatsIndex({ achats, filters, fournisseurOptions, statuts }: Props) {
  const [filterState, setFilterState] = useState({
    reference: filters.reference ?? '',
    fournisseur: filters.fournisseur ?? '',
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
    statut: filters.statut ?? '',
  });
  const [dateError, setDateError] = useState('');
  const didMount = useRef(false);

  const isSameFilters = (left: typeof filterState, right: typeof filterState) =>
    left.reference === right.reference &&
    left.fournisseur === right.fournisseur &&
    left.date_from === right.date_from &&
    left.date_to === right.date_to &&
    left.statut === right.statut;

  const applyFilters = (nextFilters: typeof filterState) => {
    if (nextFilters.date_from && nextFilters.date_to && nextFilters.date_from > nextFilters.date_to) {
      setDateError('La date de début ne peut pas dépasser la date de fin.');
      return;
    }
    setDateError('');
    setFilterState(nextFilters);
  };

  const resetFilters = () => {
    const cleared = { reference: '', fournisseur: '', date_from: '', date_to: '', statut: '' };
    setFilterState(cleared);
    router.get('/achats', {}, { preserveState: true, replace: true, preserveScroll: true });
  };

  useEffect(() => {
    const nextState = {
      reference: filters.reference ?? '',
      fournisseur: filters.fournisseur ?? '',
      date_from: filters.date_from ?? '',
      date_to: filters.date_to ?? '',
      statut: filters.statut ?? '',
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
      reference: filters.reference ?? '',
      fournisseur: filters.fournisseur ?? '',
      date_from: filters.date_from ?? '',
      date_to: filters.date_to ?? '',
      statut: filters.statut ?? '',
    })) {
      return;
    }

    const timer = setTimeout(() => {
      router.get('/achats', filterState, { preserveState: true, replace: true, preserveScroll: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [filterState]);

  return (
    <AppLayout>
      <Head title="Achats" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Achats</h1>
              <p className="text-muted-foreground">Suivi des achats produits et fournisseurs.</p>
            </div>
            <Button asChild>
              <Link href="/achats/create">
                <Plus className="mr-2 h-4 w-4" /> Nouvel achat
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des achats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Filtres</p>
                  <p className="text-xs text-muted-foreground">Recherche par référence, fournisseur et date</p>
                </div>
                <Button variant="outline" onClick={resetFilters}>Réinitialiser</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-5">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Statut</label>
                                  <select
                                    className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                    value={filterState.statut}
                                    onChange={e => applyFilters({ ...filterState, statut: e.target.value })}
                                  >
                                    <option value="">Tous</option>
                                    {statuts && Object.entries(statuts).map(([key, label]) => (
                                      <option key={key} value={key}>{label}</option>
                                    ))}
                                  </select>
                                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Référence</label>
                  <Input
                    value={filterState.reference}
                    onChange={(e) => applyFilters({ ...filterState, reference: e.target.value })}
                    placeholder="AC-2026-0001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fournisseur</label>
                  <Input
                    value={filterState.fournisseur}
                    onChange={(e) => applyFilters({ ...filterState, fournisseur: e.target.value })}
                    placeholder="Nom du fournisseur"
                    list="fournisseur-options"
                  />
                  <datalist id="fournisseur-options">
                    {fournisseurOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date du</label>
                  <Input
                    type="date"
                    value={filterState.date_from}
                    onChange={(e) => applyFilters({ ...filterState, date_from: e.target.value })}
                    max={filterState.date_to || undefined}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date au</label>
                  <Input
                    type="date"
                    value={filterState.date_to}
                    onChange={(e) => applyFilters({ ...filterState, date_to: e.target.value })}
                    min={filterState.date_from || undefined}
                  />
                  {dateError && <p className="text-xs text-red-500">{dateError}</p>}
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achats.data.map((achat: AchatType) => (
                  <TableRow key={achat.id}>
                    <TableCell>{achat.reference}</TableCell>
                    <TableCell>{achat.fournisseur ?? '-'}</TableCell>
                    <TableCell>{achat.user ?? '-'}</TableCell>
                    <TableCell>{achat.date}</TableCell>
                    <TableCell>{achat.total_ttc?.toFixed(2)} DH</TableCell>
                    <TableCell>
                      {statuts && achat.statut && (
                        <Badge
                          className={
                            achat.statut === 'paye'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : achat.statut === 'partiel'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : achat.statut === 'en_attente'
                              ? 'bg-gray-100 text-gray-800 border-gray-200'
                              : achat.statut === 'annule'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : ''
                          }
                          variant="outline"
                        >
                          {statuts[achat.statut] ?? achat.statut}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild size="icon" variant="ghost">
                        <Link href={`/achats/${achat.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button asChild size="icon" variant="ghost">
                        <a href={`/achats/${achat.id}/pdf`} target="_blank" rel="noreferrer">
                          <FileText className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
