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
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Users,
    Phone,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Kit {
    id: number;
    name: string;
    type: string;
    type_label: string;
    disponibilite: boolean;
    disponibilite_label: string;
    telephone: string | null;
    description: string | null;
    assignments_count: number;
    active_assignments_count: number;
    created_at: string;
}

interface PaginatedKits {
    data: Kit[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    kits: PaginatedKits;
    types: Record<string, string>;
    filters: {
        search?: string;
        type?: string;
        disponibilite?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kits / Équipes', href: '/kits' },
];

const typeBadgeColors: Record<string, string> = {
    electricien: 'bg-yellow-100 text-yellow-800',
    plombier: 'bg-blue-100 text-blue-800',
    macon: 'bg-orange-100 text-orange-800',
    peintre: 'bg-pink-100 text-pink-800',
    menuisier: 'bg-amber-100 text-amber-800',
    carreleur: 'bg-cyan-100 text-cyan-800',
    climatisation: 'bg-sky-100 text-sky-800',
    soudeur: 'bg-red-100 text-red-800',
    autre: 'bg-gray-100 text-gray-800',
};

export default function KitsIndex({ kits, types, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleFilter = () => {
        router.get('/kits', {
            search: search || undefined,
            type: filters.type || undefined,
            disponibilite: filters.disponibilite,
        }, { preserveState: true });
    };

    const handleDelete = () => {
        if (selectedKit) {
            router.delete(`/kits/${selectedKit.id}`);
            setShowDeleteDialog(false);
            setSelectedKit(null);
        }
    };

    const toggleDisponibilite = (kit: Kit) => {
        router.patch(`/kits/${kit.id}/toggle-disponibilite`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kits / Équipes" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kits / Équipes</h1>
                        <p className="text-muted-foreground">
                            Gérer les équipes et techniciens par spécialisation
                        </p>
                    </div>
                    <Link href="/kits/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau Kit
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-1 gap-2">
                        <Input
                            placeholder="Rechercher par nom ou téléphone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            className="max-w-sm"
                        />
                        <Button variant="outline" onClick={handleFilter}>
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                    <Select
                        value={filters.type || 'all'}
                        onValueChange={(value) =>
                            router.get('/kits', {
                                ...filters,
                                type: value === 'all' ? undefined : value,
                            }, { preserveState: true })
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Spécialisation" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes spécialisations</SelectItem>
                            {Object.entries(types).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.disponibilite ?? 'all'}
                        onValueChange={(value) =>
                            router.get('/kits', {
                                ...filters,
                                disponibilite: value === 'all' ? undefined : value,
                            }, { preserveState: true })
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Disponibilité" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="true">Disponibles</SelectItem>
                            <SelectItem value="false">Indisponibles</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Spécialisation</TableHead>
                                <TableHead>Téléphone</TableHead>
                                <TableHead>Affectations actives</TableHead>
                                <TableHead>Disponibilité</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kits.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Aucun kit trouvé.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                kits.data.map((kit) => (
                                    <TableRow key={kit.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{kit.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={typeBadgeColors[kit.type]}>
                                                {kit.type_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {kit.telephone ? (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    {kit.telephone}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {kit.active_assignments_count} en cours
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleDisponibilite(kit)}
                                                className={kit.disponibilite ? 'text-green-600' : 'text-red-600'}
                                            >
                                                {kit.disponibilite ? (
                                                    <><CheckCircle className="mr-1 h-4 w-4" /> Disponible</>
                                                ) : (
                                                    <><XCircle className="mr-1 h-4 w-4" /> Indisponible</>
                                                )}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/kits/${kit.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Voir
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/kits/${kit.id}/edit`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Modifier
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => {
                                                            setSelectedKit(kit);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
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
                {kits.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Affichage de {kits.from} à {kits.to} sur {kits.total} résultats
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={kits.current_page === 1}
                                onClick={() => router.get('/kits', {
                                    ...filters,
                                    page: kits.current_page - 1,
                                }, { preserveState: true })}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={kits.current_page === kits.last_page}
                                onClick={() => router.get('/kits', {
                                    ...filters,
                                    page: kits.current_page + 1,
                                }, { preserveState: true })}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le kit ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le kit{' '}
                            <strong>{selectedKit?.name}</strong> ? Cette action est
                            irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
