
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LeafletMapPicker } from '@/components/ui/leaflet-map-picker';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

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
    latitude: number | null;
    longitude: number | null;
    adresse: string | null;
    date_debut: string;
    date_fin_prevue: string | null;
    statut: string;
    client_id: number | null;
    user_id: number | null;
}

interface Props {
    chantier: Chantier;
    responsables: Responsable[];
    clients: Client[];
    statuts: Record<string, string>;
    attempted?: {
        nom?: string;
        localisation?: string;
        latitude?: number;
        longitude?: number;
        adresse?: string;
        date_debut?: string;
        date_fin_prevue?: string;
        statut?: string;
        client_id?: string | number;
        user_id?: string | number;
    };
}

import { ErrorDialog } from '@/components/error-dialog';
import { DateWarningDialog } from '@/components/ui/date-warning-dialog';

export default function ChantierEdit({ chantier, responsables, clients, statuts, attempted }: Props) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDateDialog, setShowDateDialog] = useState(false);
    const [pendingStatut, setPendingStatut] = useState<string | null>(null);
    const [showBackendDateDialog, setShowBackendDateDialog] = useState(false);
    const { props } = usePage<{ error?: string }>();
    const [error, setError] = useState<string | null>(props.error || null);

    // Clear error state on mount/unmount to prevent stale popups after navigation
    useEffect(() => {
        return () => {
            setError(null);
            setShowBackendDateDialog(false);
        };
    }, []);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Chantiers', href: '/chantiers' },
        { title: chantier.reference, href: `/chantiers/${chantier.id}` },
        { title: 'Modifier', href: `/chantiers/${chantier.id}/edit` },
    ];


    useEffect(() => {
        if (props.error) {
            // Detect backend date error
            if (props.error.includes('date de fin prévue n\'est pas encore atteinte')) {
                setShowBackendDateDialog(true);
                setError(null);
            } else {
                setError(props.error);
            }
        } else {
            setError(null);
            setShowBackendDateDialog(false);
        }
    }, [props.error]);

    const handleDelete = () => {
        setShowDeleteConfirm(false);
        router.delete(`/chantiers/${chantier.id}`);
    };

    const handleBackendDateDialogClose = () => {
        setShowBackendDateDialog(false);
        // Optionally focus the date input
        document.getElementById('date_fin_prevue')?.focus();
    };

    const { data, setData, patch, processing, errors } = useForm({
        nom: attempted?.nom ?? chantier.nom,
        localisation: attempted?.localisation ?? chantier.localisation,
        latitude: attempted?.latitude ?? chantier.latitude,
        longitude: attempted?.longitude ?? chantier.longitude,
        adresse: attempted?.adresse ?? (chantier.adresse || ''),
        date_debut: attempted?.date_debut ?? chantier.date_debut,
        date_fin_prevue: attempted?.date_fin_prevue ?? (chantier.date_fin_prevue || ''),
        statut: attempted?.statut ?? chantier.statut,
        client_id: attempted?.client_id?.toString() ?? chantier.client_id?.toString() ?? '',
        user_id: attempted?.user_id?.toString() ?? chantier.user_id?.toString() ?? '',
    });

    const handleLocationChange = (location: { address: string; latitude: number | null; longitude: number | null }) => {
        setData(prev => ({
            ...prev,
            localisation: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/chantiers/${chantier.id}`);
    };

    // Intercept statut change to 'termine' if date_fin_prevue is in the future
    const handleStatutChange = (value: string) => {
        if (
            value === 'termine' &&
            data.date_fin_prevue &&
            new Date(data.date_fin_prevue) > new Date()
        ) {
            setPendingStatut(value);
            setShowDateDialog(true);
        } else {
            setData('statut', value);
        }
    };

    const handleChangeDate = () => {
        setShowDateDialog(false);
        // Optionally focus the date input or scroll to it
        document.getElementById('date_fin_prevue')?.focus();
    };

    const handleWait = () => {
        setShowDateDialog(false);
        setPendingStatut(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${chantier.reference}`} />
            {/* Show ErrorDialog for any chantier error, including deletion errors */}
            {error && (
                <ErrorDialog open={!!error} message={error} onClose={() => setError(null)} />
            )}
            {/* Backend date validation error dialog */}
            <DateWarningDialog
                open={showBackendDateDialog}
                date={data.date_fin_prevue}
                onClose={handleBackendDateDialogClose}
                onChangeDate={handleBackendDateDialogClose}
                onWait={handleBackendDateDialogClose}
            />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* En-tête */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/chantiers/${chantier.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Modifier Chantier</h1>
                        <p className="text-muted-foreground">
                            {chantier.reference} - {chantier.nom}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informations de base */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations de base</CardTitle>
                            <CardDescription>
                                Modifiez les informations principales du chantier
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="reference">Référence</Label>
                                    <Input
                                        id="reference"
                                        value={chantier.reference}
                                        className="bg-muted"
                                        readOnly
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="statut">Statut *</Label>
                                    <Select
                                        value={data.statut}
                                        onValueChange={handleStatutChange}
                                    >
                                                    {/* Date de fin prévue not reached dialog */}
                                                    <DateWarningDialog
                                                        open={showDateDialog}
                                                        date={data.date_fin_prevue}
                                                        onClose={() => setShowDateDialog(false)}
                                                        onChangeDate={handleChangeDate}
                                                        onWait={handleWait}
                                                    />
                                        <SelectTrigger>
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
                                    {errors.statut && (
                                        <p className="text-sm text-destructive">{errors.statut}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom du chantier *</Label>
                                <Input
                                    id="nom"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    placeholder="Ex: Construction Villa Modern"
                                />
                                {errors.nom && (
                                    <p className="text-sm text-destructive">{errors.nom}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="localisation">Localisation *</Label>
                                <LeafletMapPicker
                                    value={data.localisation}
                                    latitude={data.latitude}
                                    longitude={data.longitude}
                                    onChange={handleLocationChange}
                                    placeholder="Rechercher une adresse au Maroc..."
                                />
                                <p className="text-xs text-muted-foreground">Cliquez sur 📍 pour ouvrir la carte</p>
                                {errors.localisation && (
                                    <p className="text-sm text-destructive">{errors.localisation}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adresse">Adresse détaillée</Label>
                                <Textarea
                                    id="adresse"
                                    value={data.adresse}
                                    onChange={(e) => setData('adresse', e.target.value)}
                                    placeholder="Ex: Rue Mohamed V, N°25, Résidence Les Palmiers, 2ème étage"
                                    rows={2}
                                />
                                <p className="text-xs text-muted-foreground">Adresse complète (utilisée dans les devis/factures)</p>
                                {errors.adresse && (
                                    <p className="text-sm text-destructive">{errors.adresse}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="date_debut">Date de début *</Label>
                                    <Input
                                        id="date_debut"
                                        type="date"
                                        value={data.date_debut}
                                        onChange={(e) => setData('date_debut', e.target.value)}
                                    />
                                    {errors.date_debut && (
                                        <p className="text-sm text-destructive">{errors.date_debut}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date_fin_prevue">Date de fin prévue</Label>
                                    <Input
                                        id="date_fin_prevue"
                                        type="date"
                                        value={data.date_fin_prevue}
                                        onChange={(e) => setData('date_fin_prevue', e.target.value)}
                                    />
                                    {errors.date_fin_prevue && (
                                        <p className="text-sm text-destructive">
                                            {errors.date_fin_prevue}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client et Responsable */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client et Responsable</CardTitle>
                            <CardDescription>
                                Modifiez le client et le responsable du chantier
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="client_id">Client *</Label>
                                    <Select
                                        value={data.client_id}
                                        onValueChange={(value) => setData('client_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id.toString()}>
                                                    {client.nom} ({client.reference})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.client_id && (
                                        <p className="text-sm text-destructive">{errors.client_id}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user_id">Responsable (Chef de chantier)</Label>
                                    <Select
                                        value={data.user_id}
                                        onValueChange={(value) => setData('user_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un responsable" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {responsables.map((resp) => (
                                                <SelectItem key={resp.id} value={resp.id.toString()}>
                                                    {resp.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && (
                                        <p className="text-sm text-destructive">{errors.user_id}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/chantiers/${chantier.id}`}>Annuler</Link>
                        </Button>
                        <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                            Supprimer
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer
                        </Button>
                    </div>

                    {/* Delete confirmation dialog */}
                    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer ce chantier ? Cette action est irréversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </form>
            </div>
        </AppLayout>
    );
}
