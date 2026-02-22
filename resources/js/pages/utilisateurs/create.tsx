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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface TechnicienOption {
    id: number;
    nom: string;
    prenom: string | null;
    specialite: string | null;
}

interface Props {
    roles: string[];
    techniciens: TechnicienOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Utilisateurs', href: '/utilisateurs' },
    { title: 'Ajouter', href: '/utilisateurs/create' },
];

const roleLabels: Record<string, string> = {
    admin: 'Admin',
    chef_chantier: 'Chef de Chantier',
    technicien: 'Technicien',
};

export default function UtilisateursCreate({ roles, techniciens }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: '',
        status: 'active',
        technicien_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/utilisateurs');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ajouter un utilisateur" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/utilisateurs">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Ajouter un utilisateur</h1>
                        <p className="text-muted-foreground">
                            Créez un nouveau compte utilisateur
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations de l'utilisateur</CardTitle>
                            <CardDescription>
                                Remplissez les informations du nouvel utilisateur
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Nom et prénom"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@exemple.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="0600000000"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <Label htmlFor="role">Rôle *</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(value) => {
                                        setData('role', value);
                                        if (value !== 'technicien') setData('technicien_id', '');
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {roleLabels[role] || role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>

                            {/* Technicien (if role is technicien) */}
                            {data.role === 'technicien' && (
                                <div className="space-y-2">
                                    <Label htmlFor="technicien_id">Technicien associé *</Label>
                                    <Select
                                        value={data.technicien_id}
                                        onValueChange={(value) => setData('technicien_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un technicien" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {techniciens.length === 0 ? (
                                                <SelectItem value="" disabled>Aucun technicien disponible</SelectItem>
                                            ) : (
                                                techniciens.map((t) => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        {t.prenom ? `${t.prenom} ` : ''}{t.nom} {t.specialite ? `(${t.specialite})` : ''}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.technicien_id} />
                                </div>
                            )}

                            {/* Status */}
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
                                        <SelectItem value="active">Actif</SelectItem>
                                        <SelectItem value="inactive">Inactif</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Minimum 8 caractères"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Password Confirmation */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirmer le mot de passe *</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Répéter le mot de passe"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Création...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Créer l'utilisateur
                                        </>
                                    )}
                                </Button>
                                <Link href="/utilisateurs">
                                    <Button type="button" variant="outline">
                                        Annuler
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
