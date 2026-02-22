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
import { Building2, Eye, MoreHorizontal, Pencil, Plus, Search, Trash2, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useErrorDialog } from '@/components/use-error-dialog';
import { ErrorDialog } from '@/components/error-dialog';
import { usePage } from '@inertiajs/react';

interface Client {
    id: number;
    reference: string;
    nom: string;
    telephone: string | null;
    email: string | null;
    ville: string | null;
    type: string;
    type_label: string;
    ice: string | null;
    chantiers_count: number;
    created_at: string;
}

interface PaginatedClients {
    data: Client[];
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
    clients: PaginatedClients;
    types: Record<string, string>;
    filters: {
        search?: string;
        type?: string;
    };
}


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clients', href: '/clients' },
];

export default function ClientsIndex({ clients, types, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const { error, showError, hideError } = useErrorDialog();
    const { flash } = usePage().props as { flash?: { error?: string } };

    useEffect(() => {
        if (flash?.error) {
            showError(flash.error);
        } else {
            hideError();
        }
    }, [flash?.error]);

    const handleFilter = () => {
        router.get('/clients', { search, type }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setType('');
        router.get('/clients');
    };

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            router.delete(`/clients/${id}`, {
                onError: (errors) => {
                    // Fallback for Inertia error response
                    if (errors && typeof errors === 'string') {
                        showError(errors);
                    } else if (errors && errors.error) {
                        showError(errors.error);
                    }
                },
                preserveScroll: true,
            });
        }
    };

    const getTypeVariant = (type: string) => {
        return type === 'entreprise' ? 'default' : 'secondary';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            {/* Error dialog for deletion error */}
            <ErrorDialog open={!!error} message={error || ''} onClose={() => { hideError(); }} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
                        <p className="text-muted-foreground">
                            Gérez vos clients et leurs informations
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/clients/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau Client
                        </Link>
                    </Button>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            className="pl-10"
                        />
                    </div>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            {Object.entries(types).map(([value, label]) => (
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
                                <TableHead className="font-semibold text-foreground whitespace-nowrap">Référence</TableHead>
                                <TableHead className="font-semibold text-foreground">Nom</TableHead>
                                <TableHead className="font-semibold text-foreground">Contact</TableHead>
                                <TableHead className="font-semibold text-foreground">Ville</TableHead>
                                <TableHead className="font-semibold text-foreground">Type</TableHead>
                                <TableHead className="font-semibold text-foreground">ICE</TableHead>
                                <TableHead className="font-semibold text-foreground text-center">Chantiers</TableHead>
                                <TableHead className="font-semibold text-foreground text-center w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <User className="h-8 w-8 opacity-50" />
                                            <span>Aucun client trouvé.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clients.data.map((client, index) => (
                                    <TableRow 
                                        key={client.id}
                                        className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                                    >
                                        <TableCell className="font-semibold text-primary whitespace-nowrap">
                                            {client.reference}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-medium">
                                                {client.type === 'entreprise' ? (
                                                    <Building2 className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <User className="h-4 w-4 text-green-500" />
                                                )}
                                                <span>{client.nom}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {client.telephone && (
                                                    <div className="flex items-center gap-1.5 text-sm font-medium">
                                                        <span>📞</span> {client.telephone}
                                                    </div>
                                                )}
                                                {client.email && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <span>✉️</span> {client.email}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{client.ville || '-'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={client.type === 'entreprise' ? 'default' : 'secondary'}
                                                className={client.type === 'entreprise' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                            >
                                                {client.type_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {client.ice ? (
                                                <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                                                    {client.ice}
                                                </code>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-semibold">
                                                {client.chantiers_count}
                                            </Badge>
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
                                                        <Link href={`/clients/${client.id}`} className="flex items-center gap-2 cursor-pointer">
                                                            <Eye className="h-4 w-4" />
                                                            Voir détails
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/clients/${client.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                                                            <Pencil className="h-4 w-4" />
                                                            Modifier
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDelete(client.id)}
                                                        className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Supprimer
                                                    </DropdownMenuItem>
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
                {clients.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Affichage de {(clients.current_page - 1) * clients.per_page + 1} à{' '}
                            {Math.min(clients.current_page * clients.per_page, clients.total)} sur{' '}
                            {clients.total} clients
                        </p>
                        <div className="flex gap-2">
                            {clients.links.map((link, index) => (
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
