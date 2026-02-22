import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Phone,
    User,
    Users,
    Wrench,
    CheckCircle,
    XCircle,
    UserPlus,
    UserMinus,
    ExternalLink,
} from 'lucide-react';
import { useState } from 'react';

interface Membre {
    id: number;
    nom_complet: string;
    telephone?: string | null;
    specialite_label: string;
    role: string | null;
    date_affectation: string | null;
}

interface Service {
    id: number;
    name: string;
    type_label: string | null;
    status: string;
    status_label: string;
    chantier: {
        id: number;
        reference: string;
        nom: string;
    } | null;
}

interface Equipe {
    id: number;
    name: string;
    specialite: string | null;
    specialite_label: string;
    chef_equipe: string | null;
    telephone: string | null;
    disponible: boolean;
    description: string | null;
    created_at: string;
}

interface AvailableTechnicien {
    id: number;
    nom_complet: string;
    specialite_label: string;
}

interface Props {
    equipe: Equipe;
    membres: Membre[];
    services: Service[];
    specialites: Record<string, string>;
    availableTechniciens: AvailableTechnicien[];
}

const specialiteBadgeColors: Record<string, string> = {
    electricien: 'bg-yellow-100 text-yellow-800',
    plombier: 'bg-blue-100 text-blue-800',
    macon: 'bg-gray-100 text-gray-800',
    peintre: 'bg-purple-100 text-purple-800',
    menuisier: 'bg-amber-100 text-amber-800',
    carreleur: 'bg-cyan-100 text-cyan-800',
    climatisation: 'bg-sky-100 text-sky-800',
    soudeur: 'bg-orange-100 text-orange-800',
    manoeuvre: 'bg-stone-100 text-stone-800',
    polyvalent: 'bg-green-100 text-green-800',
    autre: 'bg-slate-100 text-slate-800',
};

const statutColors: Record<string, string> = {
    en_attente: 'bg-gray-100 text-gray-700',
    en_cours: 'bg-blue-100 text-blue-700',
    termine: 'bg-green-100 text-green-700',
    annule: 'bg-red-100 text-red-700',
};

export default function EquipeShow({ equipe, membres, services, specialites, availableTechniciens }: Props) {
    const [selectedTechnicien, setSelectedTechnicien] = useState<string>('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Équipes', href: '/equipes' },
        { title: equipe.name, href: `/equipes/${equipe.id}` },
    ];

    const handleAddMembre = () => {
        if (!selectedTechnicien) return;
        router.post(`/equipes/${equipe.id}/membres`, {
            technicien_id: parseInt(selectedTechnicien),
        }, {
            onSuccess: () => setSelectedTechnicien(''),
        });
    };

    const handleRemoveMembre = (technicienId: number) => {
        router.delete(`/equipes/${equipe.id}/membres/${technicienId}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={equipe.name} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/equipes">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{equipe.name}</h1>
                                <Badge className={specialiteBadgeColors[equipe.specialite || 'autre']}>
                                    {equipe.specialite_label}
                                </Badge>
                                <Badge variant={equipe.disponible ? 'default' : 'secondary'}>
                                    {equipe.disponible ? 'Disponible' : 'Indisponible'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                {membres.length} membre(s) • {services.length} service(s)
                            </p>
                        </div>
                    </div>
                    <Link href={`/equipes/${equipe.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Informations de l'équipe */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Wrench className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Spécialité</p>
                                    <p className="font-medium">{equipe.specialite_label}</p>
                                </div>
                            </div>

                            {equipe.chef_equipe && (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Chef d'équipe</p>
                                        <p className="font-medium">{equipe.chef_equipe}</p>
                                    </div>
                                </div>
                            )}

                            {equipe.telephone && (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Téléphone</p>
                                        <p className="font-medium">{equipe.telephone}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Membres</p>
                                    <p className="font-medium">{membres.length} technicien(s)</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    {equipe.disponible ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Statut</p>
                                    <p className="font-medium">
                                        {equipe.disponible ? 'Disponible' : 'Indisponible'}
                                    </p>
                                </div>
                            </div>

                            {equipe.description && (
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                                    <p className="text-sm">{equipe.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Membres de l'équipe */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Membres de l'équipe</CardTitle>
                                    <CardDescription>
                                        Techniciens assignés à cette équipe
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Ajouter un membre */}
                            {availableTechniciens.length > 0 && (
                                <div className="flex gap-2 pb-4 border-b">
                                    <Select
                                        value={selectedTechnicien}
                                        onValueChange={setSelectedTechnicien}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Sélectionner un technicien..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTechniciens.map((tech) => (
                                                <SelectItem key={tech.id} value={tech.id.toString()}>
                                                    {tech.nom_complet} ({tech.specialite_label})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={handleAddMembre}
                                        disabled={!selectedTechnicien}
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Ajouter
                                    </Button>
                                </div>
                            )}

                            {/* Liste des membres */}
                            {membres.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    Aucun membre dans cette équipe
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nom</TableHead>
                                            <TableHead>Spécialité</TableHead>
                                            <TableHead>Téléphone</TableHead>
                                            <TableHead className="w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {membres.map((membre) => (
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
                                                    <Badge className={specialiteBadgeColors[membre.specialite_label?.toLowerCase() || 'autre']}>
                                                        {membre.specialite_label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{membre.telephone || '-'}</TableCell>
                                                <TableCell>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <UserMinus className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Voulez-vous retirer {membre.nom_complet} de cette équipe ?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleRemoveMembre(membre.id)}
                                                                    className="bg-red-500 hover:bg-red-600"
                                                                >
                                                                    Retirer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Services assignés */}
                <Card>
                    <CardHeader>
                        <CardTitle>Services assignés</CardTitle>
                        <CardDescription>
                            Services actuellement effectués par cette équipe
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {services.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Aucun service assigné à cette équipe
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Chantier</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-medium">{service.name}</TableCell>
                                            <TableCell>
                                                {service.chantier ? (
                                                    <Link
                                                        href={`/chantiers/${service.chantier.id}`}
                                                        className="hover:underline text-blue-600"
                                                    >
                                                        {service.chantier.reference}
                                                    </Link>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statutColors[service.status] || 'bg-gray-100 text-gray-700'}>
                                                    {service.status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/services/${service.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
