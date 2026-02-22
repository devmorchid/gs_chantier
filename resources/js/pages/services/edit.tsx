import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Chantier {
    id: number;
    reference: string;
    nom: string;
}

interface Service {
    id: number;
    chantier_id: number;
    name: string;
    type: string;
    price: number | null;
    duree_estimee: number | null;
    status: string;
}

interface Props {
    service: Service;
    chantiers: Chantier[];
    types: Record<string, string>;
    statuts: Record<string, string>;
}

export default function ServiceEdit({
    service,
    chantiers,
    types,
    statuts,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Services', href: '/services' },
        { title: service.name, href: `/services/${service.id}` },
        { title: 'Modifier', href: `/services/${service.id}/edit` },
    ];

    const { data, setData, patch, processing, errors } = useForm({
        chantier_id: service.chantier_id.toString(),
        name: service.name,
        type: service.type,
        price: service.price?.toString() || '',
        duree_estimee: service.duree_estimee?.toString() || '',
        status: service.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/services/${service.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier - ${service.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/services/${service.id}`}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Modifier le Service</h1>
                        <p className="text-muted-foreground">
                            {service.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Informations principales */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations principales</CardTitle>
                                <CardDescription>
                                    Modifier les détails du service
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="chantier_id">Chantier *</Label>
                                    <Select
                                        value={data.chantier_id}
                                        onValueChange={(value) => setData('chantier_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un chantier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {chantiers.map((chantier) => (
                                                <SelectItem key={chantier.id} value={chantier.id.toString()}>
                                                    {chantier.reference} - {chantier.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.chantier_id && (
                                        <p className="text-sm text-red-500">{errors.chantier_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom du service *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ex: Installation électrique salon"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type de service *</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(types).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-red-500">{errors.type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Statut *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(statuts).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-500">{errors.status}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Détails financiers */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Détails financiers</CardTitle>
                                <CardDescription>
                                    Prix et durée estimée
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Prix (MAD)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-red-500">{errors.price}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duree_estimee">Durée estimée (heures)</Label>
                                    <Input
                                        id="duree_estimee"
                                        type="number"
                                        min="0"
                                        value={data.duree_estimee}
                                        onChange={(e) => setData('duree_estimee', e.target.value)}
                                        placeholder="Ex: 8"
                                    />
                                    {errors.duree_estimee && (
                                        <p className="text-sm text-red-500">{errors.duree_estimee}</p>
                                    )}
                                </div>

                                <div className="rounded-md border p-4 bg-muted/50">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Note:</strong> Les affectations de kits sont gérées 
                                        depuis la page de détails du service.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-4">
                        <Link href={`/services/${service.id}`}>
                            <Button variant="outline" type="button">
                                Annuler
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer les modifications
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
