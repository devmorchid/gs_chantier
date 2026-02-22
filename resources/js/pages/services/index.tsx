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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
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
    Wrench,
    Clock,
    DollarSign,
    Users,
    CheckCircle,
    PlayCircle,
    History,
    AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

interface Chantier {
    id: number;
    reference: string;
    nom: string;
}

interface Equipe {
    id: number;
    name: string;
    specialite_label: string;
}

interface Service {
    id: number;
    name: string;
    type: string;
    type_label: string;
    price: number | null;
    duree_estimee: number | null;
    status: string;
    status_label: string;
    date_debut: string | null;
    date_fin: string | null;
    closed_early: boolean;
    chantier: Chantier | null;
    equipe: Equipe | null;
    created_at: string;
}

interface PaginatedServices {
    data: Service[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    services: PaginatedServices;
    servicesTermines: PaginatedServices;
    chantiers: Chantier[];
    equipes: Equipe[];
    types: Record<string, string>;
    statuts: Record<string, string>;
    filters: {
        search?: string;
        status?: string;
        type?: string;
        chantier_id?: string;
        tab?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Services', href: '/services' },
];

const statusBadgeColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    en_cours: 'bg-blue-100 text-blue-800',
    termine: 'bg-green-100 text-green-800',
};

const typeBadgeColors: Record<string, string> = {
    electricien: 'bg-yellow-100 text-yellow-800',
    plombier: 'bg-blue-100 text-blue-800',
    macon: 'bg-orange-100 text-orange-800',
    peintre: 'bg-pink-100 text-pink-800',
    menuisier: 'bg-amber-100 text-amber-800',
    carreleur: 'bg-cyan-100 text-cyan-800',
    climatisation: 'bg-sky-100 text-sky-800',
    soudeur: 'bg-red-100 text-red-800',
    manoeuvre: 'bg-stone-100 text-stone-800',
    autre: 'bg-gray-100 text-gray-800',
};

export default function ServicesIndex({
    services,
    servicesTermines,
    chantiers,
    types,
    statuts,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [activeTab, setActiveTab] = useState(filters.tab || 'en_cours');

    const handleFilter = (tab: string = activeTab) => {
        router.get('/services', {
            search: search || undefined,
            type: filters.type || undefined,
            chantier_id: filters.chantier_id || undefined,
            tab,
        }, { preserveState: true });
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get('/services', {
            ...filters,
            tab,
            search: undefined, // Reset search when changing tabs
        }, { preserveState: true });
    };

    const handleDelete = () => {
        if (selectedService) {
            router.delete(`/services/${selectedService.id}`);
            setShowDeleteDialog(false);
            setSelectedService(null);
        }
    };

    const formatPrice = (price: number | null) => {
        if (price === null) return '-';
        // Format as 1 000 dh (no $ sign, no MAD)
        return `${price.toLocaleString('fr-MA')} DH`;
    };

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const currentServices = activeTab === 'en_cours' ? services : servicesTermines;

    const renderServicesTable = (servicesList: PaginatedServices, isTermine: boolean = false) => (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Chantier</TableHead>
                            <TableHead>Équipe</TableHead>
                            <TableHead>Prix</TableHead>
                            {isTermine ? (
                                <>
                                    <TableHead>Date début</TableHead>
                                    <TableHead>Date fin</TableHead>
                                </>
                            ) : (
                                <TableHead>Durée</TableHead>
                            )}
                            <TableHead>Statut</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {servicesList.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isTermine ? 9 : 8} className="h-24 text-center">
                                    {isTermine ? 'Aucun service terminé.' : 'Aucun service en cours.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            servicesList.data.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Wrench className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{service.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={typeBadgeColors[service.type] || 'bg-gray-100 text-gray-800'}>
                                            {service.type_label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {service.chantier ? (
                                            <Link
                                                href={`/chantiers/${service.chantier.id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {service.chantier.nom}
                                            </Link>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {service.equipe ? (
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <Link
                                                    href={`/equipes/${service.equipe.id}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {service.equipe.name}
                                                </Link>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Non assigné</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {formatPrice(service.price)}
                                        </div>
                                    </TableCell>
                                    {isTermine ? (
                                        <>
                                            <TableCell>{formatDate(service.date_debut)}</TableCell>
                                            <TableCell>{formatDate(service.date_fin)}</TableCell>
                                        </>
                                    ) : (
                                        <TableCell>
                                            {service.duree_estimee !== null ? (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="j-4 w-4 text-muted-foreground" />
                                                    {service.duree_estimee}j
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Badge className={statusBadgeColors[service.status]}>
                                                {service.status_label}
                                            </Badge>
                                            {service.closed_early && (
                                                <Badge className="bg-amber-100 text-amber-800" title="Fermé en avance">
                                                    <AlertTriangle className="h-3 w-3" />
                                                </Badge>
                                            )}
                                        </div>
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
                                                    <Link href={`/services/${service.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Voir
                                                    </Link>
                                                </DropdownMenuItem>
                                                {!isTermine && (
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/services/${service.id}/edit`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Modifier
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        setSelectedService(service);
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
            {servicesList.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Affichage de {servicesList.from} à {servicesList.to} sur {servicesList.total} résultats
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={servicesList.current_page === 1}
                            onClick={() => router.get('/services', {
                                ...filters,
                                tab: activeTab,
                                page: servicesList.current_page - 1,
                            }, { preserveState: true })}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="flex items-center px-3 text-sm">
                            {servicesList.current_page} / {servicesList.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={servicesList.current_page === servicesList.last_page}
                            onClick={() => router.get('/services', {
                                ...filters,
                                tab: activeTab,
                                page: servicesList.current_page + 1,
                            }, { preserveState: true })}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
                        <p className="text-muted-foreground">
                            Gérer les services et prestations des chantiers
                        </p>
                    </div>
                    <Link href="/services/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau Service
                        </Button>
                    </Link>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="en_cours" className="flex items-center gap-2">
                            <PlayCircle className="h-4 w-4" />
                            En cours ({services.total})
                        </TabsTrigger>
                        <TabsTrigger value="termine" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Historique ({servicesTermines.total})
                        </TabsTrigger>
                    </TabsList>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex flex-1 gap-2">
                            <Input
                                placeholder="Rechercher par nom..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                className="max-w-sm"
                            />
                            <Button variant="outline" onClick={() => handleFilter()}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <Select
                            value={filters.type || 'all'}
                            onValueChange={(value) =>
                                router.get('/services', {
                                    ...filters,
                                    tab: activeTab,
                                    type: value === 'all' ? undefined : value,
                                }, { preserveState: true })
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les types</SelectItem>
                                {Object.entries(types).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.chantier_id || 'all'}
                            onValueChange={(value) =>
                                router.get('/services', {
                                    ...filters,
                                    tab: activeTab,
                                    chantier_id: value === 'all' ? undefined : value,
                                }, { preserveState: true })
                            }
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Chantier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les chantiers</SelectItem>
                                {chantiers.map((chantier) => (
                                    <SelectItem key={chantier.id} value={chantier.id.toString()}>
                                        {chantier.nom}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* En cours Tab */}
                    <TabsContent value="en_cours" className="space-y-4">
                        {renderServicesTable(services, false)}
                    </TabsContent>

                    {/* Terminé Tab (Historique) */}
                    <TabsContent value="termine" className="space-y-4">
                        {renderServicesTable(servicesTermines, true)}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le service "{selectedService?.name}" ?
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
