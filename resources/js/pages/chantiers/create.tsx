import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Head, Link, useForm } from '@inertiajs/react';
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

interface Props {
    responsables: Responsable[];
    clients: Client[];
    statuts: Record<string, string>;
    reference: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chantiers', href: '/chantiers' },
    { title: 'Nouveau', href: '/chantiers/create' },
];

export default function ChantierCreate({ responsables, clients, statuts, reference }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        reference: reference,
        nom: '',
        localisation: '',
        latitude: null as number | null,
        longitude: null as number | null,
        adresse: '',
        date_debut: '',
        date_fin_prevue: '',
        statut: 'en_cours',
        client_id: '',
        user_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/chantiers');
    };

    const handleLocationChange = (location: { address: string; latitude: number | null; longitude: number | null }) => {
        setData(prev => ({
            ...prev,
            localisation: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau Chantier" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* En-tête */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/chantiers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nouveau Chantier</h1>
                        <p className="text-muted-foreground">
                            Créez un nouveau chantier
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informations de base */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations de base</CardTitle>
                            <CardDescription>
                                Renseignez les informations principales du chantier
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="reference">Référence</Label>
                                    <Input
                                        id="reference"
                                        value={data.reference}
                                        onChange={(e) => setData('reference', e.target.value)}
                                        className="bg-muted"
                                        readOnly
                                    />
                                    {errors.reference && (
                                        <p className="text-sm text-destructive">{errors.reference}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="statut">Statut *</Label>
                                    <Select
                                        value={data.statut}
                                        onValueChange={(value) => setData('statut', value)}
                                    >
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
                                Associez le chantier à un client et assignez un responsable
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
                            <Link href="/chantiers">Annuler</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
