import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar,
    User,
    Building2,
    Clock,
    CheckCircle2,
    Archive,
    Filter,
    ChevronDown,
    CalendarRange,
    X,
    Navigation,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ErrorDialog } from '@/components/error-dialog';

interface Responsable {
    id: number;
    name: string;
}

interface Client {
    id: number;
    nom: string;
    reference: string;
}

interface Chantier {
    id: number;
    reference: string;
    nom: string;
    localisation: string;
    adresse: string | null;
    latitude: number | null;
    longitude: number | null;
    date_debut: string;
    date_debut_raw: string;
    annee: string;
    date_fin_prevue: string | null;
    date_fin_reelle: string | null;
    statut: string;
    statut_label: string;
    client: Client | null;
    responsable: Responsable | null;
}

interface PaginatedChantiers {
    data: Chantier[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    chantiers: PaginatedChantiers;
    chantiersTermines: PaginatedChantiers;
    chantiersArchives: PaginatedChantiers;
    responsables: Responsable[];
    clients: Client[];
    availableYears: number[];
    statuts: Record<string, string>;
    filters: {
        search?: string;
        responsable_id?: string;
        client_id?: string;
        annee?: string;
        date_from?: string;
        date_to?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chantiers', href: '/chantiers' },
];

const statutBadgeColors: Record<string, string> = {
    en_cours: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    termine: 'bg-green-100 text-green-800 hover:bg-green-100',
};

export default function ChantiersIndex({
    chantiers,
    chantiersTermines,
    chantiersArchives,
    responsables,
    clients,
    availableYears,
    statuts,
    filters,
}: Props) {
    const { props } = usePage<SharedData & { error?: string }>();
    const [error, setError] = useState<string | null>(props.error || null);

    // Always sync error state with latest page props after navigation
    useEffect(() => {
        if (props.error) setError(props.error);
    }, [props.error]);
    const userRoles = props.auth?.user?.roles || [];
    const isAdmin = userRoles.includes('admin');

    const [search, setSearch] = useState(filters.search || '');
    const [responsableId, setResponsableId] = useState(filters.responsable_id || '');
    const [clientId, setClientId] = useState(filters.client_id || '');
    const [annee, setAnnee] = useState(filters.annee || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('en_cours');
    const [showFilters, setShowFilters] = useState(false);

    const hasActiveFilters = !!(filters.annee || filters.date_from || filters.date_to || filters.client_id || filters.responsable_id);

    const handleFilter = () => {
        router.get(
            '/chantiers',
            {
                search: search || undefined,
                responsable_id: responsableId || undefined,
                client_id: clientId || undefined,
                annee: annee || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setResponsableId('');
        setClientId('');
        setAnnee('');
        setDateFrom('');
        setDateTo('');
        router.get('/chantiers');
    };

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/chantiers/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
                onFinish: () => {
                    // Always get the latest error from the new Inertia page props after navigation
                    setTimeout(() => {
                        const newError = usePage().props.error;
                        if (newError) setError(newError);
                    }, 50);
                },
            });
        }
    };

    // Statut badge colors
    const getStatutBadge = (statut: string, label: string) => {
        const colors: Record<string, string> = {
            en_cours: 'bg-blue-500 text-white',
            termine: 'bg-green-500 text-white',
            annule: 'bg-red-500 text-white',
        };
        return (
            <Badge className={colors[statut] || 'bg-gray-500 text-white'}>
                {label}
            </Badge>
        );
    };

    // Ouvrir Google Maps
    const openInGoogleMaps = (chantier: Chantier) => {
        if (chantier.latitude && chantier.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${chantier.latitude},${chantier.longitude}`,
                '_blank'
            );
        } else if (chantier.localisation) {
            window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chantier.localisation)}`,
                '_blank'
            );
        }
    };

    // Composant Ligne Chantier Simple
    const ChantierRow = ({ 
        chantier,
        isArchive = false,
    }: { 
        chantier: Chantier;
        isArchive?: boolean;
    }) => (
        <div className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors ${isArchive ? 'opacity-70' : ''}`}>
            {/* Ligne principale */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                            {chantier.reference}
                        </span>
                        <Link 
                            href={`/chantiers/${chantier.id}`}
                            className="font-semibold text-lg hover:text-primary hover:underline"
                        >
                            {chantier.nom}
                        </Link>
                        {!isArchive && getStatutBadge(chantier.statut, chantier.statut_label)}
                        {isArchive && (
                            <Badge variant="outline" className="text-muted-foreground">
                                Annulé
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openInGoogleMaps(chantier)}
                        disabled={!chantier.localisation && !chantier.latitude}
                    >
                        <Navigation className="h-4 w-4 mr-1" />
                        GPS
                    </Button>
                    <Button variant="default" size="sm" asChild>
                        <Link href={`/chantiers/${chantier.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                        </Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/chantiers/${chantier.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <a href={`/rapports/chantiers/${chantier.id}/pdf`} target="_blank" rel="noopener noreferrer">
                                    <span role="img" aria-label="pdf" className="mr-2">📄</span>
                                    Télécharger PDF
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href={`/rapports/chantiers/${chantier.id}/voir`} target="_blank" rel="noopener noreferrer">
                                    <span role="img" aria-label="voir-pdf" className="mr-2">👁️</span>
                                    Voir PDF
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href={`/rapports/chantiers/${chantier.id}/excel`} target="_blank" rel="noopener noreferrer">
                                    <span role="img" aria-label="excel" className="mr-2">📊</span>
                                    Rapport Excel
                                </a>
                            </DropdownMenuItem>
                            {isAdmin && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => setDeleteId(chantier.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Supprimer
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Détails en grille */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t text-sm">
                {/* Client */}
                <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Client
                    </p>
                    {chantier.client ? (
                        <Link 
                            href={`/clients/${chantier.client.id}`}
                            className="font-medium text-primary hover:underline"
                        >
                            {chantier.client.nom}
                        </Link>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>

                {/* Responsable */}
                <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Responsable
                    </p>
                    <p className="font-medium">
                        {chantier.responsable?.name || <span className="text-muted-foreground">-</span>}
                    </p>
                </div>

                {/* Date début */}
                <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Début
                    </p>
                    <p className="font-medium">{chantier.date_debut}</p>
                </div>

                {/* Date fin */}
                <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Fin
                    </p>
                    <p className={`font-medium ${chantier.date_fin_reelle ? 'text-green-600' : ''}`}>
                        {chantier.date_fin_reelle || chantier.date_fin_prevue || <span className="text-muted-foreground">-</span>}
                    </p>
                </div>

                {/* Localisation */}
                <div className="col-span-2 md:col-span-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Localisation
                    </p>
                    <p className="font-medium truncate" title={chantier.localisation}>
                        {chantier.localisation || <span className="text-muted-foreground">-</span>}
                    </p>
                </div>
            </div>
        </div>
    );

    // Liste des chantiers avec pagination
    const ChantiersList = ({ 
        data, 
        isArchive = false,
        pagination,
        pageParam 
    }: { 
        data: Chantier[]; 
        isArchive?: boolean;
        pagination: PaginatedChantiers;
        pageParam: string;
    }) => (
        <div className="space-y-3">
            {data.length === 0 ? (
                <div className="border rounded-lg border-dashed p-12 text-center">
                    {isArchive ? (
                        <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    ) : (
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    )}
                    <p className="text-muted-foreground">
                        {isArchive ? 'Aucun chantier annulé.' : 'Aucun chantier trouvé.'}
                    </p>
                    {!isArchive && (
                        <Button asChild className="mt-4">
                            <Link href="/chantiers/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Créer un chantier
                            </Link>
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    {data.map((chantier) => (
                        <ChantierRow 
                            key={chantier.id} 
                            chantier={chantier}
                            isArchive={isArchive}
                        />
                    ))}

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                {pagination.from} - {pagination.to} sur {pagination.total}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() =>
                                        router.get('/chantiers', {
                                            ...filters,
                                            [pageParam]: pagination.current_page - 1,
                                        })
                                    }
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="flex items-center px-3 text-sm">
                                    {pagination.current_page} / {pagination.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() =>
                                        router.get('/chantiers', {
                                            ...filters,
                                            [pageParam]: pagination.current_page + 1,
                                        })
                                    }
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chantiers" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Chantiers</h1>
                        <p className="text-muted-foreground">
                            Gérez vos chantiers et consultez l'historique
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/chantiers/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau Chantier
                        </Link>
                    </Button>
                </div>

                {/* Filtres de base */}
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
                    <Button onClick={handleFilter}>Rechercher</Button>
                    <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filtres avancés
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="ml-1">
                                        Actifs
                                    </Badge>
                                )}
                                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </Button>
                        </CollapsibleTrigger>
                    </Collapsible>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
                            <X className="h-4 w-4" />
                            Effacer
                        </Button>
                    )}
                </div>

                {/* Filtres avancés */}
                <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                    <CollapsibleContent>
                        <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <CalendarRange className="h-4 w-4" />
                                Filtres avancés
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                {/* Par année */}
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Année</label>
                                    <Select value={annee} onValueChange={setAnnee}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Toutes" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Toutes les années</SelectItem>
                                            {availableYears.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Période - Date début */}
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Du</label>
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                </div>

                                {/* Période - Date fin */}
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Au</label>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                    />
                                </div>

                                {/* Par client */}
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Client</label>
                                    <Select value={clientId} onValueChange={setClientId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tous" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les clients</SelectItem>
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id.toString()}>
                                                    {client.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Par responsable (Admin only) */}
                                {isAdmin && (
                                    <div className="space-y-2">
                                        <label className="text-sm text-muted-foreground">Responsable</label>
                                        <Select value={responsableId} onValueChange={setResponsableId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tous" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous</SelectItem>
                                                {responsables.map((resp) => (
                                                    <SelectItem key={resp.id} value={resp.id.toString()}>
                                                        {resp.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleFilter}>Appliquer les filtres</Button>
                                <Button variant="outline" onClick={handleReset}>
                                    Réinitialiser
                                </Button>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Tabs: En cours / Terminés / Annulés */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-lg grid-cols-3">
                        <TabsTrigger value="en_cours" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            En cours ({chantiers.total})
                        </TabsTrigger>
                        <TabsTrigger value="termine" className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Terminés ({chantiersTermines.total})
                        </TabsTrigger>
                        <TabsTrigger value="annule" className="flex items-center gap-2">
                            <Archive className="h-4 w-4" />
                            Annulés ({chantiersArchives.total})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="en_cours" className="mt-4">
                        <ChantiersList 
                            data={chantiers.data} 
                            pagination={chantiers}
                            pageParam="page"
                        />
                    </TabsContent>

                    <TabsContent value="termine" className="mt-4">
                        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3">
                            <p className="text-sm text-green-800">
                                <CheckCircle2 className="inline h-4 w-4 mr-1" />
                                Chantiers terminés récemment (moins d'un an). Après un an, ils seront automatiquement archivés.
                            </p>
                        </div>
                        <ChantiersList 
                            data={chantiersTermines.data} 
                            showDateFin={true}
                            pagination={chantiersTermines}
                            pageParam="page_termine"
                        />
                    </TabsContent>

                    <TabsContent value="annule" className="mt-4">
                        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                            <p className="text-sm text-amber-800">
                                <Archive className="inline h-4 w-4 mr-1" />
                                Chantiers annulés. Utilisez les filtres pour rechercher par année ou période.
                            </p>
                        </div>
                        <ChantiersList 
                            data={chantiersArchives.data} 
                            showDateFin={true}
                            isArchive={true}
                            pagination={chantiersArchives}
                            pageParam="page_annule"
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Dialog de confirmation de suppression */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce chantier ? Cette action est
                            irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Error popup for deletion or other backend errors */}
            <ErrorDialog open={!!error} message={error || ''} onClose={() => setError(null)} />
        </AppLayout>
    );
}
