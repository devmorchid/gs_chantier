import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Search, ArrowDownCircle, ArrowUpCircle, Trash2, FileCheck, Bell, LayoutDashboard } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';

interface ChequeItem {
    id: number;
    cheque_number: string;
    bank_name: string;
    amount: number;
    direction: string;
    type_label: string;
    status: string;
    status_label: string;
    source_type: string;
    source_label: string;
    source_id: number;
    beneficiaire: string | null;
    titulaire: string | null;
    motif: string | null;
    issue_date: string;
    due_date: string;
    created_at: string;
}

interface PaginatedCheques {
    data: ChequeItem[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    cheques: PaginatedCheques;
    types: Record<string, string>;
    statuts: Record<string, string>;
    source_types: Record<string, string>;
    filters: {
        search?: string;
        direction?: string;
        status?: string;
        source_type?: string;
    };
    alertes: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chèques', href: '/cheques' },
];

function statusColor(status: string) {
    switch (status) {
        case 'en_attente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'encaisse': return 'bg-green-100 text-green-800 border-green-300';
        case 'rejete': return 'bg-red-100 text-red-800 border-red-300';
        default: return '';
    }
}

function statusBadgeVariant(status: string) {
    switch (status) {
        case 'en_attente': return 'outline';
        case 'encaisse': return 'default';
        case 'rejete': return 'destructive';
        default: return 'secondary';
    }
}

function formatMontant(val: number) {
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
}

function ChequeTable({ cheques, onStatusChange, onDelete }: {
    cheques: ChequeItem[];
    onStatusChange: (c: ChequeItem) => void;
    onDelete: (c: ChequeItem) => void;
}) {
    if (cheques.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Aucun chèque trouvé
            </div>
        );
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>N° Chèque</TableHead>
                    <TableHead>Banque</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Bénéficiaire</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Émission</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {cheques.map((cheque) => (
                    <TableRow key={cheque.id}>
                        <TableCell className="font-mono font-medium">{cheque.cheque_number}</TableCell>
                        <TableCell>{cheque.bank_name}</TableCell>
                        <TableCell className="text-right font-semibold">
                            {formatMontant(cheque.amount)} MAD
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1.5">
                                {cheque.direction === 'encaissement' ? (
                                    <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <ArrowUpCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-sm">{cheque.type_label}</span>
                            </div>
                        </TableCell>
                        <TableCell>{cheque.beneficiaire || '—'}</TableCell>
                        <TableCell>
                            <span className="text-xs text-muted-foreground">{cheque.source_label}</span>
                        </TableCell>
                        <TableCell className="text-sm">{cheque.issue_date}</TableCell>
                        <TableCell className="text-sm">{cheque.due_date}</TableCell>
                        <TableCell>
                            <Badge className={statusColor(cheque.status)} variant={statusBadgeVariant(cheque.status) as 'default' | 'destructive' | 'outline' | 'secondary'}>
                                {cheque.status_label}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => onStatusChange(cheque)} title="Changer statut">
                                    <FileCheck className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete(cheque)} title="Supprimer" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function ChequesIndex({ cheques, types, statuts, source_types, filters, alertes }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCheque, setSelectedCheque] = useState<ChequeItem | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const activeTab = filters.direction || 'all';

    const statusForm = useForm({ status: '', notes: '' });

    const applyFilters = useCallback((newFilters: Record<string, string>) => {
        router.get('/cheques', { ...filters, ...newFilters }, { preserveState: true, preserveScroll: true });
    }, [filters]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const switchTab = (tab: string) => {
        router.get('/cheques', { ...filters, direction: tab === 'all' ? '' : tab, search }, { preserveState: true });
    };

    const openStatusModal = (cheque: ChequeItem) => {
        setSelectedCheque(cheque);
        statusForm.setData({ status: '', notes: '' });
        setShowStatusModal(true);
    };

    const submitStatus = () => {
        if (!selectedCheque) return;
        statusForm.patch(`/cheques/${selectedCheque.id}/statut`, {
            onSuccess: () => setShowStatusModal(false),
        });
    };

    const deleteCheque = (cheque: ChequeItem) => {
        if (!confirm('Supprimer ce chèque ?')) return;
        router.delete(`/cheques/${cheque.id}`);
    };

    // Counts per tab
    const encaissementCount = useMemo(() => cheques.data.filter(c => c.direction === 'encaissement').length, [cheques.data]);
    const decaissementCount = useMemo(() => cheques.data.filter(c => c.direction === 'decaissement').length, [cheques.data]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Suivi des Chèques" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Suivi des Chèques</h1>
                        <p className="text-muted-foreground text-sm mt-1">{cheques.total} chèque(s) au total</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.get('/cheques/notifications')} className="relative">
                            <Bell className="h-4 w-4 mr-2" />
                            Alertes
                            {alertes > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                    {alertes}
                                </span>
                            )}
                        </Button>
                        <Button variant="outline" onClick={() => router.get('/cheques/dashboard')}>
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4">
                            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher (numéro, banque, bénéficiaire...)"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" size="sm">Rechercher</Button>
                            </form>

                            <Select value={filters.status || 'all'} onValueChange={(v) => applyFilters({ status: v === 'all' ? '' : v })}>
                                <SelectTrigger className="w-[170px]">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    {Object.entries(statuts).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.source_type || 'all'} onValueChange={(v) => applyFilters({ source_type: v === 'all' ? '' : v })}>
                                <SelectTrigger className="w-[170px]">
                                    <SelectValue placeholder="Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes les sources</SelectItem>
                                    {Object.entries(source_types).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs: Tous / Reçus / Émis */}
                <Tabs value={activeTab} onValueChange={switchTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">
                            Tous les chèques
                        </TabsTrigger>
                        <TabsTrigger value="encaissement" className="gap-2">
                            <ArrowDownCircle className="h-4 w-4 text-green-600" />
                            Chèques reçus
                        </TabsTrigger>
                        <TabsTrigger value="decaissement" className="gap-2">
                            <ArrowUpCircle className="h-4 w-4 text-red-600" />
                            Chèques émis
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-4">
                        <Card>
                            <CardContent className="p-0">
                                <ChequeTable
                                    cheques={cheques.data}
                                    onStatusChange={openStatusModal}
                                    onDelete={deleteCheque}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Pagination */}
                {cheques.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {cheques.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Status Change Modal */}
            <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Changer le statut — Chèque {selectedCheque?.cheque_number}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nouveau statut</Label>
                            <Select value={statusForm.data.status} onValueChange={(v) => statusForm.setData('status', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(statuts).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {statusForm.errors.status && (
                                <p className="text-sm text-destructive">{statusForm.errors.status}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Notes (optionnel)</Label>
                            <Textarea
                                value={statusForm.data.notes}
                                onChange={(e) => statusForm.setData('notes', e.target.value)}
                                placeholder="Raison du changement de statut..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowStatusModal(false)}>Annuler</Button>
                        <Button onClick={submitStatus} disabled={!statusForm.data.status || statusForm.processing}>
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
