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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
    types: Record<string, string>;
    reference: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clients', href: '/clients' },
    { title: 'Nouveau', href: '/clients/create' },
];

export default function ClientCreate({ types, reference }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        reference: reference,
        nom: '',
        telephone: '',
        email: '',
        adresse: '',
        ville: '',
        type: 'particulier',
        ice: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/clients');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau Client" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* En-tête */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/clients">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nouveau Client</h1>
                        <p className="text-muted-foreground">
                            Ajoutez un nouveau client à votre base de données
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations du client</CardTitle>
                            <CardDescription>
                                Renseignez les informations de base du client
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
                                    <Label htmlFor="type">Type *</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(types).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-destructive">{errors.type}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom *</Label>
                                <Input
                                    id="nom"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    placeholder="Nom du client ou de l'entreprise"
                                />
                                {errors.nom && (
                                    <p className="text-sm text-destructive">{errors.nom}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ice">ICE (Identifiant Commun de l'Entreprise)</Label>
                                <Input
                                    id="ice"
                                    value={data.ice}
                                    onChange={(e) => setData('ice', e.target.value.replace(/\D/g, '').slice(0, 15))}
                                    placeholder="000000000000000"
                                    maxLength={15}
                                />
                                <p className="text-xs text-muted-foreground">15 chiffres (optionnel)</p>
                                {errors.ice && (
                                    <p className="text-sm text-destructive">{errors.ice}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="telephone">Téléphone</Label>
                                    <Input
                                        id="telephone"
                                        value={data.telephone}
                                        onChange={(e) => setData('telephone', e.target.value)}
                                        placeholder="06 00 00 00 00"
                                    />
                                    {errors.telephone && (
                                        <p className="text-sm text-destructive">{errors.telephone}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@exemple.com"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adresse">Adresse</Label>
                                <Textarea
                                    id="adresse"
                                    value={data.adresse}
                                    onChange={(e) => setData('adresse', e.target.value)}
                                    placeholder="Adresse complète du client"
                                    rows={2}
                                />
                                {errors.adresse && (
                                    <p className="text-sm text-destructive">{errors.adresse}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ville">Ville</Label>
                                <Input
                                    id="ville"
                                    value={data.ville}
                                    onChange={(e) => setData('ville', e.target.value)}
                                    placeholder="Ville"
                                />
                                {errors.ville && (
                                    <p className="text-sm text-destructive">{errors.ville}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Notes supplémentaires..."
                                    rows={3}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-destructive">{errors.notes}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/clients">Annuler</Link>
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
