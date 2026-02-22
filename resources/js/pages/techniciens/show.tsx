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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Edit,
    Phone,
    CreditCard,
    Banknote,
    UserCheck,
    UserX,
    Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Equipe {
    id: number;
    name: string;
    specialite_label: string;
    role: string | null;
    services_count: number;
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
    notes: string | null;
    created_at: string;
}

interface Props {
    technicien: Technicien;
    equipes: Equipe[];
    specialites: Record<string, string>;
}

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

export default function TechnicienShow({ technicien, equipes }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Techniciens', href: '/techniciens' },
        { title: technicien.nom_complet, href: `/techniciens/${technicien.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={technicien.nom_complet} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/techniciens">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {technicien.nom_complet}
                                </h1>
                                {technicien.specialite && (
                                    <Badge className={specialiteBadgeColors[technicien.specialite]}>
                                        {technicien.specialite_label}
                                    </Badge>
                                )}
                                <Badge variant={technicien.disponible ? 'default' : 'secondary'}>
                                    {technicien.disponible ? 'Disponible' : 'Indisponible'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                Ajouté {formatDistanceToNow(new Date(technicien.created_at), { 
                                    addSuffix: true, 
                                    locale: fr 
                                })}
                            </p>
                        </div>
                    </div>
                    <Link href={`/techniciens/${technicien.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                        </Button>
                    </Link>
                </div>

                {/* Info Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Téléphone</CardTitle>
                            <Phone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                {technicien.telephone || '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">CIN</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                {technicien.cin || '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Salaire/jour</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">
                                {technicien.salaire_journalier 
                                    ? `${technicien.salaire_journalier} MAD`
                                    : '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Équipes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{equipes.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Notes */}
                {technicien.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {technicien.notes}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Équipes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Équipes</CardTitle>
                        <CardDescription>
                            Les équipes auxquelles appartient ce technicien
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {equipes.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Ce technicien n'appartient à aucune équipe
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Équipe</TableHead>
                                        <TableHead>Spécialité</TableHead>
                                        <TableHead>Rôle</TableHead>
                                        <TableHead>Services actifs</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {equipes.map((equipe) => (
                                        <TableRow key={equipe.id}>
                                            <TableCell className="font-medium">
                                                {equipe.name}
                                            </TableCell>
                                            <TableCell>{equipe.specialite_label}</TableCell>
                                            <TableCell>{equipe.role || '-'}</TableCell>
                                            <TableCell>{equipe.services_count}</TableCell>
                                            <TableCell>
                                                <Link href={`/equipes/${equipe.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        Voir l'équipe
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
