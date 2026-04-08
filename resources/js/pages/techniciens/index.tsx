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
    UserCheck,
    UserX,
    QrCode,
} from 'lucide-react';

interface Equipe {
    id: number;
    name: string;
}

interface Technicien {
    id: number;
    nom: string;
    prenom: string | null;
    nom_complet: string;
    telephone: string | null;
    cin: string | null;
    specialite: string | null;
    specialite_label: string;
    salaire_journalier: number | null;
    disponible: boolean;
    equipes: Equipe[];
}

interface PaginatedTechniciens {
    data: Technicien[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    techniciens: PaginatedTechniciens;
    specialites: Record<string, string>;
    filters: {
        search?: string;
        specialite?: string;
        disponible?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Techniciens', href: '/techniciens' },
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
    manoeuvre: 'bg-slate-100 text-slate-800',
    autre: 'bg-gray-100 text-gray-800',
};

export default function TechniciensIndex({ techniciens, specialites, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [specialite, setSpecialite] = useState(filters.specialite || 'all');
    const [disponible, setDisponible] = useState(filters.disponible || 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [technicienToDelete, setTechnicienToDelete] = useState<Technicien | null>(null);

    const handleFilter = () => {
        router.get('/techniciens', {
            search: search || undefined,
            specialite: specialite !== 'all' ? specialite : undefined,
            disponible: disponible !== 'all' ? disponible : undefined,
        }, { preserveState: true });
    };

    const handleDelete = () => {
        if (technicienToDelete) {
            router.delete(`/techniciens/${technicienToDelete.id}`);
            setDeleteDialogOpen(false);
            setTechnicienToDelete(null);
        }
    };

    const toggleDisponible = (technicien: Technicien) => {
        router.patch(`/techniciens/${technicien.id}/toggle-disponible`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Techniciens" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Techniciens</h1>
                        <p className="text-muted-foreground">
                            Gérez les techniciens et ouvriers
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/techniciens/badges/all">
                            <Button variant="outline">
                                <QrCode className="mr-2 h-4 w-4" />
                                Tous les Badges
                            </Button>
                        </Link>
                        <Link href="/techniciens/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nouveau Technicien
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par nom, téléphone, CIN..."
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
                            <SelectItem value="all">Tous</SelectItem>
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
                                <TableHead>Téléphone</TableHead>
                                <TableHead>CIN</TableHead>
                                <TableHead>Spécialité</TableHead>
                                <TableHead>Salaire/jour</TableHead>
                                <TableHead>Équipes</TableHead>
                                <TableHead>Disponible</TableHead>
                                <TableHead className="w-[70px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {techniciens.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        Aucun technicien trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                techniciens.data.map((technicien) => (
                                    <TableRow key={technicien.id}>
                                        <TableCell className="font-medium">
                                            {technicien.nom_complet}
                                        </TableCell>
                                        <TableCell>
                                            {technicien.telephone ? (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {technicien.telephone}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>{technicien.cin || '-'}</TableCell>
                                        <TableCell>
                                            {technicien.specialite ? (
                                                <Badge className={specialiteBadgeColors[technicien.specialite]}>
                                                    {technicien.specialite_label}
                                                </Badge>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {technicien.salaire_journalier 
                                                ? `${technicien.salaire_journalier} MAD`
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {technicien.equipes.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {technicien.equipes.map(eq => (
                                                        <Badge key={eq.id} variant="outline">{eq.name}</Badge>
                                                    ))}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleDisponible(technicien)}
                                            >
                                                {technicien.disponible ? (
                                                    <UserCheck className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <UserX className="h-4 w-4 text-red-600" />
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
                                                        <Link href={`/techniciens/${technicien.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Voir
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/techniciens/${technicien.id}/badge`}>
                                                            <QrCode className="mr-2 h-4 w-4" />
                                                            Badge QR
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/techniciens/${technicien.id}/edit`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Modifier
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => {
                                                            setTechnicienToDelete(technicien);
                                                            setDeleteDialogOpen(true);
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
                {techniciens.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {techniciens.current_page} sur {techniciens.last_page} ({techniciens.total} techniciens)
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={techniciens.current_page === 1}
                                onClick={() => router.get('/techniciens', { ...filters, page: techniciens.current_page - 1 })}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={techniciens.current_page === techniciens.last_page}
                                onClick={() => router.get('/techniciens', { ...filters, page: techniciens.current_page + 1 })}
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
                            Êtes-vous sûr de vouloir supprimer le technicien "{technicienToDelete?.nom_complet}" ?
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
