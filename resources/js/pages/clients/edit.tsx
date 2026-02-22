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

interface Client {
    id: number;
    reference: string;
    nom: string;
    telephone: string | null;
    email: string | null;
    adresse: string | null;
    ville: string | null;
    type: string;
    ice: string | null;
    notes: string | null;
}

interface Props {
    client: Client;
    types: Record<string, string>;
}

export default function ClientEdit({ client, types }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Clients', href: '/clients' },
        { title: client.reference, href: `/clients/${client.id}` },
        { title: 'Modifier', href: `/clients/${client.id}/edit` },
    ];

    const { data, setData, patch, processing, errors } = useForm({
        nom: client.nom,
        telephone: client.telephone || '',
        email: client.email || '',
        adresse: client.adresse || '',
        ville: client.ville || '',
        type: client.type,
        ice: client.ice || '',
        notes: client.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/clients/${client.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${client.reference}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* En-tête */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/clients/${client.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Modifier Client</h1>
                        <p className="text-muted-foreground">
                            {client.reference} - {client.nom}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations du client</CardTitle>
                            <CardDescription>
                                Modifiez les informations du client
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="reference">Référence</Label>
                                    <Input
                                        id="reference"
                                        value={client.reference}
                                        className="bg-muted"
                                        readOnly
                                    />
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
                            <Link href={`/clients/${client.id}`}>Annuler</Link>
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
