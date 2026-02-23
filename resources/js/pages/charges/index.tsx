import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, FileText, MoreHorizontal, Pencil, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Charge, PaginatedCharges } from '@/types/charge';

interface ChantierOption {
  id: number;
  reference: string;
  nom: string;
}

interface Props {
  charges: PaginatedCharges;
  filters: {
    type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    chantier_id?: string;
  };
  statuts: Record<string, string>;
  types: Record<string, string>;
  chantiers: ChantierOption[];
  isAdmin: boolean;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function ChargesIndex({ charges, filters, statuts, types, chantiers, isAdmin }: Props) {
  const [filterState, setFilterState] = useState({
    type: filters.type ?? '',
    status: filters.status ?? '',
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
    chantier_id: filters.chantier_id ?? '',
  });
  const [dateError, setDateError] = useState('');
  const didMount = useRef(false);

  const isSameFilters = (left: typeof filterState, right: typeof filterState) =>
    left.type === right.type &&
    left.status === right.status &&
    left.date_from === right.date_from &&
    left.date_to === right.date_to &&
    left.chantier_id === right.chantier_id;

  const applyFilters = (nextFilters: typeof filterState) => {
    if (nextFilters.date_from && nextFilters.date_to && nextFilters.date_from > nextFilters.date_to) {
      setDateError('La date de debut ne peut pas depasser la date de fin.');
      return;
    }
    setDateError('');
    setFilterState(nextFilters);
  };

  const resetFilters = () => {
    const cleared = { type: '', status: '', date_from: '', date_to: '', chantier_id: '' };
    setFilterState(cleared);
    router.get('/charges', {}, { preserveState: true, replace: true, preserveScroll: true });
  };

  useEffect(() => {
    const nextState = {
      type: filters.type ?? '',
      status: filters.status ?? '',
      date_from: filters.date_from ?? '',
      date_to: filters.date_to ?? '',
      chantier_id: filters.chantier_id ?? '',
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
      setDateError('La date de debut ne peut pas depasser la date de fin.');
      return;
    }
    setDateError('');

    if (isSameFilters(filterState, {
      type: filters.type ?? '',
      status: filters.status ?? '',
      date_from: filters.date_from ?? '',
      date_to: filters.date_to ?? '',
      chantier_id: filters.chantier_id ?? '',
    })) {
      return;
    }

    const timer = setTimeout(() => {
      router.get('/charges', filterState, { preserveState: true, replace: true, preserveScroll: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [filterState]);

  return (
    <AppLayout>
      <Head title="Charges" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Charges</h1>
              <p className="text-muted-foreground">Suivi des charges par chantier.</p>
            </div>
            <Button asChild>
              <Link href="/charges/create">
                <Plus className="mr-2 h-4 w-4" /> Nouvelle charge
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Filtres</p>
                  <p className="text-xs text-muted-foreground">Type, statut, chantier et date</p>
                </div>
                <Button variant="outline" onClick={resetFilters}>Reinitialiser</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Input
                    value={filterState.type}
                    onChange={(e) => applyFilters({ ...filterState, type: e.target.value })}
                    placeholder="Ex: Transport"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select
                    value={filterState.status || 'all'}
                    onValueChange={(value) => applyFilters({ ...filterState, status: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger className="w-full">
                      {filterState.status ? statuts[filterState.status] : 'Tous'}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {Object.entries(statuts).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chantier</label>
                  <Select
                    value={filterState.chantier_id || 'all'}
                    onValueChange={(value) => applyFilters({ ...filterState, chantier_id: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger className="w-full">
                      {filterState.chantier_id
                        ? (chantiers.find((chantier) => String(chantier.id) === filterState.chantier_id)?.reference ?? 'Chantier')
                        : 'Tous'}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {chantiers.map((chantier) => (
                        <SelectItem key={chantier.id} value={String(chantier.id)}>
                          {chantier.reference} - {chantier.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <TableHead>Reference</TableHead>
                  <TableHead>Libelle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Chantier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Methode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Aucune charge trouvee.
                    </TableCell>
                  </TableRow>
                ) : (
                  charges.data.map((charge: Charge) => (
                    <TableRow key={charge.id}>
                      <TableCell>{charge.reference}</TableCell>
                      <TableCell>{charge.libelle ?? '-'}</TableCell>
                      <TableCell className="font-medium">{charge.type_label ?? types[charge.type] ?? charge.type}</TableCell>
                      <TableCell>{charge.chantier ? `${charge.chantier.reference} - ${charge.chantier.nom}` : '-'}</TableCell>
                      <TableCell>{charge.date}</TableCell>
                      <TableCell>{charge.montant.toFixed(2)} DH</TableCell>
                      <TableCell>{charge.payment_method ?? '-'}</TableCell>
                      <TableCell>
                        <Badge className={statusStyles[charge.status] || ''}>{charge.status_label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/charges/${charge.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> Voir
                              </Link>
                            </DropdownMenuItem>
                            {charge.can_edit && (
                              <DropdownMenuItem asChild>
                                <Link href={`/charges/${charge.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" /> {isAdmin ? 'Traiter' : 'Modifier'}
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <a href={`/charges/${charge.id}/pdf`} target="_blank" rel="noreferrer">
                                <FileText className="mr-2 h-4 w-4" /> Exporter
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
