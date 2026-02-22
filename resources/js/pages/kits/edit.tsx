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

interface Kit {
    id: number;
    name: string;
    type: string;
    disponibilite: boolean;
    telephone: string | null;
    description: string | null;
}

interface Props {
    kit: Kit;
    types: Record<string, string>;
}

export default function KitEdit({ kit, types }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kits / Équipes', href: '/kits' },
        { title: kit.name, href: `/kits/${kit.id}` },
        { title: 'Modifier', href: `/kits/${kit.id}/edit` },
    ];

    const { data, setData, patch, processing, errors } = useForm({
        name: kit.name,
        type: kit.type,
        disponibilite: kit.disponibilite,
        telephone: kit.telephone || '',
        description: kit.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/kits/${kit.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier - ${kit.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/kits/${kit.id}`}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Modifier le kit</h1>
                        <p className="text-muted-foreground">{kit.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>Informations du kit</CardTitle>
                            <CardDescription>
                                Détails de l'équipe ou du technicien
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ex: Équipe Électricité A"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Spécialisation *</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) => setData('type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une spécialisation" />
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
                                <Label htmlFor="telephone">Téléphone</Label>
                                <Input
                                    id="telephone"
                                    value={data.telephone}
                                    onChange={(e) => setData('telephone', e.target.value)}
                                    placeholder="Ex: 0612345678"
                                />
                                {errors.telephone && (
                                    <p className="text-sm text-red-500">{errors.telephone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Notes sur cette équipe..."
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="disponibilite"
                                    checked={data.disponibilite}
                                    onCheckedChange={(checked) => setData('disponibilite', checked)}
                                />
                                <Label htmlFor="disponibilite">Disponible</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-4">
                        <Link href={`/kits/${kit.id}`}>
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
