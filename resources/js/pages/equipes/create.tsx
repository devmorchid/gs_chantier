import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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

interface TechnicienOption {
    id: number;
    nom_complet: string;
    specialite: string | null;
}

interface Props {
    specialites: Record<string, string>;
    techniciens: TechnicienOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Équipes', href: '/equipes' },
    { title: 'Nouvelle Équipe', href: '/equipes/create' },
];

export default function EquipeCreate({ specialites, techniciens }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        specialite: 'polyvalent',
        chef_equipe: '',
        telephone: '',
        disponible: true,
        description: '',
        techniciens: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/equipes');
    };

    const toggleTechnicien = (id: number) => {
        if (data.techniciens.includes(id)) {
            setData('techniciens', data.techniciens.filter(t => t !== id));
        } else {
            setData('techniciens', [...data.techniciens, id]);
        }
    };

    // Filtrer les techniciens par spécialité sélectionnée
    const filteredTechniciens = data.specialite && data.specialite !== 'polyvalent'
        ? techniciens.filter(t => t.specialite === data.specialite || !t.specialite)
        : techniciens;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle Équipe" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/equipes">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nouvelle Équipe</h1>
                        <p className="text-muted-foreground">
                            Créer une nouvelle équipe de travail
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Informations de l'équipe */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de l'équipe</CardTitle>
                                <CardDescription>
                                    Nom et spécialité de l'équipe
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                        onValueChange={(value) => {
                                            setData('specialite', value);
                                            setData('techniciens', []); // Reset techniciens when specialite changes
                                        }}
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

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Disponible</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Cette équipe est-elle disponible ?
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

                        {/* Membres de l'équipe */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Membres de l'équipe</CardTitle>
                                <CardDescription>
                                    Sélectionnez les techniciens pour cette équipe
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {filteredTechniciens.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        Aucun technicien disponible
                                    </p>
                                ) : (
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {filteredTechniciens.map((technicien) => (
                                            <div
                                                key={technicien.id}
                                                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50"
                                            >
                                                <Checkbox
                                                    id={`tech-${technicien.id}`}
                                                    checked={data.techniciens.includes(technicien.id)}
                                                    onCheckedChange={() => toggleTechnicien(technicien.id)}
                                                />
                                                <label
                                                    htmlFor={`tech-${technicien.id}`}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    {technicien.nom_complet}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground mt-4">
                                    {data.techniciens.length} technicien(s) sélectionné(s)
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-4">
                        <Link href="/equipes">
                            <Button variant="outline" type="button">
                                Annuler
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Créer l'équipe
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
