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
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Power,
    KeyRound,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: 'active' | 'inactive';
    roles: string[];
    created_at: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    users: PaginatedUsers;
    roles: string[];
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Utilisateurs', href: '/utilisateurs' },
];

const roleLabels: Record<string, string> = {
    admin: 'Admin',
    chef_chantier: 'Chef de Chantier',
    technicien: 'Technicien',
};

const roleBadgeColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    chef_chantier: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    technicien: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export default function UtilisateursIndex({ users, roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleSearch = () => {
        router.get('/utilisateurs', {
            search: search || undefined,
            role: roleFilter || undefined,
            status: statusFilter || undefined,
        }, { preserveState: true });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleToggleStatus = (user: User) => {
        router.patch(`/utilisateurs/${user.id}/toggle-status`);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedUser) {
            router.delete(`/utilisateurs/${selectedUser.id}`);
        }
        setDeleteDialogOpen(false);
        setSelectedUser(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Utilisateurs" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
                        <p className="text-muted-foreground">
                            Gérez les utilisateurs et leurs permissions
                        </p>
                    </div>
                    <Link href="/utilisateurs/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter un utilisateur
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom, email, téléphone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="pl-10"
                        />
                    </div>

                    <Select value={roleFilter} onValueChange={(value) => {
                        setRoleFilter(value === 'all' ? '' : value);
                    }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tous les rôles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les rôles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role} value={role}>
                                    {roleLabels[role] || role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(value) => {
                        setStatusFilter(value === 'all' ? '' : value);
                    }}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Tous les statuts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={handleSearch} variant="secondary">
                        <Search className="mr-2 h-4 w-4" />
                        Filtrer
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Téléphone</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Date création</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Aucun utilisateur trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phone || '-'}</TableCell>
                                        <TableCell>
                                            {user.roles.map((role) => (
                                                <Badge
                                                    key={role}
                                                    variant="secondary"
                                                    className={roleBadgeColors[role] || ''}
                                                >
                                                    {roleLabels[role] || role}
                                                </Badge>
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.status === 'active' ? 'default' : 'secondary'}
                                                className={
                                                    user.status === 'active'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                }
                                            >
                                                {user.status === 'active' ? 'Actif' : user.status === 'désactivé' ? 'Désactivé' : 'Inactif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.created_at}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/utilisateurs/${user.id}/edit`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Modifier
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                                        <Power className="mr-2 h-4 w-4" />
                                                        {user.status === 'active' ? 'Désactiver' : 'Activer'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(user)}
                                                        className="text-red-600 dark:text-red-400"
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
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Affichage de {users.from} à {users.to} sur {users.total} résultats
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={users.current_page === 1}
                                onClick={() => router.get('/utilisateurs', {
                                    ...filters,
                                    page: users.current_page - 1,
                                })}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Précédent
                            </Button>
                            <span className="text-sm">
                                Page {users.current_page} sur {users.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={users.current_page === users.last_page}
                                onClick={() => router.get('/utilisateurs', {
                                    ...filters,
                                    page: users.current_page + 1,
                                })}
                            >
                                Suivant
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action va désactiver l'utilisateur "{selectedUser?.name}".
                            L'utilisateur ne pourra plus accéder au système.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Désactiver
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
