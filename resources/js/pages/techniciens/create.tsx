import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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

interface Props {
    specialites: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Techniciens', href: '/techniciens' },
    { title: 'Nouveau Technicien', href: '/techniciens/create' },
];

export default function TechnicienCreate({ specialites }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nom: '',
        prenom: '',
        telephone: '',
        cin: '',
        specialite: '',
        salaire_journalier: '',
        disponible: true,
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/techniciens');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau Technicien" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/techniciens">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nouveau Technicien</h1>
                        <p className="text-muted-foreground">
                            Ajouter un nouveau technicien ou ouvrier
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Informations personnelles */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations personnelles</CardTitle>
                                <CardDescription>
                                    Nom, prénom et coordonnées
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nom">Nom *</Label>
                                        <Input
                                            id="nom"
                                            value={data.nom}
                                            onChange={(e) => setData('nom', e.target.value)}
                                            placeholder="Nom de famille"
                                        />
                                        {errors.nom && (
                                            <p className="text-sm text-red-500">{errors.nom}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="prenom">Prénom</Label>
                                        <Input
                                            id="prenom"
                                            value={data.prenom}
                                            onChange={(e) => setData('prenom', e.target.value)}
                                            placeholder="Prénom"
                                        />
                                        {errors.prenom && (
                                            <p className="text-sm text-red-500">{errors.prenom}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telephone">Téléphone</Label>
                                    <Input
                                        id="telephone"
                                        value={data.telephone}
                                        onChange={(e) => setData('telephone', e.target.value)}
                                        placeholder="06XXXXXXXX"
                                    />
                                    {errors.telephone && (
                                        <p className="text-sm text-red-500">{errors.telephone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cin">CIN</Label>
                                    <Input
                                        id="cin"
                                        value={data.cin}
                                        onChange={(e) => setData('cin', e.target.value)}
                                        placeholder="Numéro de CIN"
                                    />
                                    {errors.cin && (
                                        <p className="text-sm text-red-500">{errors.cin}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Détails professionnels */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Détails professionnels</CardTitle>
                                <CardDescription>
                                    Spécialité et salaire
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="specialite">Spécialité</Label>
                                    <Select
                                        value={data.specialite}
                                        onValueChange={(value) => setData('specialite', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner une spécialité" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(specialites).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.specialite && (
                                        <p className="text-sm text-red-500">{errors.specialite}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="salaire_journalier">Salaire journalier (MAD)</Label>
                                    <Input
                                        id="salaire_journalier"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.salaire_journalier}
                                        onChange={(e) => setData('salaire_journalier', e.target.value)}
                                        placeholder="Ex: 200"
                                    />
                                    {errors.salaire_journalier && (
                                        <p className="text-sm text-red-500">{errors.salaire_journalier}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Disponible</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Ce technicien est-il disponible ?
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.disponible}
                                        onCheckedChange={(checked) => setData('disponible', checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Remarques ou informations supplémentaires..."
                                        rows={3}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-red-500">{errors.notes}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-4">
                        <Link href="/techniciens">
                            <Button variant="outline" type="button">
                                Annuler
                            </Button>
                        </Link>
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
