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

interface Equipe {
    id: number;
    name: string;
    specialite: string | null;
    chef_equipe: string | null;
    telephone: string | null;
    disponible: boolean;
    description: string | null;
}

interface Props {
    equipe: Equipe;
    specialites: Record<string, string>;
}

export default function EquipeEdit({ equipe, specialites }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Équipes', href: '/equipes' },
        { title: equipe.name, href: `/equipes/${equipe.id}` },
        { title: 'Modifier', href: `/equipes/${equipe.id}/edit` },
    ];

    const { data, setData, patch, processing, errors } = useForm({
        name: equipe.name || '',
        specialite: equipe.specialite || 'polyvalent',
        chef_equipe: equipe.chef_equipe || '',
        telephone: equipe.telephone || '',
        disponible: equipe.disponible,
        description: equipe.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/equipes/${equipe.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${equipe.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/equipes/${equipe.id}`}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Modifier {equipe.name}</h1>
                        <p className="text-muted-foreground">
                            Modifier les informations de l'équipe
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations de l'équipe</CardTitle>
                            <CardDescription>
                                Modifier les détails de l'équipe. Pour gérer les membres, allez sur la page de détails.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom de l'équipe *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ex: IKIB Plomberie Nord"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specialite">Spécialité *</Label>
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
                                    <Label htmlFor="chef_equipe">Chef d'équipe</Label>
                                    <Input
                                        id="chef_equipe"
                                        value={data.chef_equipe}
                                        onChange={(e) => setData('chef_equipe', e.target.value)}
                                        placeholder="Nom du responsable"
                                    />
                                    {errors.chef_equipe && (
                                        <p className="text-sm text-red-500">{errors.chef_equipe}</p>
                                    )}
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
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Disponible</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Cette équipe est-elle disponible pour de nouveaux services ?
                                    </p>
                                </div>
                                <Switch
                                    checked={data.disponible}
                                    onCheckedChange={(checked) => setData('disponible', checked)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Description de l'équipe..."
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-4">
                        <Link href={`/equipes/${equipe.id}`}>
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
