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
import { Textarea } from '@/components/ui/textarea';
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
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';

interface Chantier {
    id: number;
    reference: string;
    nom: string;
    client: {
        id: number;
        nom: string;
    } | null;
}

interface DevisDisponible {
    id: number;
    numero: string;
    objet: string;
    total_ttc: number;
    chantier_id: number;
    chantier: {
        id: number;
        nom: string;
        client: string | null;
    } | null;
}

interface FactureItem {
    designation: string;
    description: string;
    unite: string;
    quantite: number;
    prix_unitaire: number;
}

interface Props {
    numero: string;
    chantiers: Chantier[];
    devisDisponibles: DevisDisponible[];
    statuts: Record<string, string>;
    remiseTypes: Record<string, string>;
    modesPaiement: Record<string, string>;
    unites: Record<string, string>;
    preselectedDevisId?: number;
    preselectedChantierId?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Factures', href: '/factures' },
    { title: 'Nouvelle', href: '/factures/create' },
];

export default function FactureCreate({
    numero,
    chantiers,
    devisDisponibles,
    statuts,
    remiseTypes,
    modesPaiement,
    unites,
    preselectedDevisId,
    preselectedChantierId,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        devis_id: preselectedDevisId?.toString() || '',
        chantier_id: preselectedChantierId?.toString() || '',
        numero: numero,
        date: new Date().toISOString().split('T')[0],
        date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        objet: '',
        remise_type: '',
        remise_value: 0,
        tva_percent: 20,
        mode_paiement: '',
        bon_commande: '',
        status: 'brouillon',
        notes: '',
        items: [
            {
                designation: '',
                description: '',
                unite: 'u',
                quantite: 1,
                prix_unitaire: 0,
            },
        ] as FactureItem[],
    });

    // Si un devis est sélectionné, pré-remplir les données
    useEffect(() => {
        if (data.devis_id) {
            const selectedDevis = devisDisponibles.find(d => d.id.toString() === data.devis_id);
            if (selectedDevis) {
                setData(prev => ({
                    ...prev,
                    chantier_id: selectedDevis.chantier_id.toString(),
                    objet: selectedDevis.objet,
                }));
            }
        }
    }, [data.devis_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/factures');
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
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
            <Head title="Nouvelle Facture" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nouvelle Facture</h1>
                        <p className="text-muted-foreground">
                            Créez une nouvelle facture pour un chantier
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
                                    Renseignez les détails de la facture
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {devisDisponibles.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="devis_id">À partir d'un devis (optionnel)</Label>
                                        <Select
                                            value={data.devis_id}
                                            onValueChange={(value) => setData('devis_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez un devis accepté" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Aucun (créer manuellement)</SelectItem>
                                                {devisDisponibles.map((devis) => (
                                                    <SelectItem key={devis.id} value={devis.id.toString()}>
                                                        {devis.numero} - {devis.objet} ({devis.total_ttc.toLocaleString('fr-FR')} DH)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Sélectionnez un devis accepté pour pré-remplir la facture
                                        </p>
                                    </div>
                                )}

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
                                        <Label htmlFor="numero">Numéro *</Label>
                                        <Input
                                            id="numero"
                                            value={data.numero}
                                            onChange={(e) => setData('numero', e.target.value)}
                                            readOnly
                                            className="bg-muted"
                                        />
                                        {errors.numero && (
                                            <p className="text-sm text-destructive">{errors.numero}</p>
                                        )}
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
                                    Ajoutez les prestations et produits de la facture
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
                                                    {errors[`items.${index}.designation`] && (
                                                        <p className="text-xs text-destructive mt-1">
                                                            {errors[`items.${index}.designation`]}
                                                        </p>
                                                    )}
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
                            <Link href="/factures">
                                <X className="mr-2 h-4 w-4" />
                                Annuler
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Enregistrement...' : 'Enregistrer la facture'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
