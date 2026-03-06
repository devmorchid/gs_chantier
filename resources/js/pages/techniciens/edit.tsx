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
import { useRef, useState } from 'react';

interface Technicien {
    id: number;
    nom: string;
    prenom: string | null;
    telephone: string | null;
    cin: string | null;
    specialite: string | null;
    salaire_journalier: number | null;
    disponible: boolean;
    notes: string | null;
    photo: string | null;
}

interface Props {
    technicien: Technicien;
    specialites: Record<string, string>;
}

export default function TechnicienEdit({ technicien, specialites }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Techniciens', href: '/techniciens' },
        { title: `${technicien.prenom || ''} ${technicien.nom}`.trim(), href: `/techniciens/${technicien.id}` },
        { title: 'Modifier', href: `/techniciens/${technicien.id}/edit` },
    ];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, patch, processing, errors } = useForm({
        nom: technicien.nom,
        prenom: technicien.prenom || '',
        telephone: technicien.telephone || '',
        cin: technicien.cin || '',
        specialite: technicien.specialite || '',
        salaire_journalier: technicien.salaire_journalier?.toString() || '',
        disponible: technicien.disponible,
        notes: technicien.notes || '',
        photo: null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/techniciens/${technicien.id}`, { forceFormData: true });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier - ${technicien.nom}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/techniciens/${technicien.id}`}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Modifier le Technicien</h1>
                        <p className="text-muted-foreground">
                            {technicien.prenom} {technicien.nom}
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

                                <div className="space-y-2">
                                    <Label htmlFor="photo">Photo</Label>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-24 h-24 rounded-full mt-2 object-cover border-2 border-blue-400" />
                                    ) : technicien.photo_reference ? (
                                        <img src={technicien.photo_reference} alt="Photo actuelle" className="w-24 h-24 rounded-full mt-2 object-cover border-2 border-gray-400" />
                                    ) : null}
                                    {errors.photo && (
                                        <p className="text-sm text-red-500">{errors.photo}</p>
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
                        <Link href={`/techniciens/${technicien.id}`}>
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
