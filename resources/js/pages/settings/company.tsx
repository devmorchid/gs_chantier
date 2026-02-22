import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, router } from '@inertiajs/react';
import { Building2, CreditCard, Globe, MapPin, Save, Trash2, Upload } from 'lucide-react';
import { FormEvent, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres entreprise',
        href: '/settings/company',
    },
];

interface CompanySettings {
    name: string | null;
    legal_form: string | null;
    ice: string | null;
    if: string | null;
    rc: string | null;
    cnss: string | null;
    patent: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    country: string | null;
    phone: string | null;
    fax: string | null;
    email: string | null;
    website: string | null;
    bank_name: string | null;
    bank_rib: string | null;
    bank_iban: string | null;
    bank_swift: string | null;
    logo: string | null;
}

interface Props {
    settings: CompanySettings;
    legalForms: Record<string, string>;
}

export default function Company({ settings, legalForms }: Props) {
    const logoInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: settings.name || '',
        legal_form: settings.legal_form || '',
        ice: settings.ice || '',
        if: settings.if || '',
        rc: settings.rc || '',
        cnss: settings.cnss || '',
        patent: settings.patent || '',
        address: settings.address || '',
        city: settings.city || '',
        postal_code: settings.postal_code || '',
        country: settings.country || 'Maroc',
        phone: settings.phone || '',
        fax: settings.fax || '',
        email: settings.email || '',
        website: settings.website || '',
        bank_name: settings.bank_name || '',
        bank_rib: settings.bank_rib || '',
        bank_iban: settings.bank_iban || '',
        bank_swift: settings.bank_swift || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        patch('/settings/company');
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Vérifier la taille (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Le fichier est trop volumineux. Taille maximum: 5MB');
                return;
            }
            
            // Vérifier le type
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Format non supporté. Utilisez: JPG, PNG, GIF, SVG ou WEBP');
                return;
            }
            
            router.post('/settings/company/logo', {
                logo: file,
            }, {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Erreur upload:', errors);
                    alert('Erreur lors du téléversement: ' + (errors.logo || 'Erreur inconnue'));
                },
            });
        }
    };

    const handleLogoDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer le logo ?')) {
            router.delete('/settings/company/logo');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres de l'entreprise" />

            <SettingsLayout>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informations de base */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Informations de l'entreprise
                            </CardTitle>
                            <CardDescription>
                                Ces informations apparaîtront sur vos factures et documents officiels
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Logo */}
                            <div className="space-y-2">
                                <Label>Logo de l'entreprise</Label>
                                <div className="flex items-center gap-4">
                                    {settings.logo ? (
                                        <div className="relative">
                                            <img 
                                                src={`/storage/${settings.logo}`} 
                                                alt="Logo" 
                                                className="h-20 w-20 object-contain rounded-lg border bg-white p-2"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                                            <Building2 className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => logoInputRef.current?.click()}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            {settings.logo ? 'Changer' : 'Téléverser'}
                                        </Button>
                                        {settings.logo && (
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                onClick={handleLogoDelete}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom de l'entreprise</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ma Société SARL"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="legal_form">Forme juridique</Label>
                                    <Select
                                        value={data.legal_form}
                                        onValueChange={(value) => setData('legal_form', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(legalForms).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.legal_form} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Identifiants Fiscaux */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                📋 Identifiants Fiscaux
                            </CardTitle>
                            <CardDescription>
                                Numéros d'identification obligatoires pour les factures
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="ice">ICE</Label>
                                    <Input
                                        id="ice"
                                        value={data.ice}
                                        onChange={(e) => setData('ice', e.target.value.replace(/\D/g, '').slice(0, 15))}
                                        placeholder="000000000000000"
                                        maxLength={15}
                                    />
                                    <p className="text-xs text-muted-foreground">Identifiant Commun de l'Entreprise (15 chiffres)</p>
                                    <InputError message={errors.ice} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="if">IF</Label>
                                    <Input
                                        id="if"
                                        value={data.if}
                                        onChange={(e) => setData('if', e.target.value)}
                                        placeholder="00000000"
                                    />
                                    <p className="text-xs text-muted-foreground">Identifiant Fiscal</p>
                                    <InputError message={errors.if} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rc">RC</Label>
                                    <Input
                                        id="rc"
                                        value={data.rc}
                                        onChange={(e) => setData('rc', e.target.value)}
                                        placeholder="000000"
                                    />
                                    <p className="text-xs text-muted-foreground">Registre de Commerce</p>
                                    <InputError message={errors.rc} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cnss">CNSS</Label>
                                    <Input
                                        id="cnss"
                                        value={data.cnss}
                                        onChange={(e) => setData('cnss', e.target.value)}
                                        placeholder="0000000"
                                    />
                                    <p className="text-xs text-muted-foreground">Caisse Nationale de Sécurité Sociale</p>
                                    <InputError message={errors.cnss} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="patent">Patente</Label>
                                    <Input
                                        id="patent"
                                        value={data.patent}
                                        onChange={(e) => setData('patent', e.target.value)}
                                        placeholder="00000000"
                                    />
                                    <p className="text-xs text-muted-foreground">Numéro de Patente</p>
                                    <InputError message={errors.patent} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Coordonnées */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Coordonnées
                            </CardTitle>
                            <CardDescription>
                                Adresse et moyens de contact
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Adresse</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="123 Rue Example, Quartier..."
                                    rows={2}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ville</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Casablanca"
                                    />
                                    <InputError message={errors.city} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Code postal</Label>
                                    <Input
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        placeholder="20000"
                                    />
                                    <InputError message={errors.postal_code} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Pays</Label>
                                    <Input
                                        id="country"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        placeholder="Maroc"
                                    />
                                    <InputError message={errors.country} />
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+212 5XX XX XX XX"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fax">Fax</Label>
                                    <Input
                                        id="fax"
                                        value={data.fax}
                                        onChange={(e) => setData('fax', e.target.value)}
                                        placeholder="+212 5XX XX XX XX"
                                    />
                                    <InputError message={errors.fax} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="contact@entreprise.ma"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Site web</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        placeholder="https://www.entreprise.ma"
                                    />
                                    <InputError message={errors.website} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations Bancaires */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Informations Bancaires
                            </CardTitle>
                            <CardDescription>
                                Pour les paiements par virement (affichées sur les factures)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">Nom de la banque</Label>
                                    <Input
                                        id="bank_name"
                                        value={data.bank_name}
                                        onChange={(e) => setData('bank_name', e.target.value)}
                                        placeholder="Banque Populaire, Attijariwafa Bank..."
                                    />
                                    <InputError message={errors.bank_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bank_rib">RIB</Label>
                                    <Input
                                        id="bank_rib"
                                        value={data.bank_rib}
                                        onChange={(e) => setData('bank_rib', e.target.value)}
                                        placeholder="000 000 0000000000000000 00"
                                    />
                                    <InputError message={errors.bank_rib} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bank_iban">IBAN</Label>
                                    <Input
                                        id="bank_iban"
                                        value={data.bank_iban}
                                        onChange={(e) => setData('bank_iban', e.target.value)}
                                        placeholder="MA00 0000 0000 0000 0000 0000 000"
                                    />
                                    <InputError message={errors.bank_iban} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bank_swift">SWIFT/BIC</Label>
                                    <Input
                                        id="bank_swift"
                                        value={data.bank_swift}
                                        onChange={(e) => setData('bank_swift', e.target.value)}
                                        placeholder="XXXXXXXX"
                                    />
                                    <InputError message={errors.bank_swift} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            Enregistrer les modifications
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-green-600">
                                ✓ Enregistré avec succès
                            </p>
                        </Transition>
                    </div>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
