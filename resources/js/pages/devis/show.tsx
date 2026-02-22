import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle,
    Copy,
    Download,
    Eye,
    FileText,
    Mail,
    MapPin,
    MoreHorizontal,
    Pencil,
    Phone,
    Receipt,
    Trash2,
    User,
    XCircle,
} from 'lucide-react';

interface DevisItem {
    id: number;
    ordre: number;
    designation: string;
    description: string | null;
    unite: string;
    quantite: number;
    prix_unitaire: number;
    total_ligne: number;
}

interface Devis {
    id: number;
    numero: string;
    date: string;
    date_validite: string | null;
    objet: string;
    conditions: string | null;
    total_ht: number;
    remise_type: string | null;
    remise_value: number;
    total_after_remise: number;
    tva_percent: number;
    total_tva: number;
    total_ttc: number;
    status: string;
    status_label: string;
    status_color: string;
    notes_internes: string | null;
    chantier: {
        id: number;
        reference: string;
        nom: string;
        localisation: string | null;
        client: {
            id: number;
            nom: string;
            telephone: string | null;
            email: string | null;
            adresse: string | null;
            ville: string | null;
            ice: string | null;
        } | null;
    } | null;
    creator: {
        id: number;
        name: string;
    } | null;
    items: DevisItem[];
    facture: {
        id: number;
        numero: string;
    } | null;
    can_create_facture: boolean;
    created_at: string;
}

interface Props {
    devis: Devis;
    statuts: Record<string, string>;
    unites: Record<string, string>;
}

export default function DevisShow({ devis, statuts, unites }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Devis', href: '/devis' },
        { title: devis.numero, href: `/devis/${devis.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
            router.delete(`/devis/${devis.id}`);
        }
    };

    const handleDuplicate = () => {
        router.post(`/devis/${devis.id}/duplicate`);
    };

    const handleCreateFacture = () => {
        router.post(`/factures/from-devis/${devis.id}`);
    };

    const handleUpdateStatus = (status: string) => {
        router.patch(`/devis/${devis.id}/status`, { status });
    };

    const getStatusBadgeClass = (color: string) => {
        switch (color) {
            case 'green':
                return 'bg-green-600 hover:bg-green-700';
            case 'blue':
                return 'bg-blue-600 hover:bg-blue-700';
            case 'orange':
                return 'bg-orange-500 hover:bg-orange-600';
            case 'destructive':
                return 'bg-destructive hover:bg-destructive/90';
            default:
                return '';
        }
    };

    const formatMoney = (amount: number) => {
        return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Devis ${devis.numero}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/devis">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{devis.numero}</h1>
                                <Badge
                                    variant={devis.status_color === 'destructive' ? 'destructive' : 'default'}
                                    className={getStatusBadgeClass(devis.status_color)}
                                >
                                    {devis.status_label}
                                </Badge>
                                {devis.facture && (
                                    <Badge variant="outline">
                                        <Receipt className="h-3 w-3 mr-1" />
                                        Facturé
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">{devis.objet}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Bouton Bon de Commande (BDC) */}
                        <Button asChild variant="secondary">
                            <a href={`/devis/${devis.id}/bon-commande`} target="_blank" rel="noopener noreferrer">
                                Bon de Commande
                            </a>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Changer statut
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {Object.entries(statuts).map(([value, label]) => (
                                    <DropdownMenuItem
                                        key={value}
                                        onClick={() => handleUpdateStatus(value)}
                                        className={devis.status === value ? 'bg-muted' : ''}
                                    >
                                        {value === 'accepte' && <CheckCircle className="h-4 w-4 mr-2 text-green-600" />}
                                        {value === 'refuse' && <XCircle className="h-4 w-4 mr-2 text-destructive" />}
                                        {label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {!devis.facture && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/devis/${devis.id}/edit`} className="flex items-center gap-2">
                                            <Pencil className="h-4 w-4" />
                                            Modifier
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={handleDuplicate} className="flex items-center gap-2">
                                    <Copy className="h-4 w-4" />
                                    Dupliquer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <a href={`/devis/${devis.id}/pdf`} className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Télécharger PDF
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href={`/devis/${devis.id}/pdf-stream`} target="_blank" className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Aperçu PDF
                                    </a>
                                </DropdownMenuItem>
                                {devis.can_create_facture && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleCreateFacture}
                                            className="flex items-center gap-2 text-green-600"
                                        >
                                            <Receipt className="h-4 w-4" />
                                            Créer Facture
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {!devis.facture && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleDelete}
                                            className="flex items-center gap-2 text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Supprimer
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Informations principales */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Informations du devis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date du devis</p>
                                        <p className="font-medium">{devis.date}</p>
                                    </div>
                                </div>
                                {devis.date_validite && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Valide jusqu'au</p>
                                            <p className="font-medium">{devis.date_validite}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {devis.conditions && (
                                <div className="rounded-lg bg-muted p-4">
                                    <p className="text-sm font-medium mb-1">Conditions</p>
                                    <p className="text-sm whitespace-pre-line">{devis.conditions}</p>
                                </div>
                            )}

                            {devis.notes_internes && (
                                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                                    <p className="text-sm font-medium mb-1 text-yellow-800">Notes internes</p>
                                    <p className="text-sm text-yellow-700">{devis.notes_internes}</p>
                                </div>
                            )}

                            {devis.facture && (
                                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                                    <p className="text-sm font-medium mb-1 text-green-800">Facture associée</p>
                                    <Link
                                        href={`/factures/${devis.facture.id}`}
                                        className="text-sm text-green-700 hover:underline"
                                    >
                                        {devis.facture.numero} →
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Client et Chantier */}
                    <div className="space-y-6">
                        {devis.chantier?.client && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="h-4 w-4" />
                                        Client
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="font-semibold text-lg">{devis.chantier.client.nom}</p>
                                    {devis.chantier.client.telephone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            {devis.chantier.client.telephone}
                                        </div>
                                    )}
                                    {devis.chantier.client.email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            {devis.chantier.client.email}
                                        </div>
                                    )}
                                    {(devis.chantier.client.adresse || devis.chantier.client.ville) && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                {devis.chantier.client.adresse && <p>{devis.chantier.client.adresse}</p>}
                                                {devis.chantier.client.ville && <p>{devis.chantier.client.ville}</p>}
                                            </div>
                                        </div>
                                    )}
                                    {devis.chantier.client.ice && (
                                        <div className="pt-2 border-t">
                                            <p className="text-xs text-muted-foreground">ICE</p>
                                            <code className="text-sm font-mono">{devis.chantier.client.ice}</code>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {devis.chantier && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Building2 className="h-4 w-4" />
                                        Chantier
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="font-semibold">{devis.chantier.nom}</p>
                                    <p className="text-sm text-muted-foreground">{devis.chantier.reference}</p>
                                    {devis.chantier.localisation && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {devis.chantier.localisation}
                                        </div>
                                    )}
                                    <Button variant="outline" size="sm" className="mt-2" asChild>
                                        <Link href={`/chantiers/${devis.chantier.id}`}>
                                            Voir le chantier
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Lignes du devis */}
                <Card>
                    <CardHeader>
                        <CardTitle>Détail des prestations</CardTitle>
                        <CardDescription>{devis.items.length} ligne(s)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[5%]">#</TableHead>
                                        <TableHead className="w-[35%]">Désignation</TableHead>
                                        <TableHead className="w-[10%]">Unité</TableHead>
                                        <TableHead className="w-[10%] text-right">Qté</TableHead>
                                        <TableHead className="w-[15%] text-right">P.U. HT</TableHead>
                                        <TableHead className="w-[15%] text-right">Total HT</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {devis.items.map((item, index) => (
                                        <TableRow key={item.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                                            <TableCell className="text-muted-foreground">{item.ordre}</TableCell>
                                            <TableCell>
                                                <p className="font-medium">{item.designation}</p>
                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>{unites[item.unite] || item.unite}</TableCell>
                                            <TableCell className="text-right">{item.quantite}</TableCell>
                                            <TableCell className="text-right">{formatMoney(item.prix_unitaire)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatMoney(item.total_ligne)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Récapitulatif des totaux */}
                        <div className="mt-6 flex justify-end">
                            <div className="w-full max-w-sm space-y-2">
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Total HT</span>
                                    <span className="font-medium">{formatMoney(devis.total_ht)}</span>
                                </div>
                                {devis.remise_value > 0 && (
                                    <div className="flex justify-between py-2 text-orange-600">
                                        <span>
                                            Remise ({devis.remise_type === 'pourcentage' ? `${devis.remise_value}%` : 'fixe'})
                                        </span>
                                        <span>-{formatMoney(devis.total_ht - devis.total_after_remise)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Total après remise</span>
                                    <span className="font-medium">{formatMoney(devis.total_after_remise)}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">TVA ({devis.tva_percent}%)</span>
                                    <span className="font-medium">{formatMoney(devis.total_tva)}</span>
                                </div>
                                <div className="flex justify-between py-3 border-t text-lg font-bold">
                                    <span>Total TTC</span>
                                    <span className="text-primary">{formatMoney(devis.total_ttc)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Informations supplémentaires */}
                <div className="text-sm text-muted-foreground">
                    <p>Créé le {devis.created_at} par {devis.creator?.name || 'Système'}</p>
                </div>
            </div>
        </AppLayout>
    );
}
