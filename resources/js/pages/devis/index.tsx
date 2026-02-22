import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Copy,
    Download,
    Eye,
    FileText,
    MoreHorizontal,
    Pencil,
    Plus,
    Receipt,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Devis {
    id: number;
    numero: string;
    date: string;
    date_validite: string | null;
    objet: string;
    total_ht: string;
    total_ttc: string;
    status: string;
    status_label: string;
    status_color: string;
    chantier: {
        id: number;
        reference: string;
        nom: string;
        client: {
            id: number;
            nom: string;
        } | null;
    } | null;
    items_count: number;
    has_facture: boolean;
    created_at: string;
}

interface PaginatedDevis {
    data: Devis[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    devisList: PaginatedDevis;
    statuts: Record<string, string>;
    filters: {
        search?: string;
        status?: string;
        chantier_id?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Devis', href: '/devis' },
];

export default function DevisIndex({ devisList, statuts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get('/devis', { search, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get('/devis');
    };

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
            router.delete(`/devis/${id}`, { preserveScroll: true });
        }
    };

    const handleDuplicate = (id: number) => {
        router.post(`/devis/${id}/duplicate`);
    };

    const handleCreateFacture = (id: number) => {
        router.post(`/factures/from-devis/${id}`);
    };

    const getStatusBadgeVariant = (color: string) => {
        switch (color) {
            case 'green':
                return 'default';
            case 'destructive':
                return 'destructive';
            case 'blue':
                return 'default';
            case 'orange':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const getStatusBadgeClass = (color: string) => {
        switch (color) {
            case 'green':
                return 'bg-green-600 hover:bg-green-700';
            case 'blue':
                return 'bg-blue-600 hover:bg-blue-700';
            case 'orange':
                return 'bg-orange-500 hover:bg-orange-600';
            default:
                return '';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Devis" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Devis</h1>
                        <p className="text-muted-foreground">
                            Gérez vos devis et suivez leur statut
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/devis/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau Devis
                        </Link>
                    </Button>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par numéro, objet, chantier..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            className="pl-10"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            {Object.entries(statuts).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleFilter}>Filtrer</Button>
                    <Button variant="outline" onClick={handleReset}>
                        Réinitialiser
                    </Button>
                </div>

                {/* Tableau */}
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="font-semibold text-foreground whitespace-nowrap">
                                    Numéro
                                </TableHead>
                                <TableHead className="font-semibold text-foreground">Date</TableHead>
                                <TableHead className="font-semibold text-foreground">Client</TableHead>
                                <TableHead className="font-semibold text-foreground">Chantier</TableHead>
                                <TableHead className="font-semibold text-foreground">Objet</TableHead>
                                <TableHead className="font-semibold text-foreground text-right">
                                    Total TTC
                                </TableHead>
                                <TableHead className="font-semibold text-foreground text-center">
                                    Statut
                                </TableHead>
                                <TableHead className="font-semibold text-foreground text-center w-[80px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {devisList.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="h-8 w-8 opacity-50" />
                                            <span>Aucun devis trouvé.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                devisList.data.map((devis, index) => (
                                    <TableRow
                                        key={devis.id}
                                        className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                                    >
                                        <TableCell className="font-semibold text-primary whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-500" />
                                                {devis.numero}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-medium">{devis.date}</div>
                                                {devis.date_validite && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Valide jusqu'au {devis.date_validite}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {devis.chantier?.client?.nom || (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {devis.chantier ? (
                                                <div className="space-y-0.5">
                                                    <div className="text-sm font-medium">
                                                        {devis.chantier.nom}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {devis.chantier.reference}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm line-clamp-2">{devis.objet}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="font-semibold">{devis.total_ttc} DH</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Badge
                                                    variant={getStatusBadgeVariant(devis.status_color)}
                                                    className={getStatusBadgeClass(devis.status_color)}
                                                >
                                                    {devis.status_label}
                                                </Badge>
                                                {devis.has_facture && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Receipt className="h-3 w-3 mr-1" />
                                                        Facturé
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/devis/${devis.id}`}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Voir détails
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {!devis.has_facture && (
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/devis/${devis.id}/edit`}
                                                                className="flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                Modifier
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => handleDuplicate(devis.id)}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                        Dupliquer
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <a
                                                            href={`/devis/${devis.id}/pdf`}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Télécharger PDF
                                                        </a>
                                                    </DropdownMenuItem>
                                                    {devis.status === 'accepte' && !devis.has_facture && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleCreateFacture(devis.id)}
                                                                className="flex items-center gap-2 cursor-pointer text-green-600 focus:text-green-600"
                                                            >
                                                                <Receipt className="h-4 w-4" />
                                                                Créer Facture
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {!devis.has_facture && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(devis.id)}
                                                                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Supprimer
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {devisList.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Affichage de {(devisList.current_page - 1) * devisList.per_page + 1} à{' '}
                            {Math.min(devisList.current_page * devisList.per_page, devisList.total)}{' '}
                            sur {devisList.total} devis
                        </p>
                        <div className="flex gap-2">
                            {devisList.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
