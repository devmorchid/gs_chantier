import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    Building2, 
    Clock,
    Banknote,
    Users,
    Phone,
    User,
    ExternalLink,
    AlertTriangle,
    Calendar,
    CheckCircle2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Membre {
    id: number;
    nom_complet: string;
    specialite_label: string;
    telephone: string | null;
}

interface Equipe {
    id: number;
    name: string;
    specialite: string;
    specialite_label: string;
    chef_equipe: string | null;
    telephone: string | null;
    membres: Membre[];
}

interface Chantier {
    id: number;
    reference: string;
    nom: string;
    localisation: string | null;
    client: {
        id: number;
        nom: string;
    } | null;
}

interface Service {
    id: number;
    chantier_id: number;
    equipe_id: number | null;
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
    created_at: string;
    updated_at: string;
    chantier: Chantier;
    equipe: Equipe | null;
}

interface AvailableEquipe {
    id: number;
    name: string;
    specialite_label: string;
}

interface Props {
    service: Service;
    types: Record<string, string>;
    statuts: Record<string, string>;
    availableEquipes: AvailableEquipe[];
}

const typeBadgeColors: Record<string, string> = {
    electricien: 'bg-yellow-100 text-yellow-800',
    plombier: 'bg-blue-100 text-blue-800',
    macon: 'bg-orange-100 text-orange-800',
    peintre: 'bg-pink-100 text-pink-800',
    menuisier: 'bg-amber-100 text-amber-800',
    carreleur: 'bg-purple-100 text-purple-800',
    climatisation: 'bg-cyan-100 text-cyan-800',
    soudeur: 'bg-red-100 text-red-800',
    manoeuvre: 'bg-stone-100 text-stone-800',
    autre: 'bg-gray-100 text-gray-800',
};

const statusBadgeColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function ServiceShow({
    service,
    types,
    statuts,
    availableEquipes,
}: Props) {
    const { flash, auth } = usePage<SharedData & { flash: { early_close_warning?: boolean; expected_end_date?: string } }>().props;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedEquipe, setSelectedEquipe] = useState<string>('');
    const [earlyCloseDialogOpen, setEarlyCloseDialogOpen] = useState(false);
    const [checkingCanClose, setCheckingCanClose] = useState(false);
    const [expectedEndDate, setExpectedEndDate] = useState<string | null>(null);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);

    const isAdmin = auth.user?.roles?.includes('admin');

    // Check if flash contains early close warning
    useEffect(() => {
        if (flash?.early_close_warning && flash?.expected_end_date) {
            setExpectedEndDate(flash.expected_end_date);
            setEarlyCloseDialogOpen(true);
        }
    }, [flash]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Services', href: '/services' },
        { title: service.name, href: `/services/${service.id}` },
    ];

    const handleDelete = () => {
        router.delete(`/services/${service.id}`);
    };

    const handleAssignEquipe = () => {
        if (!selectedEquipe) return;
        router.patch(`/services/${service.id}`, {
            equipe_id: selectedEquipe === 'none' ? null : parseInt(selectedEquipe),
        }, {
            onSuccess: () => {
                setAssignDialogOpen(false);
                setSelectedEquipe('');
            },
        });
    };

    const handleStatusChange = async (newStatus: string) => {
        // If changing to 'termine', check if service can be closed
        if (newStatus === 'termine' && service.status !== 'termine') {
            setCheckingCanClose(true);
            try {
                const response = await fetch(`/services/${service.id}/can-close`);
                const data = await response.json();
                
                if (data.is_early_close) {
                    // Show early close warning
                    setPendingStatus(newStatus);
                    setExpectedEndDate(data.expected_end_date);
                    setEarlyCloseDialogOpen(true);
                    setCheckingCanClose(false);
                    return;
                }
            } catch (error) {
                console.error('Error checking can close:', error);
            }
            setCheckingCanClose(false);
        }
        
        // Proceed with status change
        router.patch(`/services/${service.id}/statut`, { status: newStatus });
    };

    const handleForceEarlyClose = () => {
        router.patch(`/services/${service.id}/statut`, { 
            status: pendingStatus || 'termine',
            force_early_close: true 
        }, {
            onSuccess: () => {
                setEarlyCloseDialogOpen(false);
                setPendingStatus(null);
                setExpectedEndDate(null);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={service.name} />

            <div className="space-y-6 p-6">
                {/* Early Close Warning Alert Dialog */}
                <AlertDialog open={earlyCloseDialogOpen} onOpenChange={setEarlyCloseDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="h-5 w-5" />
                                Fermeture anticipée du service
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                                <p>
                                    <strong>Attention !</strong> Ce service n'a pas encore atteint sa date de fin prévue.
                                </p>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-amber-600" />
                                        <span className="text-sm">
                                            <strong>Date de fin prévue :</strong> {expectedEndDate}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Êtes-vous sûr de vouloir terminer ce service maintenant ? 
                                    Cette action sera marquée comme fermeture anticipée.
                                </p>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                                setPendingStatus(null);
                                setExpectedEndDate(null);
                            }}>
                                Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleForceEarlyClose}
                                className="bg-amber-600 hover:bg-amber-700"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Terminer quand même
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Early Close Badge Alert */}
                {service.closed_early && service.status === 'termine' && (
                    <Alert className="border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800">Service terminé en avance</AlertTitle>
                        <AlertDescription className="text-amber-700">
                            Ce service a été terminé avant sa date de fin prévue.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/services">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{service.name}</h1>
                                <Badge className={typeBadgeColors[service.type] || 'bg-gray-100 text-gray-800'}>
                                    {service.type_label}
                                </Badge>
                                <Badge className={statusBadgeColors[service.status] || 'bg-gray-100 text-gray-800'}>
                                    {service.status_label}
                                </Badge>
                                {service.closed_early && (
                                    <Badge className="bg-amber-100 text-amber-800">
                                        <AlertTriangle className="mr-1 h-3 w-3" />
                                        Fermé en avance
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <span>
                                    Créé {formatDistanceToNow(new Date(service.created_at), { 
                                        addSuffix: true, 
                                        locale: fr 
                                    })}
                                </span>
                                {service.date_debut && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Début: {new Date(service.date_debut).toLocaleDateString('fr-FR')}
                                    </span>
                                )}
                                {service.date_fin && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Fin: {new Date(service.date_fin).toLocaleDateString('fr-FR')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/services/${service.id}/details`}>
                            <Button variant="outline">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Détails travaux
                            </Button>
                        </Link>
                        <Link href={`/services/${service.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Button>
                        </Link>
                        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer le service "{service.name}" ?
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
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Chantier</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Link 
                                href={`/chantiers/${service.chantier.id}`}
                                className="text-lg font-bold hover:underline"
                            >
                                {service.chantier.reference}
                            </Link>
                            <p className="text-xs text-muted-foreground">{service.chantier.nom}</p>
                            {service.chantier.client && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Client: {service.chantier.client.nom}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Prix</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {service.price 
                                    ? new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(service.price)
                                    : '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Durée estimée</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {service.duree_estimee ? `${service.duree_estimee}j` : '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Équipe</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {service.equipe ? (
                                <>
                                    <Link 
                                        href={`/equipes/${service.equipe.id}`}
                                        className="text-lg font-bold hover:underline"
                                    >
                                        {service.equipe.name}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                        {service.equipe.membres.length} membre(s)
                                    </p>
                                </>
                            ) : (
                                <div className="text-lg font-bold text-muted-foreground">Non assigné</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Statut et équipe */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Changer le statut */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statut du service</CardTitle>
                            <CardDescription>Modifier le statut actuel</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={service.status} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(statuts).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Assigner/Changer équipe */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Équipe assignée</CardTitle>
                            <CardDescription>Assigner ou changer l'équipe</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        {service.equipe ? 'Changer l\'équipe' : 'Assigner une équipe'}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {service.equipe ? 'Changer l\'équipe' : 'Assigner une équipe'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            Sélectionnez une équipe disponible pour ce service
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Select value={selectedEquipe} onValueChange={setSelectedEquipe}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une équipe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Aucune (retirer l'équipe)</SelectItem>
                                                {availableEquipes.map((equipe) => (
                                                    <SelectItem key={equipe.id} value={equipe.id.toString()}>
                                                        {equipe.name} ({equipe.specialite_label})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button onClick={handleAssignEquipe} disabled={!selectedEquipe}>
                                            Confirmer
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>

                {/* Détails de l'équipe */}
                {service.equipe && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Équipe: {service.equipe.name}</CardTitle>
                                <CardDescription>
                                    {service.equipe.specialite_label} • {service.equipe.membres.length} membre(s)
                                </CardDescription>
                            </div>
                            <Link href={`/equipes/${service.equipe.id}`}>
                                <Button variant="outline" size="sm">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Voir l'équipe
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Infos équipe */}
                            <div className="grid gap-4 md:grid-cols-2">
                                {service.equipe.chef_equipe && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Chef d'équipe</p>
                                            <p className="font-medium">{service.equipe.chef_equipe}</p>
                                        </div>
                                    </div>
                                )}
                                {service.equipe.telephone && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Phone className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Téléphone</p>
                                            <p className="font-medium">{service.equipe.telephone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Liste des membres */}
                            {service.equipe.membres.length > 0 && (
                                <div className="pt-4 border-t">
                                    <h4 className="font-medium mb-3">Membres de l'équipe</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nom</TableHead>
                                                <TableHead>Spécialité</TableHead>
                                                <TableHead>Téléphone</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {service.equipe.membres.map((membre) => (
                                                <TableRow key={membre.id}>
                                                    <TableCell>
                                                        <Link
                                                            href={`/techniciens/${membre.id}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {membre.nom_complet}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {membre.specialite_label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{membre.telephone || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
