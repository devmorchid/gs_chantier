import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Save, Trash2, X } from 'lucide-react';

interface Chantier {
    id: number;
    reference: string;
    nom: string;
    client: {
        id: number;
        nom: string;
    } | null;
}

interface FactureItem {
    id?: number;
    designation: string;
    description: string;
    unite: string;
    quantite: number;
    prix_unitaire: number;
}

interface Facture {
    id: number;
    devis_id: number | null;
    chantier_id: number;
    numero: string;
    date: string;
    date_echeance: string | null;
    objet: string;
    remise_type: string | null;
    remise_value: number;
    tva_percent: number;
    mode_paiement: string | null;
    bon_commande: string | null;
    bon_commande_path: string | null;
    status: string;
    notes: string | null;
    items: FactureItem[];
}

interface Props {
    facture: Facture;
    chantiers: Chantier[];
    statuts: Record<string, string>;
    remiseTypes: Record<string, string>;
    modesPaiement: Record<string, string>;
    unites: Record<string, string>;
}

export default function FactureEdit({
    facture,
    chantiers,
    statuts,
    remiseTypes,
    modesPaiement,
    unites,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Factures', href: '/factures' },
        { title: facture.numero, href: `/factures/${facture.id}` },
        { title: 'Modifier', href: `/factures/${facture.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        chantier_id: facture.chantier_id.toString(),
        date: facture.date,
        date_echeance: facture.date_echeance || '',
        objet: facture.objet,
        remise_type: facture.remise_type || '',
        remise_value: facture.remise_value || 0,
        tva_percent: facture.tva_percent,
        mode_paiement: facture.mode_paiement || '',
        bon_commande: facture.bon_commande || '',
        status: facture.status,
        notes: facture.notes || '',
        items: facture.items.map((item) => ({
            id: item.id,
            designation: item.designation,
            description: item.description || '',
            unite: item.unite,
            quantite: item.quantite,
            prix_unitaire: item.prix_unitaire,
        })),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/factures/${facture.id}`);
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                id: undefined,
                designation: '',
                description: '',
                unite: 'u',
                quantite: 1,
                prix_unitaire: 0,
            },
        ]);
    };

    const removeItem = (index: number) => {
        if (data.items.length > 1) {
            setData(
                'items',
                data.items.filter((_, i) => i !== index)
            );
        }
    };

    const updateItem = (index: number, field: keyof FactureItem, value: string | number) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };
        setData('items', newItems);
    };

    // Calculs
    const totalHT = data.items.reduce(
        (sum, item) => sum + item.quantite * item.prix_unitaire,
        0
    );

    const remiseAmount =
        data.remise_type === 'pourcentage'
            ? totalHT * ((data.remise_value || 0) / 100)
            : data.remise_value || 0;

    const totalAfterRemise = totalHT - remiseAmount;
    const totalTVA = totalAfterRemise * (data.tva_percent / 100);
    const totalTTC = totalAfterRemise + totalTVA;

    const selectedChantier = chantiers.find((c) => c.id.toString() === data.chantier_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${facture.numero}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Modifier {facture.numero}</h1>
                        <p className="text-muted-foreground">
                            Modifiez les informations de la facture
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Informations principales */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Informations de la facture</CardTitle>
                                <CardDescription>
                                    Modifiez les détails de la facture
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="chantier_id">Chantier *</Label>
                                        <Select
                                            value={data.chantier_id}
                                            onValueChange={(value) => setData('chantier_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez un chantier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {chantiers.map((chantier) => (
                                                    <SelectItem
                                                        key={chantier.id}
                                                        value={chantier.id.toString()}
                                                    >
                                                        {chantier.reference} - {chantier.nom}
                                                        {chantier.client && ` (${chantier.client.nom})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.chantier_id && (
                                            <p className="text-sm text-destructive">{errors.chantier_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="numero">Numéro</Label>
                                        <Input
                                            id="numero"
                                            value={facture.numero}
                                            readOnly
                                            className="bg-muted"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date *</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                        />
                                        {errors.date && (
                                            <p className="text-sm text-destructive">{errors.date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date_echeance">Date d'échéance</Label>
                                        <Input
                                            id="date_echeance"
                                            type="date"
                                            value={data.date_echeance}
                                            onChange={(e) => setData('date_echeance', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="objet">Objet *</Label>
                                    <Input
                                        id="objet"
                                        value={data.objet}
                                        onChange={(e) => setData('objet', e.target.value)}
                                        placeholder="Ex: Travaux de rénovation - Phase 1"
                                    />
                                    {errors.objet && (
                                        <p className="text-sm text-destructive">{errors.objet}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="mode_paiement">Mode de paiement</Label>
                                        <Select
                                            value={data.mode_paiement}
                                            onValueChange={(value) => setData('mode_paiement', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(modesPaiement).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bon_commande">N° Bon de commande</Label>
                                        <Input
                                            id="bon_commande"
                                            value={data.bon_commande}
                                            onChange={(e) => setData('bon_commande', e.target.value)}
                                            placeholder="BC-XXXX"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Statut *</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(statuts).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Input
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Notes..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Récapitulatif */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Récapitulatif</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedChantier && (
                                    <div className="rounded-lg bg-muted p-3 space-y-1">
                                        <p className="text-sm font-medium">Client</p>
                                        <p className="text-lg font-semibold">
                                            {selectedChantier.client?.nom || 'Non défini'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Chantier: {selectedChantier.nom}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total HT</span>
                                        <span className="font-medium">
                                            {totalHT.toLocaleString('fr-FR', {
                                                minimumFractionDigits: 2,
                                            })}{' '}
                                            DH
                                        </span>
                                    </div>

                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <Select
                                            value={data.remise_type || 'none'}
                                            onValueChange={(value) =>
                                                setData('remise_type', value === 'none' ? '' : value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Remise" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Pas de remise</SelectItem>
                                                {Object.entries(remiseTypes).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {data.remise_type && (
                                            <Input
                                                type="number"
                                                min="0"
                                                value={data.remise_value}
                                                onChange={(e) =>
                                                    setData('remise_value', parseFloat(e.target.value) || 0)
                                                }
                                                placeholder={
                                                    data.remise_type === 'pourcentage' ? '%' : 'DH'
                                                }
                                            />
                                        )}
                                    </div>

                                    {remiseAmount > 0 && (
                                        <div className="flex justify-between text-orange-600">
                                            <span>Remise</span>
                                            <span>
                                                -{remiseAmount.toLocaleString('fr-FR', {
                                                    minimumFractionDigits: 2,
                                                })}{' '}
                                                DH
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total après remise</span>
                                        <span className="font-medium">
                                            {totalAfterRemise.toLocaleString('fr-FR', {
                                                minimumFractionDigits: 2,
                                            })}{' '}
                                            DH
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">TVA</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="w-20 h-8 text-center"
                                            value={data.tva_percent}
                                            onChange={(e) =>
                                                setData('tva_percent', parseFloat(e.target.value) || 0)
                                            }
                                        />
                                        <span className="text-muted-foreground">%</span>
                                        <span className="ml-auto font-medium">
                                            {totalTVA.toLocaleString('fr-FR', {
                                                minimumFractionDigits: 2,
                                            })}{' '}
                                            DH
                                        </span>
                                    </div>

                                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                                        <span>Total TTC</span>
                                        <span className="text-primary">
                                            {totalTTC.toLocaleString('fr-FR', {
                                                minimumFractionDigits: 2,
                                            })}{' '}
                                            DH
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Lignes de la facture */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Lignes de la facture</CardTitle>
                                <CardDescription>
                                    Modifiez les prestations et produits de la facture
                                </CardDescription>
                            </div>
                            <Button type="button" onClick={addItem} variant="outline" size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter une ligne
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[30%]">Désignation *</TableHead>
                                            <TableHead className="w-[20%]">Description</TableHead>
                                            <TableHead className="w-[10%]">Unité</TableHead>
                                            <TableHead className="w-[10%] text-right">Qté *</TableHead>
                                            <TableHead className="w-[15%] text-right">P.U. HT *</TableHead>
                                            <TableHead className="w-[10%] text-right">Total HT</TableHead>
                                            <TableHead className="w-[5%]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Input
                                                        value={item.designation}
                                                        onChange={(e) =>
                                                            updateItem(index, 'designation', e.target.value)
                                                        }
                                                        placeholder="Désignation"
                                                        className="h-9"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            updateItem(index, 'description', e.target.value)
                                                        }
                                                        placeholder="Description"
                                                        className="h-9"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={item.unite}
                                                        onValueChange={(value) =>
                                                            updateItem(index, 'unite', value)
                                                        }
                                                    >
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(unites).map(([value, label]) => (
                                                                <SelectItem key={value} value={value}>
                                                                    {label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.quantite}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'quantite',
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        className="h-9 text-right"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.prix_unitaire}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                index,
                                                                'prix_unitaire',
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        className="h-9 text-right"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {(item.quantite * item.prix_unitaire).toLocaleString(
                                                        'fr-FR',
                                                        { minimumFractionDigits: 2 }
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => removeItem(index)}
                                                        disabled={data.items.length === 1}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {errors.items && (
                                <p className="text-sm text-destructive mt-2">{errors.items}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/factures/${facture.id}`}>
                                <X className="mr-2 h-4 w-4" />
                                Annuler
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
