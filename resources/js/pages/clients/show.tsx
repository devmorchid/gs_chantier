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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Eye,
    HardHat,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Trash2,
    User,
} from 'lucide-react';

interface Client {
    id: number;
    reference: string;
    nom: string;
    telephone: string | null;
    email: string | null;
    adresse: string | null;
    ville: string | null;
    type: string;
    type_label: string;
    ice: string | null;
    notes: string | null;
    created_at: string;
}

interface Chantier {
    id: number;
    reference: string;
    nom: string;
    statut: string;
    statut_label: string;
    date_debut: string;
    responsable: {
        id: number;
        name: string;
    } | null;
}

interface Props {
    client: Client;
    chantiers: Chantier[];
    types: Record<string, string>;
}

const getStatutVariant = (statut: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        en_attente: 'secondary',
        en_cours: 'default',
        termine: 'outline',
        suspendu: 'destructive',
        annule: 'destructive',
    };
    return variants[statut] || 'default';
};

export default function ClientShow({ client, chantiers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Clients', href: '/clients' },
        { title: client.reference, href: `/clients/${client.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            router.delete(`/clients/${client.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${client.reference} - ${client.nom}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* En-tête */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/clients">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{client.nom}</h1>
                                <Badge variant={client.type === 'entreprise' ? 'default' : 'secondary'}>
                                    {client.type_label}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">{client.reference}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/clients/${client.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Informations du client */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {client.type === 'entreprise' ? (
                                    <Building2 className="h-5 w-5" />
                                ) : (
                                    <User className="h-5 w-5" />
                                )}
                                Informations du client
                            </CardTitle>
                            <CardDescription>
                                Coordonnées et détails du client
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {client.telephone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{client.telephone}</span>
                                    </div>
                                )}
                                {client.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a
                                            href={`mailto:${client.email}`}
                                            className="text-primary hover:underline"
                                        >
                                            {client.email}
                                        </a>
                                    </div>
                                )}
                                {client.ice && (
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <span>ICE: {client.ice}</span>
                                    </div>
                                )}
                            </div>
                            {(client.adresse || client.ville) && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        {client.adresse && <div>{client.adresse}</div>}
                                        {client.ville && (
                                            <div className="text-muted-foreground">{client.ville}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {client.notes && (
                                <div className="mt-4 rounded-md bg-muted p-4">
                                    <h4 className="font-medium mb-2">Notes</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {client.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Statistiques */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistiques</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Total chantiers</span>
                                <span className="text-2xl font-bold">{chantiers.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">En cours</span>
                                <span className="text-lg font-semibold text-blue-600">
                                    {chantiers.filter((c) => c.statut === 'en_cours').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Terminés</span>
                                <span className="text-lg font-semibold text-green-600">
                                    {chantiers.filter((c) => c.statut === 'termine').length}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                                <Calendar className="h-4 w-4" />
                                <span>Client depuis le {client.created_at}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chantiers du client */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <HardHat className="h-5 w-5" />
                                    Chantiers
                                </CardTitle>
                                <CardDescription>
                                    Liste des chantiers associés à ce client
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={`/chantiers/create?client_id=${client.id}`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nouveau Chantier
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {chantiers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <HardHat className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="font-semibold">Aucun chantier</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Ce client n'a pas encore de chantier associé
                                </p>
                                <Button asChild>
                                    <Link href={`/chantiers/create?client_id=${client.id}`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Créer un chantier
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Référence</TableHead>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Date début</TableHead>
                                        <TableHead>Responsable</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {chantiers.map((chantier) => (
                                        <TableRow key={chantier.id}>
                                            <TableCell className="font-medium">
                                                {chantier.reference}
                                            </TableCell>
                                            <TableCell>{chantier.nom}</TableCell>
                                            <TableCell>{chantier.date_debut}</TableCell>
                                            <TableCell>
                                                {chantier.responsable?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatutVariant(chantier.statut)}>
                                                    {chantier.statut_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/chantiers/${chantier.id}`}>
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
        </AppLayout>
    );
}
