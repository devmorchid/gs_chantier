import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Banknote,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileText,
    MoreHorizontal,
    Pencil,
    Plus,
    Receipt,
    Search,
    Trash2,
    TrendingUp,
    AlertCircle,
    Building2,
} from 'lucide-react';
import { useState } from 'react';

interface Facture {
    id: number;
    numero: string;
    date: string;
    date_echeance: string | null;
    objet: string;
    total_ht: string;
    total_ttc: string;
    montant_paye: string;
    reste_a_payer: string;
    status: string;
    status_label: string;
    status_color: string;
    chantier: {
        id: number;
        reference: string;
        nom: string;
        client: {
            id: number;
            nom: string;
        } | null;
    } | null;
    devis: {
        id: number;
        numero: string;
    } | null;
    items_count: number;
    created_at: string;
}

interface PaginatedFactures {
    data: Facture[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    factures: PaginatedFactures;
    statuts: Record<string, string>;
    filters: {
        search?: string;
        status?: string;
        chantier_id?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Factures', href: '/factures' },
];

export default function FacturesIndex({ factures, statuts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get('/factures', { search, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get('/factures');
    };

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            router.delete(`/factures/${id}`, { preserveScroll: true });
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'payee':
                return {
                    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
                    text: 'text-emerald-700 dark:text-emerald-400',
                    border: 'border-emerald-500/30',
                    icon: CheckCircle2,
                    bar: 'bg-emerald-500',
                };
            case 'payee_partiellement':
                return {
                    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
                    text: 'text-amber-700 dark:text-amber-400',
                    border: 'border-amber-500/30',
                    icon: TrendingUp,
                    bar: 'bg-amber-500',
                };
            case 'envoyee':
                return {
                    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
                    text: 'text-blue-700 dark:text-blue-400',
                    border: 'border-blue-500/30',
                    icon: Clock,
                    bar: 'bg-blue-500',
                };
            case 'annulee':
                return {
                    bg: 'bg-red-500/10 dark:bg-red-500/20',
                    text: 'text-red-700 dark:text-red-400',
                    border: 'border-red-500/30',
                    icon: AlertCircle,
                    bar: 'bg-red-500',
                };
            default:
                return {
                    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
                    text: 'text-slate-700 dark:text-slate-400',
                    border: 'border-slate-500/30',
                    icon: FileText,
                    bar: 'bg-slate-400',
                };
        }
    };

    const parseAmount = (amount: string) => {
        return parseFloat(amount.replace(/\s/g, '').replace(',', '.')) || 0;
    };

    const getPaymentProgress = (facture: Facture) => {
        const total = parseAmount(facture.total_ttc);
        const paye = parseAmount(facture.montant_paye);
        if (total === 0) return 0;
        return Math.min((paye / total) * 100, 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Factures" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* ERP-style status tabs */}
                <div className="flex gap-3 mb-6">
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors border focus:outline-none ${!status || status === 'all' ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600' : 'bg-transparent text-gray-700 dark:text-gray-200 border-transparent'}`}
                        onClick={() => { setStatus('all'); router.get('/factures', { search, status: 'all' }, { preserveState: true }); }}
                    >
                        Toutes
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors border focus:outline-none ${status === 'en_cours' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-transparent text-gray-700 dark:text-gray-200 border-transparent'}`}
                        onClick={() => { setStatus('en_cours'); router.get('/factures', { search, status: 'en_cours' }, { preserveState: true }); }}
                    >
                        En cours
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors border focus:outline-none ${status === 'payee' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-transparent text-gray-700 dark:text-gray-200 border-transparent'}`}
                        onClick={() => { setStatus('payee'); router.get('/factures', { search, status: 'payee' }, { preserveState: true }); }}
                    >
                        Terminées
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors border focus:outline-none ${status === 'annulee' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-transparent text-gray-700 dark:text-gray-200 border-transparent'}`}
                        onClick={() => { setStatus('annulee'); router.get('/factures', { search, status: 'annulee' }, { preserveState: true }); }}
                    >
                        Annulées
                    </button>
                </div>
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Factures
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gérez vos factures et suivez les paiements
                        </p>
                    </div>
                    <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
                        <Link href="/factures/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle Facture
                        </Link>
                    </Button>
                </div>

                {/* Filtres */}
                <Card className="border-dashed">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-1 min-w-[250px] max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par numéro, objet, chantier..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="pl-10 bg-muted/50"
                                />
                            </div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[200px] bg-muted/50">
                                    <SelectValue placeholder="Filtrer par statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    {Object.entries(statuts).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleFilter} variant="secondary">
                                <Search className="mr-2 h-4 w-4" />
                                Filtrer
                            </Button>
                            <Button variant="ghost" onClick={handleReset}>
                                Réinitialiser
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Liste des factures en cards */}
                {factures.data.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="rounded-full bg-muted p-4 mb-4">
                                <Receipt className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Aucune facture</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Commencez par créer votre première facture
                            </p>
                            <Button asChild>
                                <Link href="/factures/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Créer une facture
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {factures.data.map((facture) => {
                            const statusConfig = getStatusConfig(facture.status);
                            const StatusIcon = statusConfig.icon;
                            const progress = getPaymentProgress(facture);
                            
                            return (
                                <Card 
                                    key={facture.id} 
                                    className="group hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="flex">
                                        {/* Barre de statut colorée */}
                                        <div className={`w-1.5 ${statusConfig.bar}`} />
                                        
                                        <CardContent className="flex-1 p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                {/* Infos principales */}
                                                <div className="flex-1 space-y-4">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <Link 
                                                                    href={`/factures/${facture.id}`}
                                                                    className="text-lg font-bold text-foreground hover:text-emerald-600 transition-colors flex items-center gap-2"
                                                                >
                                                                    <Receipt className="h-5 w-5 text-emerald-500" />
                                                                    {facture.numero}
                                                                </Link>
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border font-medium`}
                                                                >
                                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                                    {facture.status_label}
                                                                </Badge>
                                                                {facture.devis && (
                                                                    <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30">
                                                                        <FileText className="h-3 w-3 mr-1" />
                                                                        {facture.devis.numero}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {facture.objet && (
                                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                                    {facture.objet}
                                                                </p>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Actions */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/factures/${facture.id}`} className="flex items-center gap-2">
                                                                        <Eye className="h-4 w-4" />
                                                                        Voir détails
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <a href={`/factures/${facture.id}/pdf`} className="flex items-center gap-2">
                                                                        <Download className="h-4 w-4" />
                                                                        Télécharger PDF
                                                                    </a>
                                                                </DropdownMenuItem>
                                                                {facture.status !== 'payee' && facture.status !== 'annulee' && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/factures/${facture.id}/edit`} className="flex items-center gap-2">
                                                                                <Pencil className="h-4 w-4" />
                                                                                Modifier
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/factures/${facture.id}`} className="flex items-center gap-2 text-emerald-600">
                                                                                <Banknote className="h-4 w-4" />
                                                                                Enregistrer paiement
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleDelete(facture.id)}
                                                                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                            Supprimer
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* Infos grid */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        {/* Client & Chantier */}
                                                        <div className="space-y-1">
                                                            <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium">Client</p>
                                                            <div className="flex items-center gap-1.5">
                                                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="font-medium truncate">
                                                                    {facture.chantier?.client?.nom || '-'}
                                                                </span>
                                                            </div>
                                                            {facture.chantier && (
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {facture.chantier.nom}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Dates */}
                                                        <div className="space-y-1">
                                                            <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium">Date</p>
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="font-medium">{facture.date}</span>
                                                            </div>
                                                            {facture.date_echeance && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Échéance: {facture.date_echeance}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Montant Total */}
                                                        <div className="space-y-1">
                                                            <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium">Total TTC</p>
                                                            <p className="text-lg font-bold">{facture.total_ttc} DH</p>
                                                        </div>

                                                        {/* Paiement */}
                                                        <div className="space-y-2">
                                                            <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium">Paiement</p>
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="text-emerald-600 font-medium">
                                                                        {facture.montant_paye} DH payé
                                                                    </span>
                                                                    <span className="text-muted-foreground">
                                                                        {Math.round(progress)}%
                                                                    </span>
                                                                </div>
                                                                <Progress 
                                                                    value={progress} 
                                                                    className="h-2"
                                                                />
                                                                {parseAmount(facture.reste_a_payer) > 0 && (
                                                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                                        Reste: {facture.reste_a_payer} DH
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {factures.last_page > 1 && (
                    <Card>
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Affichage de <span className="font-medium">{(factures.current_page - 1) * factures.per_page + 1}</span> à{' '}
                                    <span className="font-medium">{Math.min(factures.current_page * factures.per_page, factures.total)}</span>{' '}
                                    sur <span className="font-medium">{factures.total}</span> factures
                                </p>
                                <div className="flex gap-1">
                                    {factures.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'ghost'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={link.active ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
