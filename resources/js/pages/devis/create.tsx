import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'



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

interface Chantier {
    id: number;
    reference: string;
    nom: string;
    client: {
        id: number;
        nom: string;
    } | null;
}

interface DevisItem {
    type: 'service' | 'produit';
    designation: string;
    description: string;
    unite: string;
    quantite: number;
    prix_unitaire: number;
}

interface Props {
    numero: string;
    chantiers: Chantier[];
    statuts: Record<string, string>;
    remiseTypes: Record<string, string>;
    unites: Record<string, string>;
    preselectedChantierId?: number;
    services: { id: number; name: string }[];
    produits: { id: number; name: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Devis', href: '/devis' },
    { title: 'Nouveau', href: '/devis/create' },
];

export default function DevisCreate({
    numero,
    chantiers,
    statuts,
    remiseTypes,
    unites,
    preselectedChantierId,
    services = [],
    produits = [],
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        chantier_id: preselectedChantierId?.toString() || '',
        numero: numero,
        date: new Date().toISOString().split('T')[0],
        date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        objet: '',
        conditions: '',
        remise_type: '',
        remise_value: 0,
        tva_percent: 20,
        status: 'brouillon',
        notes_internes: '',
        items: [
            {
                type: 'service',
                designation: '',
                description: '',
                unite: 'u',
                quantite: 1,
                prix_unitaire: 0,
            },
        ] as DevisItem[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/devis');
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                type: 'service',
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

    const updateItem = (index: number, field: keyof DevisItem, value: string | number) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };
        // إذا غير type، فرغ designation
        if (field === 'type') {
            newItems[index].designation = '';
        }
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
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau Devis" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nouveau Devis</h1>
                        <p className="text-muted-foreground">
                            Créez un nouveau devis pour un chantier
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Informations principales */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Informations du devis</CardTitle>
                                <CardDescription>
                                    Sélectionnez le chantier et renseignez les détails du devis
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
                                        <Label htmlFor="date_validite">Date de validité</Label>
                                        <Input
                                            id="date_validite"
                                            type="date"
                                            value={data.date_validite}
                                            onChange={(e) => setData('date_validite', e.target.value)}
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

                                <div className="space-y-2">
                                    <Label htmlFor="conditions">Conditions</Label>
                                    <Textarea
                                        id="conditions"
                                        value={data.conditions}
                                        onChange={(e) => setData('conditions', e.target.value)}
                                        placeholder="Conditions de paiement, délais, etc."
                                        rows={3}
                                    />
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
                                        <Label htmlFor="notes_internes">Notes internes</Label>
                                        <Input
                                            id="notes_internes"
                                            value={data.notes_internes}
                                            onChange={(e) => setData('notes_internes', e.target.value)}
                                            placeholder="Notes privées..."
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

                    {/* Lignes du devis */}
                   {/* Lignes du devis */}
<Card className="overflow-visible">
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle>Lignes du devis</CardTitle>
      <CardDescription>
        Ajoutez les prestations et produits du devis
      </CardDescription>
    </div>

    <Button type="button" onClick={addItem} size="sm">
      Ajouter une ligne
    </Button>
  </CardHeader>

  <CardContent className="overflow-visible">
    <div className="overflow-visible">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[10%] min-w-[80px]">Type</TableHead>
            <TableHead className="w-[26%] min-w-[170px]">Désignation</TableHead>
            <TableHead className="w-[20%] min-w-[120px]">Description</TableHead>
            <TableHead className="w-[10%] min-w-[70px]">Unité</TableHead>
            <TableHead className="w-[9%] min-w-[75px] text-right">Qté</TableHead>
            <TableHead className="w-[11%] min-w-[90px] text-right">P.U</TableHead>
            <TableHead className="w-[12%] min-w-[100px] text-right">Total</TableHead>
            <TableHead className="w-[6%]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.items.map((item, index) => {
            const options =
              item.type === 'service' ? services : produits

            const filtered = options.filter((opt) =>
              opt.name
                .toLowerCase()
                .includes(item.designation.toLowerCase())
            )

            return (
              <TableRow key={index} className="hover:bg-muted/30 transition">
                
                {/* TYPE */}
                <TableCell>
                  <Select
                    value={item.type}
                    onValueChange={(value) =>
                      updateItem(
                        index,
                        'type',
                        value as 'service' | 'produit'
                      )
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="produit">Produit</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                                {/* DESIGNATION (dropdown under input, absolute) */}
                                <TableCell className="relative">
                                    <div className="relative">
                                        <Input
                                            ref={(el) => { inputRefs.current[index] = el }}
                                            value={item.designation}
                                            onChange={(e) =>
                                                updateItem(index, 'designation', e.target.value)
                                            }
                                            onFocus={() => setActiveIndex(index)}
                                            onBlur={() => setTimeout(() => setActiveIndex(null), 150)}
                                            placeholder="Saisir la désignation..."
                                            autoComplete="off"
                                            className="h-8 w-full min-w-[80px] md:min-w-[120px] lg:min-w-[140px] px-2 text-xs font-semibold border border-primary/60 bg-background/80 placeholder:text-primary/70 focus:border-primary focus:ring-2 focus:ring-primary/40 transition"
                                        />

                                        {activeIndex === index && item.designation && (
                                            <div
                                                className="absolute left-0 right-0 top-full mt-1 z-50 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover shadow-2xl"
                                                style={{position: 'absolute'}}
                                            >
                                                {filtered.length > 0 ? (
                                                    filtered.map((opt) => (
                                                        <div
                                                            key={opt.id}
                                                            className="px-3 py-2 text-xs cursor-pointer hover:bg-muted transition"
                                                            onMouseDown={() => {
                                                                updateItem(index, 'designation', opt.name)
                                                                setActiveIndex(null)
                                                            }}
                                                        >
                                                            {opt.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-2 text-xs text-muted-foreground">
                                                        Aucun résultat
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>

                                {/* DESCRIPTION */}
                                <TableCell>
                                    <Input
                                        value={item.description}
                                        onChange={(e) =>
                                            updateItem(index, 'description', e.target.value)
                                        }
                                        placeholder="Description..."
                                        autoComplete="off"
                                        className="h-8 w-full min-w-[60px] md:min-w-[90px] lg:min-w-[110px] px-2 text-xs"
                                    />
                                </TableCell>

                                {/* UNITE */}
                                <TableCell>
                                    <Select
                                        value={item.unite}
                                        onValueChange={(value) => updateItem(index, 'unite', value)}
                                    >
                                        <SelectTrigger className="h-8 text-xs px-2">
                                            <SelectValue placeholder="Unité" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(unites).map(([value, label]) => (
                                                <SelectItem key={value} value={value} className="text-xs">
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>


                {/* QUANTITE */}
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
                                        className="h-8 text-right px-2 text-xs min-w-[75px] md:min-w-[90px] lg:min-w-[100px]"
                                    />
                </TableCell>

                {/* PRIX */}
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
                                        className="h-8 text-right px-2 text-xs min-w-[90px] md:min-w-[110px] lg:min-w-[120px]"
                                    />
                </TableCell>

                {/* TOTAL */}
                <TableCell className="text-right font-semibold">
                                    <span className="inline-block min-w-[80px] md:min-w-[100px] lg:min-w-[120px]">
                                        {(item.quantite *
                                            item.prix_unitaire).toLocaleString(
                                            'fr-FR',
                                            { minimumFractionDigits: 2 }
                                        )}{' '}
                                        DH
                                    </span>
                </TableCell>

                {/* DELETE */}
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem(index)}
                    disabled={data.items.length === 1}
                  >
                    Supprimer
                  </Button>
                </TableCell>

              </TableRow>
            )
          })}
        </TableBody>
       <br/>
        <br/>
      <br/>
         <br/>
        <br/>
      <br/>
      </Table>
      
    </div>
  </CardContent>
</Card>


                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/devis">
                                <X className="mr-2 h-4 w-4" />
                                Annuler
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Enregistrement...' : 'Enregistrer le devis'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
