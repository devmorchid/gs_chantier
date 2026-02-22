import { useState } from 'react';
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
    Phone,
    Users,
    Wrench,
    CheckCircle,
    XCircle,
} from 'lucide-react';

interface Equipe {
    id: number;
    name: string;
    specialite: string;
    specialite_label: string;
    chef_equipe: string | null;
    telephone: string | null;
    disponible: boolean;
    techniciens_count: number;
    services_count: number;
}

interface PaginatedEquipes {
    data: Equipe[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    equipes: PaginatedEquipes;
    specialites: Record<string, string>;
    filters: {
        search?: string;
        specialite?: string;
        disponible?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Équipes', href: '/equipes' },
];

const specialiteBadgeColors: Record<string, string> = {
    electricien: 'bg-yellow-100 text-yellow-800',
    plombier: 'bg-blue-100 text-blue-800',
    macon: 'bg-orange-100 text-orange-800',
    peintre: 'bg-pink-100 text-pink-800',
    menuisier: 'bg-amber-100 text-amber-800',
    carreleur: 'bg-purple-100 text-purple-800',
    climatisation: 'bg-cyan-100 text-cyan-800',
    soudeur: 'bg-red-100 text-red-800',
    polyvalent: 'bg-indigo-100 text-indigo-800',
    autre: 'bg-gray-100 text-gray-800',
};

export default function EquipesIndex({ equipes, specialites, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [specialite, setSpecialite] = useState(filters.specialite || 'all');
    const [disponible, setDisponible] = useState(filters.disponible || 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [equipeToDelete, setEquipeToDelete] = useState<Equipe | null>(null);

    const handleFilter = () => {
        router.get('/equipes', {
            search: search || undefined,
            specialite: specialite !== 'all' ? specialite : undefined,
            disponible: disponible !== 'all' ? disponible : undefined,
        }, { preserveState: true });
    };

    const handleDelete = () => {
        if (equipeToDelete) {
            router.delete(`/equipes/${equipeToDelete.id}`);
            setDeleteDialogOpen(false);
            setEquipeToDelete(null);
        }
    };

    const toggleDisponible = (equipe: Equipe) => {
        router.patch(`/equipes/${equipe.id}/toggle-disponible`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Équipes" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Équipes (IKIB)</h1>
                        <p className="text-muted-foreground">
                            Gérez les équipes de travail
                        </p>
                    </div>
                    <Link href="/equipes/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle Équipe
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par nom..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <Select value={specialite} onValueChange={setSpecialite}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Spécialité" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les spécialités</SelectItem>
                            {Object.entries(specialites).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={disponible} onValueChange={setDisponible}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Disponibilité" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            <SelectItem value="true">Disponibles</SelectItem>
                            <SelectItem value="false">Indisponibles</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleFilter}>Filtrer</Button>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Spécialité</TableHead>
                                <TableHead>Chef d'équipe</TableHead>
                                <TableHead>Téléphone</TableHead>
                                <TableHead>Membres</TableHead>
                                <TableHead>Services</TableHead>
                                <TableHead>Disponible</TableHead>
                                <TableHead className="w-[70px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {equipes.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        Aucune équipe trouvée
                                    </TableCell>
                                </TableRow>
                            ) : (
                                equipes.data.map((equipe) => (
                                    <TableRow key={equipe.id}>
                                        <TableCell className="font-medium">
                                            {equipe.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={specialiteBadgeColors[equipe.specialite]}>
                                                {equipe.specialite_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{equipe.chef_equipe || '-'}</TableCell>
                                        <TableCell>
                                            {equipe.telephone ? (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {equipe.telephone}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                {equipe.techniciens_count}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Wrench className="h-4 w-4 text-muted-foreground" />
                                                {equipe.services_count}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleDisponible(equipe)}
                                            >
                                                {equipe.disponible ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-600" />
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
                                                        <Link href={`/equipes/${equipe.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Voir
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/equipes/${equipe.id}/edit`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Modifier
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => {
                                                            setEquipeToDelete(equipe);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                        disabled={equipe.services_count > 0}
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
                {equipes.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {equipes.current_page} sur {equipes.last_page} ({equipes.total} équipes)
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={equipes.current_page === 1}
                                onClick={() => router.get('/equipes', { ...filters, page: equipes.current_page - 1 })}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={equipes.current_page === equipes.last_page}
                                onClick={() => router.get('/equipes', { ...filters, page: equipes.current_page + 1 })}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer l'équipe "{equipeToDelete?.name}" ?
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
