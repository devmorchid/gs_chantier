import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ErrorDialog } from '@/components/error-dialog';
import {
    AlertTriangle,
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Eye,
    HardHat,
    Mail,
    MapPin,
    Package,
    Pencil,
    Phone,
    Plus,
    Trash2,
    User,
    Wrench,
    XCircle,
    Navigation,
    Share2,
} from 'lucide-react';
import { LocationMapView } from '@/components/ui/location-map-view';


interface Client {
    id: number;
    reference: string;
    nom: string;
    telephone: string | null;
    email: string | null;
    adresse: string | null;
    ville: string | null;
    type_label: string;
}

interface Responsable {
    id: number;
    name: string;
    email: string;
    phone: string | null;
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
    equipe: {
        id: number;
        name: string;
        specialite_label: string;
    } | null;
}

interface Chantier {
    id: number;
    reference: string;
    nom: string;
    localisation: string;
    latitude: number | null;
    longitude: number | null;
    adresse: string | null;
    date_debut_formatted: string;
    date_fin_prevue_formatted: string | null;
    statut: string;
    statut_label: string;
    client: Client | null;
    responsable: Responsable | null;
    created_at: string;
    total_services: number;
    total_services_cost: number;
}

interface OpenService {
    id: number;
    name: string;
    status: string;
}

interface StockProduit {
    produit_id: number;
    name: string;
    code_barre: string;
    quantite: number;
}

interface Props {
    chantier: Chantier;
    services: Service[];
    stockProduits: StockProduit[];
    statuts: Record<string, string>;
    canEdit: boolean;
    canDelete: boolean;
}

const statutBadgeColors: Record<string, string> = {
    en_cours: 'bg-blue-100 text-blue-800',
    termine: 'bg-green-100 text-green-800',
};

const serviceStatutColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    en_cours: 'bg-blue-100 text-blue-800',
    termine: 'bg-green-100 text-green-800',
};

export default function ChantierShow({
    chantier,
    services,
    stockProduits,
    statuts,
    canEdit,
    canDelete,
}: Props) {
    const { props } = usePage<SharedData & { error?: string }>();
    const [error, setError] = useState<string | null>(props.error || null);

    useEffect(() => {
        if (props.error) {
            setError(props.error);
        } else {
            setError(null);
        }
    }, [props.error]);
    const userRoles = props.auth?.user?.roles || [];
    const isAdmin = userRoles.includes('admin');

    const [showCloseAlert, setShowCloseAlert] = useState(false);
    const [openServices, setOpenServices] = useState<OpenService[]>([]);
    const [canClose, setCanClose] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Chantiers', href: '/chantiers' },
        { title: chantier.reference, href: `/chantiers/${chantier.id}` },
    ];

    // التحقق من الخدمات المفتوحة عند محاولة الإغلاق
    const checkCanClose = async () => {
        try {
            const response = await fetch(`/chantiers/${chantier.id}/can-close`);
            const data = await response.json();
            setCanClose(data.can_close);
            setOpenServices(data.open_services || []);
            return data;
        } catch (error) {
            console.error('Error checking close status:', error);
            return { can_close: false, open_services: [] };
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        // إذا كان الإغلاق (termine) نتحقق أولاً
        if (newStatus === 'termine' && chantier.statut !== 'termine') {
            setPendingStatus(newStatus);
            const closeStatus = await checkCanClose();
            
            if (!closeStatus.can_close) {
                setShowCloseAlert(true);
                return;
            }
        }
        
        // تنفيذ التغيير
        router.patch(`/chantiers/${chantier.id}/statut`, { statut: newStatus });
    };

    const handleForceClose = () => {
        // إغلاق إجباري (Admin فقط)
        router.patch(`/chantiers/${chantier.id}/statut`, { 
            statut: 'termine',
            force_close: true 
        });
        setShowCloseAlert(false);
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce chantier ?')) {
            router.delete(`/chantiers/${chantier.id}`);
        }
    };

    const formatCurrency = (value: number | null) => {
        if (value === null) return '-';
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
        }).format(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${chantier.reference} - ${chantier.nom}`} />
            <ErrorDialog open={!!error} message={error || ''} onClose={() => setError(null)} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* En-tête */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/chantiers">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {chantier.nom}
                                </h1>
                                <Badge className={statutBadgeColors[chantier.statut]}>
                                    {chantier.statut_label}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">{chantier.reference}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {canEdit && (
                            <>
                                <Select
                                    value={chantier.statut}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(statuts).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" asChild>
                                    <Link href={`/chantiers/${chantier.id}/edit`}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Modifier
                                    </Link>
                                </Button>
                            </>
                        )}
                        {canDelete && (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                            </Button>
                        )}
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-purple-100 p-3">
                                <Wrench className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Services</p>
                                <p className="text-2xl font-bold">{chantier.total_services}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-green-100 p-3">
                                <Wrench className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Coût Total Services</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(chantier.total_services_cost)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Informations du chantier */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HardHat className="h-5 w-5" />
                                Informations du chantier
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium">Localisation</p>
                                    <p className="text-muted-foreground">{chantier.localisation}</p>
                                </div>
                            </div>
                            {chantier.adresse && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Adresse détaillée</p>
                                        <p className="text-muted-foreground whitespace-pre-line">{chantier.adresse}</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Carte interactive si coordonnées disponibles */}
                            {chantier.latitude && chantier.longitude && (
                                <div className="pt-2">
                                    <LocationMapView
                                        latitude={chantier.latitude}
                                        longitude={chantier.longitude}
                                        address={chantier.localisation}
                                        title={chantier.nom}
                                    />
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date début</p>
                                        <p className="font-medium">{chantier.date_debut_formatted}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Fin prévue</p>
                                        <p className="font-medium">
                                            {chantier.date_fin_prevue_formatted || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client et Responsable */}
                    <div className="space-y-6">
                        {/* Client */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Client
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {chantier.client ? (
                                    <div className="space-y-3">
                                        <div>
                                            <Link
                                                href={`/clients/${chantier.client.id}`}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                {chantier.client.nom}
                                            </Link>
                                            <p className="text-sm text-muted-foreground">
                                                {chantier.client.reference} • {chantier.client.type_label}
                                            </p>
                                        </div>
                                        {chantier.client.telephone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                {chantier.client.telephone}
                                            </div>
                                        )}
                                        {chantier.client.email && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <a
                                                    href={`mailto:${chantier.client.email}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {chantier.client.email}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Aucun client associé</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Responsable */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Responsable
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {chantier.responsable ? (
                                    <div className="space-y-3">
                                        <p className="font-medium">{chantier.responsable.name}</p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`mailto:${chantier.responsable.email}`}
                                                className="text-primary hover:underline"
                                            >
                                                {chantier.responsable.email}
                                            </a>
                                        </div>
                                        {chantier.responsable.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                {chantier.responsable.phone}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Aucun responsable assigné</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Produits en stock */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Produits en stock
                                </CardTitle>
                                <CardDescription>
                                    Produits disponibles sur ce chantier
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {stockProduits.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="font-semibold">Aucun produit</h3>
                                <p className="text-sm text-muted-foreground">
                                    Aucun stock n'est affecté à ce chantier.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code barre</TableHead>
                                        <TableHead>Produit</TableHead>
                                        <TableHead>Quantité</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stockProduits.map((item, index) => (
                                        <TableRow key={`${item.produit_id}-${index}`}>
                                            <TableCell>{item.code_barre}</TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.quantite}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Services */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="h-5 w-5" />
                                    Services
                                </CardTitle>
                                <CardDescription>
                                    Services et travaux associés à ce chantier
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={`/services/create?chantier_id=${chantier.id}`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter Service
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {services.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Wrench className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="font-semibold">Aucun service</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Ce chantier n'a pas encore de services associés
                                </p>
                                <Button asChild>
                                    <Link href={`/services/create?chantier_id=${chantier.id}`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter un service
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Équipe</TableHead>
                                        <TableHead>Prix</TableHead>
                                        <TableHead>Durée</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-medium">
                                                {service.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{service.type_label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {service.equipe?.name || '-'}
                                            </TableCell>
                                            <TableCell>{formatCurrency(service.price)}</TableCell>
                                            <TableCell>
                                                {service.duree_estimee ? `${service.duree_estimee}h` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={serviceStatutColors[service.status]}>
                                                    {service.status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/services/${service.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Alert Dialog للتحقق من إغلاق الشنتي */}
            <AlertDialog open={showCloseAlert} onOpenChange={setShowCloseAlert}>
                <AlertDialogContent className="max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-5 w-5" />
                            Impossible de clôturer ce chantier
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-4">
                                <Alert variant="destructive" className="border-amber-200 bg-amber-50">
                                    <XCircle className="h-4 w-4" />
                                    <AlertTitle>Services non terminés</AlertTitle>
                                    <AlertDescription>
                                        Il reste <strong>{openServices.length}</strong> service(s) non terminé(s).
                                        Veuillez d'abord terminer tous les services avant de clôturer le chantier.
                                    </AlertDescription>
                                </Alert>

                                {openServices.length > 0 && (
                                    <div className="rounded-lg border p-3">
                                        <p className="text-sm font-medium mb-2">Services à terminer :</p>
                                        <ul className="space-y-1">
                                            {openServices.map((service: OpenService) => (
                                                <li key={service.id} className="flex items-center gap-2 text-sm">
                                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                    <Link 
                                                        href={`/services/${service.id}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {service.name}
                                                    </Link>
                                                    <Badge variant="outline" className="text-xs">
                                                        {service.status === 'draft' ? 'Brouillon' : 'En cours'}
                                                    </Badge>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {isAdmin && (
                                    <Alert className="border-blue-200 bg-blue-50">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                        <AlertTitle className="text-blue-800">Option Admin</AlertTitle>
                                        <AlertDescription className="text-blue-700">
                                            En tant qu'administrateur, vous pouvez forcer la clôture.
                                            Tous les services seront automatiquement marqués comme terminés.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        {isAdmin && (
                            <AlertDialogAction
                                onClick={handleForceClose}
                                className="bg-amber-600 hover:bg-amber-700"
                            >
                                Forcer la clôture
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
