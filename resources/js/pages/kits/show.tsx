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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Users,
    Phone,
    Calendar,
    Wrench,
    CheckCircle,
    XCircle,
    Eye,
} from 'lucide-react';
import { useState } from 'react';

interface Chantier {
    id: number;
    nom: string;
    reference: string;
}

interface Service {
    id: number;
    name: string;
    type_label: string;
    chantier: Chantier | null;
}

interface Assignment {
    id: number;
    service: Service;
    status: string;
    status_label: string;
    date_assigned: string | null;
    date_done: string | null;
    notes: string | null;
}

interface Kit {
    id: number;
    name: string;
    type: string;
    type_label: string;
    disponibilite: boolean;
    disponibilite_label: string;
    telephone: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    kit: Kit;
    assignments: Assignment[];
    assignmentStatuts: Record<string, string>;
}

const typeBadgeColors: Record<string, string> = {
    electricien: 'bg-yellow-100 text-yellow-800',
    plombier: 'bg-blue-100 text-blue-800',
    macon: 'bg-orange-100 text-orange-800',
    peintre: 'bg-pink-100 text-pink-800',
    menuisier: 'bg-amber-100 text-amber-800',
    carreleur: 'bg-cyan-100 text-cyan-800',
    climatisation: 'bg-sky-100 text-sky-800',
    soudeur: 'bg-red-100 text-red-800',
    autre: 'bg-gray-100 text-gray-800',
};

const statusBadgeColors: Record<string, string> = {
    en_attente: 'bg-yellow-100 text-yellow-800',
    en_cours: 'bg-blue-100 text-blue-800',
    termine: 'bg-green-100 text-green-800',
};

export default function KitShow({ kit, assignments, assignmentStatuts }: Props) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kits / Équipes', href: '/kits' },
        { title: kit.name, href: `/kits/${kit.id}` },
    ];

    const handleDelete = () => {
        router.delete(`/kits/${kit.id}`);
    };

    const handleAssignmentStatusChange = (assignment: Assignment, newStatus: string) => {
        router.patch(`/assignments/${assignment.id}/status`, { status: newStatus });
    };

    const handleDeleteAssignment = () => {
        if (assignmentToDelete) {
            router.delete(`/assignments/${assignmentToDelete.id}`);
            setAssignmentToDelete(null);
        }
    };

    const toggleDisponibilite = () => {
        router.patch(`/kits/${kit.id}/toggle-disponibilite`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={kit.name} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/kits">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {kit.name}
                                </h1>
                                <Badge className={typeBadgeColors[kit.type]}>
                                    {kit.type_label}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                Créé le {kit.created_at}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={toggleDisponibilite}
                            className={kit.disponibilite ? 'text-green-600' : 'text-red-600'}
                        >
                            {kit.disponibilite ? (
                                <><CheckCircle className="mr-2 h-4 w-4" /> Disponible</>
                            ) : (
                                <><XCircle className="mr-2 h-4 w-4" /> Indisponible</>
                            )}
                        </Button>
                        <Link href={`/kits/${kit.id}/edit`}>
                            <Button variant="outline">
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Informations du kit */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Informations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Spécialisation</p>
                                <Badge className={typeBadgeColors[kit.type]}>
                                    {kit.type_label}
                                </Badge>
                            </div>
                            {kit.telephone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{kit.telephone}</span>
                                </div>
                            )}
                            {kit.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="mt-1">{kit.description}</p>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Mis à jour le {kit.updated_at}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistiques */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Statistiques</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {assignments.filter(a => a.status === 'en_attente').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">En attente</p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {assignments.filter(a => a.status === 'en_cours').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">En cours</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">
                                        {assignments.filter(a => a.status === 'termine').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Terminées</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Affectations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            Affectations
                        </CardTitle>
                        <CardDescription>
                            Services assignés à ce kit
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {assignments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Wrench className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="font-semibold">Aucune affectation</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ce kit n'a pas encore d'affectations
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Chantier</TableHead>
                                        <TableHead>Date assignation</TableHead>
                                        <TableHead>Date fin</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments.map((assignment) => (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={`/services/${assignment.service.id}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {assignment.service.name}
                                                </Link>
                                                <p className="text-sm text-muted-foreground">
                                                    {assignment.service.type_label}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {assignment.service.chantier ? (
                                                    <Link
                                                        href={`/chantiers/${assignment.service.chantier.id}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {assignment.service.chantier.nom}
                                                    </Link>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {assignment.date_assigned || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {assignment.date_done || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={assignment.status}
                                                    onValueChange={(value) => handleAssignmentStatusChange(assignment, value)}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(assignmentStatuts).map(([key, label]) => (
                                                            <SelectItem key={key} value={key}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/services/${assignment.service.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-600"
                                                        onClick={() => setAssignmentToDelete(assignment)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Kit Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le kit ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le kit{' '}
                            <strong>{kit.name}</strong> ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Assignment Dialog */}
            <AlertDialog open={!!assignmentToDelete} onOpenChange={() => setAssignmentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'affectation ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette affectation ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAssignment}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
