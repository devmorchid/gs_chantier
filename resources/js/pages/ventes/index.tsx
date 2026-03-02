import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, FileText, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PaginatedVentes, Vente } from '@/types/vente';


import { Badge } from '@/components/ui/badge';

interface Props {
  ventes: PaginatedVentes;
  filters: {
    reference?: string;
    client?: string;
    date_from?: string;
    date_to?: string;
    statut?: string;
  };
  clientOptions: string[];
  statuts?: Record<string, string>;
}

export default function VentesIndex({ ventes, filters, clientOptions, statuts }: Props) {
  const [filterState, setFilterState] = useState({
    reference: filters.reference ?? '',
    client: filters.client ?? '',
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
    statut: filters.statut ?? '',
  });
  const [dateError, setDateError] = useState('');
  const didMount = useRef(false);

  const isSameFilters = (left: typeof filterState, right: typeof filterState) =>
    left.reference === right.reference &&
    left.client === right.client &&
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
    const cleared = { reference: '', client: '', date_from: '', date_to: '', statut: '' };
    setFilterState(cleared);
    router.get('/ventes', cleared, {
      only: ['ventes', 'filters', 'clientOptions', 'statuts'],
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  useEffect(() => {
    const nextState = {
      reference: filters.reference ?? '',
      client: filters.client ?? '',
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
      client: filters.client ?? '',
      date_from: filters.date_from ?? '',
      date_to: filters.date_to ?? '',
      statut: filters.statut ?? '',
    })) {
      return;
    }

    const timer = setTimeout(() => {
      router.get('/ventes', filterState, {
        only: ['ventes', 'filters', 'clientOptions', 'statuts'],
        preserveState: true,
        replace: true,
        preserveScroll: true,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [filterState]);

  return (
    <AppLayout>
      <Head title="Ventes" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Ventes</h1>
              <p className="text-muted-foreground">Suivi des ventes de produits.</p>
            </div>
            <Button asChild>
              <Link href="/ventes/create">
                <Plus className="mr-2 h-4 w-4" /> Nouvelle vente
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des ventes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Filtres</p>
                  <p className="text-xs text-muted-foreground">Recherche par référence, client et date</p>
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
                    {statuts && Object.entries(statuts)
                      .filter(([key]) => key !== 'brouillon')
                      .map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Référence</label>
                  <Input
                    value={filterState.reference}
                    onChange={(e) => applyFilters({ ...filterState, reference: e.target.value })}
                    placeholder="VT-2026-0001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client</label>
                  <Input
                    value={filterState.client}
                    onChange={(e) => applyFilters({ ...filterState, client: e.target.value })}
                    placeholder="Nom du client"
                    list="client-options"
                  />
                  <datalist id="client-options">
                    {clientOptions.map((option) => (
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
                  <TableHead>Client</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventes.data.map((vente: Vente) => (
                  <TableRow key={vente.id}>
                    <TableCell>{vente.reference}</TableCell>
                    <TableCell>{vente.client ?? '-'}</TableCell>
                    <TableCell>{vente.user ?? '-'}</TableCell>
                    <TableCell>{vente.date}</TableCell>
                    <TableCell>{vente.total_ttc?.toFixed(2)} DH</TableCell>
                    <TableCell>
                      {statuts && vente.statut && (
                        <Badge
                          className={
                            vente.statut === 'paye'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : vente.statut === 'partiel'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : vente.statut === 'en_attente'
                              ? 'bg-gray-100 text-gray-800 border-gray-200'
                              : vente.statut === 'annule'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : ''
                          }
                          variant="outline"
                        >
                          {statuts[vente.statut] ?? vente.statut}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild size="icon" variant="ghost">
                        <Link href={`/ventes/${vente.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button asChild size="icon" variant="ghost">
                        <a href={`/ventes/${vente.id}/pdf`} target="_blank" rel="noreferrer">
                          <FileText className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {ventes.last_page > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Affichage de {(ventes.current_page - 1) * ventes.per_page + 1} à{' '}
                  {Math.min(ventes.current_page * ventes.per_page, ventes.total)} sur{' '}
                  {ventes.total} ventes
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ventes.current_page === 1}
                    onClick={() => router.get('/ventes', { ...filterState, page: ventes.current_page - 1 }, {
                      only: ['ventes', 'filters', 'clientOptions'],
                      preserveState: true,
                      replace: true,
                      preserveScroll: true,
                    })}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {ventes.current_page} / {ventes.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ventes.current_page === ventes.last_page}
                    onClick={() => router.get('/ventes', { ...filterState, page: ventes.current_page + 1 }, {
                      only: ['ventes', 'filters', 'clientOptions'],
                      preserveState: true,
                      replace: true,
                      preserveScroll: true,
                    })}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
