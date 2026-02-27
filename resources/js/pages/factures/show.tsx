import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Building2,
    Calendar,
    CheckCircle,
    CreditCard,
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
import { useState } from 'react';


interface Payment {
    id: number;
    amount: number;
    payment_method: string;
    payment_date: string;
    bank_name?: string | null;
    cheque_number?: string | null;
    reference?: string | null;
    notes?: string | null;
    file?: string | null;
    user_id?: number | null;
}

interface FactureItem {
    id: number;
    ordre: number;
    designation: string;
    description: string | null;
    unite: string;
    quantite: number;
    prix_unitaire: number;
    total_ligne: number;
}

interface Facture {
    payments: Payment[];
    id: number;
    numero: string;
    date: string;
    date_echeance: string | null;
    objet: string;
    total_ht: number;
    remise_type: string | null;
    remise_value: number;
    total_after_remise: number;
    tva_percent: number;
    total_tva: number;
    total_ttc: number;
    montant_paye: number;
    reste_a_payer: number;
    mode_paiement: string | null;
    bon_commande: string | null;
    bon_commande_path: string | null;
    status: string;
    status_label: string;
    status_color: string;
    notes: string | null;
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
    devis: {
        id: number;
        numero: string;
    } | null;
    items: FactureItem[];
    created_at: string;
}

interface Props {
    facture: Facture;
    statuts: Record<string, string>;
    modesPaiement: Record<string, string>;
}


export default function FactureShow({ facture, statuts, modesPaiement }: Props) {
    // Définir tous les champs nécessaires pour le paiement
    const paiementForm = useForm<{
        montant: number;
        mode_paiement: string;
        cheque_number?: string;
        bank_name?: string;
        reference?: string;
        payment_date?: string;
        notes?: string;
        file?: File | null;
    }>({
        montant: facture.reste_a_payer,
        mode_paiement: facture.mode_paiement || '',
        cheque_number: '',
        bank_name: '',
        reference: '',
        payment_date: '',
        notes: '',
        file: null,
    });

    const [paymentMethod, setPaymentMethod] = useState(paiementForm.data.mode_paiement || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Factures', href: '/factures' },
        { title: facture.numero, href: `/factures/${facture.id}` },
    ];

    const [showPaiementDialog, setShowPaiementDialog] = useState(false);

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            router.delete(`/factures/${facture.id}`);
        }
    };

    const handleUpdateStatus = (status: string) => {
        router.patch(`/factures/${facture.id}/status`, { status });
    };

    const handlePaiement = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('amount', paiementForm.data.montant.toString());
        formData.append('payment_method', paiementForm.data.mode_paiement);
        if (paiementForm.data.cheque_number) formData.append('cheque_number', paiementForm.data.cheque_number);
        if (paiementForm.data.bank_name) formData.append('bank_name', paiementForm.data.bank_name);
        if (paiementForm.data.reference) formData.append('reference', paiementForm.data.reference);
        if (paiementForm.data.payment_date) formData.append('payment_date', paiementForm.data.payment_date);
        if (paiementForm.data.notes) formData.append('notes', paiementForm.data.notes);
        if (paiementForm.data.file) formData.append('file', paiementForm.data.file);
        paiementForm.post(`/factures/${facture.id}/paiement`, {
            onSuccess: () => setShowPaiementDialog(false),
            forceFormData: true,
            data: formData,
        });
    };
                                                        <div className="space-y-1">
                                                            <Label htmlFor="file" className="font-medium text-gray-700">Justificatif (PDF ou image)</Label>
                                                            <Input
                                                                id="file"
                                                                type="file"
                                                                accept=".pdf,image/*"
                                                                onChange={e => paiementForm.setData('file', e.target.files?.[0] ?? null)}
                                                                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                                            />
                                                            {paiementForm.errors.file && <div className="text-red-600 text-xs mt-1">{paiementForm.errors.file}</div>}
                                                        </div>

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

    const paiementProgress = (facture.montant_paye / facture.total_ttc) * 100;

    // --- NEW: Tabs for filtering factures by status ---

    const [activeTab, setActiveTab] = useState<'en_cours' | 'terminee' | 'annulee'>('en_cours');
    // --- Helper: determine status based on payment ---
    function getFactureStatus(f: any) {
        if (f.status === 'annulee') return 'annulee';
        // If fully paid, mark as 'terminee'
        const total = typeof f.montant_total === 'string' ? parseFloat(f.montant_total.replace(/\s/g, '').replace(',', '.')) : f.montant_total;
        const reste = typeof f.reste_a_payer === 'string' ? parseFloat(f.reste_a_payer.replace(/\s/g, '').replace(',', '.')) : f.reste_a_payer;
        if (reste !== undefined && total !== undefined && Number(reste) <= 0) return 'terminee';
        return 'en_cours';
    }

    // If you have all factures in props, filter them. If not, just show the current one.
    const allFactures: any[] = (typeof window !== 'undefined' && (window as any).__ALL_FACTURES__) || [];
    const filteredFactures = allFactures.length > 0
        ? allFactures.filter((f: any) => getFactureStatus(f) === activeTab)
        : [facture];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Facture ${facture.numero}`} />
            {/* Tabs for status filtering */}
            <div className="flex flex-col gap-4 p-6">
                <div className="flex gap-2 mb-2">
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors border flex items-center gap-2 focus:outline-none ${activeTab === 'en_cours' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
                        onClick={() => setActiveTab('en_cours')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><circle cx="12" cy="12" r="5" fill={activeTab === 'en_cours' ? '#2563eb' : 'currentColor'} /></svg>
                        En cours
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors border flex items-center gap-2 focus:outline-none ${activeTab === 'terminee' ? 'bg-green-600 text-white border-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900'}`}
                        onClick={() => setActiveTab('terminee')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M8 12l2 2l4-4" stroke={activeTab === 'terminee' ? '#22c55e' : 'currentColor'} strokeWidth="2" fill="none" /></svg>
                        Terminée
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors border flex items-center gap-2 focus:outline-none ${activeTab === 'annulee' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900'}`}
                        onClick={() => setActiveTab('annulee')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M9 9l6 6m0-6l-6 6" stroke={activeTab === 'annulee' ? '#ef4444' : 'currentColor'} strokeWidth="2" fill="none" /></svg>
                        Annulée
                    </button>
                </div>
                {/* List of filtered factures (if available) */}
                {allFactures.length > 0 && (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="px-4 py-2 text-left">#</th>
                                    <th className="px-4 py-2 text-left">Numéro</th>
                                    <th className="px-4 py-2 text-left">Client</th>
                                    <th className="px-4 py-2 text-left">Montant</th>
                                    <th className="px-4 py-2 text-left">Statut</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFactures.length > 0 ? filteredFactures.map((f, idx) => (
                                    <tr key={f.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60">
                                        <td className="px-4 py-2">{idx + 1}</td>
                                        <td className="px-4 py-2 font-bold">
                                            <Link href={`/factures/${f.id}`} className="text-primary hover:underline">{f.numero}</Link>
                                        </td>
                                        <td className="px-4 py-2">{f.chantier?.client?.nom || '-'}</td>
                                        <td className="px-4 py-2">{f.montant_total ? f.montant_total.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH' : '-'}</td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                f.status === 'en_cours' ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100' :
                                                f.status === 'terminee' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                                                f.status === 'annulee' ? 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100' :
                                                'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-100'
                                            }`}>
                                                {statuts[f.status] || f.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <Link href={`/factures/${f.id}`} className="text-blue-600 hover:underline">Voir</Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-3xl">📄</span>
                                                <span className="font-semibold">Aucune facture</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* ...existing code... */}
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/factures">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{facture.numero}</h1>
                                <Badge
                                    variant={facture.status_color === 'destructive' ? 'destructive' : 'default'}
                                    className={getStatusBadgeClass(facture.status_color)}
                                >
                                    {facture.status_label}
                                </Badge>
                                {facture.devis && (
                                    <Badge variant="outline">
                                        <FileText className="h-3 w-3 mr-1" />
                                        Devis {facture.devis.numero}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">{facture.objet}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {facture.status !== 'payee' && facture.reste_a_payer > 0 && (
                            <Dialog open={showPaiementDialog} onOpenChange={setShowPaiementDialog}>
                                <DialogTrigger asChild>
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        <Banknote className="mr-2 h-4 w-4" />
                                        Enregistrer paiement
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handlePaiement}>
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                                            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-700">
                                                {/* Header */}
                                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-2 sticky top-0 bg-white dark:bg-gray-900 z-10">
                                                    <div className="flex items-center justify-between">
                                                        <h2 className="text-xl font-bold text-gray-900">Enregistrer un paiement</h2>
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                            facture.status === 'payee' ? 'bg-green-100 text-green-700' :
                                                            facture.status === 'en_cours' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {facture.status === 'payee' && '🟢 Payée'}
                                                            {facture.status === 'en_cours' && '🟡 En cours'}
                                                            {facture.status === 'annulee' && '❌ Annulée'}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-500 text-sm">Reste à payer : <span className="font-semibold text-primary">{formatMoney(facture.reste_a_payer)}</span></div>
                                                </div>
                                                {/* Body (scrollable) */}
                                                <div className="p-6 overflow-y-auto flex-1 min-h-0 bg-white dark:bg-gray-900">
                                                    <div className="space-y-6">
                                                        <div className="space-y-1">
                                                            <Label htmlFor="montant" className="font-medium text-gray-700 flex items-center">Montant <span className="text-red-500 ml-1">*</span></Label>
                                                            <input
                                                                id="montant"
                                                                type="text"
                                                                inputMode="decimal"
                                                                pattern="^[0-9]+([,.][0-9]{1,2})?$"
                                                                value={paiementForm.data.montant !== undefined ? paiementForm.data.montant.toString().replace('.', ',') : ''}
                                                                onChange={e => {
                                                                    let val = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                                                                    paiementForm.setData('montant', parseFloat(val) || 0);
                                                                }}
                                                                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-lg text-right font-semibold focus:border-primary focus:ring-primary appearance-none outline-none w-full text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                                                required
                                                                autoComplete="off"
                                                            />
                                                            {paiementForm.errors.montant && (
                                                                <p className="text-xs text-red-500 mt-1">{paiementForm.errors.montant}</p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label htmlFor="mode_paiement" className="font-medium text-gray-700">Mode de paiement <span className="text-red-500 ml-1">*</span></Label>
                                                            <Select
                                                                value={paiementForm.data.mode_paiement}
                                                                onValueChange={(value) => {
                                                                    paiementForm.setData('mode_paiement', value);
                                                                    setPaymentMethod(value);
                                                                }}
                                                                required
                                                            >
                                                                <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500">
                                                                    <SelectValue placeholder="Sélectionnez" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                                                    {Object.entries(modesPaiement).map(([value, label]) => (
                                                                        <SelectItem key={value} value={value} className="dark:bg-gray-800 dark:text-gray-100">
                                                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 tracking-wide">{label}</span>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        {/* Champs dynamiques selon méthode */}
                                                        {paymentMethod === 'cheque' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <Label htmlFor="cheque_number" className="font-medium text-gray-700">Numéro chèque</Label>
                                                                    <Input id="cheque_number" value={paiementForm.data.cheque_number || ''} onChange={e => paiementForm.setData('cheque_number', e.target.value)} className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label htmlFor="bank_name" className="font-medium text-gray-700 dark:text-gray-200">Banque</Label>
                                                                    <Input
                                                                        id="bank_name"
                                                                        value={paiementForm.data.bank_name || ''}
                                                                        onChange={e => paiementForm.setData('bank_name', e.target.value)}
                                                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {paymentMethod === 'virement' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <Label htmlFor="reference" className="font-medium text-gray-700">Référence virement</Label>
                                                                    <Input id="reference" value={paiementForm.data.reference || ''} onChange={e => paiementForm.setData('reference', e.target.value)} className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label htmlFor="bank_name" className="font-medium text-gray-700 dark:text-gray-200">Banque</Label>
                                                                    <Input id="bank_name" value={paiementForm.data.bank_name || ''} onChange={e => paiementForm.setData('bank_name', e.target.value)} className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {(paymentMethod === 'cheque' || paymentMethod === 'virement' || paymentMethod === 'especes' || paymentMethod === 'carte') && (
                                                            <div className="space-y-1">
                                                                <Label htmlFor="payment_date" className="font-medium text-gray-700">Date paiement <span className="text-red-500 ml-1">*</span></Label>
                                                                <Input id="payment_date" type="date" value={paiementForm.data.payment_date || ''} onChange={e => paiementForm.setData('payment_date', e.target.value)} className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" required />
                                                            </div>
                                                        )}
                                                        <div className="space-y-1">
                                                            <Label htmlFor="notes" className="font-medium text-gray-700">Notes</Label>
                                                            <Input id="notes" value={paiementForm.data.notes || ''} onChange={e => paiementForm.setData('notes', e.target.value)} className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                                                        </div>
                                                        {/* Historique des paiements - TOUJOURS visible */}
                                                        <div className="pt-4">
                                                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg shadow-gray-100/60 dark:shadow-black/40">
                                                                <div className="flex items-center justify-between px-6 pt-6 pb-2">
                                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">Historique des paiements</h3>
                                                                </div>
                                                                <div className="overflow-x-auto w-full">
                                                                    <table className="min-w-full w-full text-sm text-gray-800 dark:text-gray-100">
                                                                        <thead>
                                                                            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase text-xs">
                                                                                <th className="text-left py-4 px-4 min-w-[32px]">#</th>
                                                                                <th className="text-left px-4 min-w-[90px]">Montant</th>
                                                                                <th className="text-left px-4 min-w-[100px]">Méthode</th>
                                                                                <th className="text-left px-4 min-w-[90px]">Date</th>
                                                                                <th className="text-left px-4 min-w-[100px]">Banque</th>
                                                                                <th className="text-left px-4 min-w-[120px]">Numéro chèque</th>
                                                                                <th className="text-left px-4 min-w-[100px]">Référence</th>
                                                                                <th className="text-left px-4 min-w-[120px]">Notes</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {facture.payments && facture.payments.length > 0 ? (
                                                                                [...facture.payments].sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()).map((payment, idx) => (
                                                                                    <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60">
                                                                                        <td className="py-4 px-4">{idx + 1}</td>
                                                                                        <td className="px-4 text-green-700 dark:text-green-400 font-bold text-base">{payment.amount ? payment.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH' : '-'}</td>
                                                                                        <td className="px-4">
                                                                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                                                                payment.payment_method === 'cheque' ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100' :
                                                                                                payment.payment_method === 'especes' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                                                                                                payment.payment_method === 'virement' ? 'bg-purple-100 text-purple-700 dark:bg-purple-700 dark:text-purple-100' :
                                                                                                payment.payment_method === 'carte' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100' :
                                                                                                'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-100'
                                                                                            }`}>
                                                                                                {modesPaiement[payment.payment_method] || payment.payment_method}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="px-4">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('fr-FR') : '-'}</td>
                                                                                        <td className="px-4">{payment.bank_name || '-'}</td>
                                                                                        <td className="px-4">{payment.cheque_number || '-'}</td>
                                                                                        <td className="px-4">{payment.reference || '-'}</td>
                                                                                        <td className="px-4">{payment.notes || '-'}</td>
                                                                                    </tr>
                                                                                ))
                                                                            ) : (
                                                                                <tr>
                                                                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                                                                                        <div className="flex flex-col items-center gap-2">
                                                                                            <span className="text-3xl">💸</span>
                                                                                            <span className="font-semibold">Aucun paiement enregistré</span>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                    <div className="px-4 py-4 text-right text-lg font-bold text-green-700 dark:text-green-400 border-t border-gray-100 dark:border-gray-700 min-w-full">
                                                                        Total payé : {
                                                                            (() => {
                                                                                if (facture.payments && facture.payments.length > 0) {
                                                                                    let total = 0;
                                                                                    for (const p of facture.payments) {
                                                                                        let amt = p.amount;
                                                                                        if (typeof amt === 'string') {
                                                                                            amt = amt.replace(/\s/g, '').replace(',', '.');
                                                                                            amt = parseFloat(amt) || 0;
                                                                                        }
                                                                                        if (typeof amt !== 'number' || isNaN(amt)) amt = 0;
                                                                                        total += amt;
                                                                                    }
                                                                                    return total.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
                                                                                }
                                                                                return '0,00 DH';
                                                                            })()
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Footer (sticky) */}
                                                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900 z-10">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setShowPaiementDialog(false)}
                                                        className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary/40 dark:focus:ring-primary-700/40 focus:outline-none transition-colors"
                                                    >
                                                        Annuler
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={paiementForm.processing}
                                                        className={
                                                            `bg-green-600 dark:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm hover:bg-green-700 dark:hover:bg-green-800 focus:ring-2 focus:ring-green-400 dark:focus:ring-green-800 focus:outline-none transition-colors ` +
                                                            (paiementForm.processing ? 'opacity-60 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' : '')
                                                        }
                                                    >
                                                        {paiementForm.processing ? 'Enregistrement...' : 'Confirmer'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}

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
                                        className={facture.status === value ? 'bg-muted' : ''}
                                    >
                                        {value === 'payee' && <CheckCircle className="h-4 w-4 mr-2 text-green-600" />}
                                        {value === 'annulee' && <XCircle className="h-4 w-4 mr-2 text-destructive" />}
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
                                {facture.status !== 'payee' && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/factures/${facture.id}/edit`} className="flex items-center gap-2">
                                            <Pencil className="h-4 w-4" />
                                            Modifier
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <a href={`/factures/${facture.id}/pdf`} className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Télécharger PDF
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href={`/factures/${facture.id}/pdf-stream`} target="_blank" className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Aperçu PDF
                                    </a>
                                </DropdownMenuItem>
                                {facture.status !== 'payee' && (
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
                                <Receipt className="h-5 w-5" />
                                Informations de la facture
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date de facturation</p>
                                        <p className="font-medium">{facture.date}</p>
                                    </div>
                                </div>
                                {facture.date_echeance && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Date d'échéance</p>
                                            <p className="font-medium">{facture.date_echeance}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Barre de progression paiement */}
                            <div className="rounded-lg bg-muted p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Progression du paiement</span>
                                    <span className="font-medium">{paiementProgress.toFixed(0)}%</span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-600 transition-all duration-300"
                                        style={{ width: `${paiementProgress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600">
                                        Payé: {formatMoney(facture.montant_paye)}
                                    </span>
                                    <span className="text-orange-600">
                                        Reste: {formatMoney(facture.reste_a_payer)}
                                    </span>
                                </div>
                            </div>


                            {/* Historique complet des paiements (sous la barre de progression) */}
                            {facture.payments && facture.payments.length > 0 && (
                                <div className="mt-4 bg-gray-800 rounded-xl p-4">
                                    <h3 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-white" />
                                        Historique des paiements
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-white">
                                            <thead>
                                                <tr className="text-gray-400 border-b border-gray-600">
                                                    <th className="text-left py-2">Date</th>
                                                    <th className="text-left">Méthode</th>
                                                    <th className="text-left">Montant</th>
                                                    <th className="text-left">Banque</th>
                                                    <th className="text-left">Numéro chèque</th>
                                                    <th className="text-left">Référence</th>
                                                    <th className="text-left">Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...facture.payments].sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()).map((payment) => (
                                                    <tr key={payment.id} className="border-b border-gray-700">
                                                        <td className="py-2">
                                                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('fr-FR') : '-'}
                                                        </td>
                                                        <td>
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                                                                payment.payment_method === 'cheque' ? 'bg-blue-700' :
                                                                payment.payment_method === 'especes' ? 'bg-green-700' :
                                                                payment.payment_method === 'virement' ? 'bg-purple-700' :
                                                                payment.payment_method === 'carte' ? 'bg-yellow-700' :
                                                                'bg-gray-700'
                                                            }`}>
                                                                {modesPaiement[payment.payment_method] || payment.payment_method}
                                                            </span>
                                                        </td>
                                                        <td className="text-green-400 font-semibold">
                                                            {formatMoney(payment.amount)}
                                                        </td>
                                                        <td>{payment.bank_name || '-'}</td>
                                                        <td>{payment.cheque_number || '-'}</td>
                                                        <td>{payment.reference || '-'}</td>
                                                        <td>{payment.notes || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Total payé sous le tableau */}
                                    <div className="mt-3 text-right text-base font-bold text-green-300">
                                       Total payé: {
    formatMoney(
        facture.payments.reduce((sum, p) => {
            const amount =
                typeof p.amount === 'string'
                    ? parseFloat(p.amount.replace(/\s/g, '').replace(',', '.')) || 0
                    : p.amount || 0;

            return sum + amount;
        }, 0)
    )
}
                                    </div>
                                </div>
                            )}

                            {facture.bon_commande && (
                                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                                    <p className="text-sm font-medium mb-1 text-blue-800">Bon de commande</p>
                                    <p className="text-sm text-blue-700">{facture.bon_commande}</p>
                                    {facture.bon_commande_path && (
                                        <a
                                            href={`/storage/${facture.bon_commande_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                                        >
                                            Voir le document →
                                        </a>
                                    )}
                                </div>
                            )}

                            {facture.notes && (
                                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                                    <p className="text-sm font-medium mb-1 text-yellow-800">Notes</p>
                                    <p className="text-sm text-yellow-700">{facture.notes}</p>
                                </div>
                            )}

                            {facture.devis && (
                                <div className="rounded-lg bg-gray-50 border p-4">
                                    <p className="text-sm font-medium mb-1">Devis d'origine</p>
                                    <Link
                                        href={`/devis/${facture.devis.id}`}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        {facture.devis.numero} →
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Client et Chantier */}
                    <div className="space-y-6">
                        {facture.chantier?.client && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="h-4 w-4" />
                                        Client
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="font-semibold text-lg">{facture.chantier.client.nom}</p>
                                    {facture.chantier.client.telephone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            {facture.chantier.client.telephone}
                                        </div>
                                    )}
                                    {facture.chantier.client.email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            {facture.chantier.client.email}
                                        </div>
                                    )}
                                    {(facture.chantier.client.adresse || facture.chantier.client.ville) && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                {facture.chantier.client.adresse && <p>{facture.chantier.client.adresse}</p>}
                                                {facture.chantier.client.ville && <p>{facture.chantier.client.ville}</p>}
                                            </div>
                                        </div>
                                    )}
                                    {facture.chantier.client.ice && (
                                        <div className="pt-2 border-t">
                                            <p className="text-xs text-muted-foreground">ICE</p>
                                            <code className="text-sm font-mono">{facture.chantier.client.ice}</code>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {facture.chantier && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Building2 className="h-4 w-4" />
                                        Chantier
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="font-semibold">{facture.chantier.nom}</p>
                                    <p className="text-sm text-muted-foreground">{facture.chantier.reference}</p>
                                    {facture.chantier.localisation && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {facture.chantier.localisation}
                                        </div>
                                    )}
                                    <Button variant="outline" size="sm" className="mt-2" asChild>
                                        <Link href={`/chantiers/${facture.chantier.id}`}>
                                            Voir le chantier
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Lignes de la facture */}
                <Card>
                    <CardHeader>
                        <CardTitle>Détail des prestations</CardTitle>
                        <CardDescription>{facture.items.length} ligne(s)</CardDescription>
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
                                    {facture.items.map((item, index) => (
                                        <TableRow key={item.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                                            <TableCell className="text-muted-foreground">{item.ordre}</TableCell>
                                            <TableCell>
                                                <p className="font-medium">{item.designation}</p>
                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>{item.unite}</TableCell>
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
                                    <span className="font-medium">{formatMoney(facture.total_ht)}</span>
                                </div>
                                {facture.remise_value > 0 && (
                                    <div className="flex justify-between py-2 text-orange-600">
                                        <span>
                                            Remise ({facture.remise_type === 'pourcentage' ? `${facture.remise_value}%` : 'fixe'})
                                        </span>
                                        <span>-{formatMoney(facture.total_ht - facture.total_after_remise)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Total après remise</span>
                                    <span className="font-medium">{formatMoney(facture.total_after_remise)}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">TVA ({facture.tva_percent}%)</span>
                                    <span className="font-medium">{formatMoney(facture.total_tva)}</span>
                                </div>
                                <div className="flex justify-between py-3 border-t text-lg font-bold">
                                    <span>Total TTC</span>
                                    <span className="text-primary">{formatMoney(facture.total_ttc)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-t">
                                    <span className="text-green-600">Montant payé</span>
                                    <span className="font-medium text-green-600">{formatMoney(facture.montant_paye)}</span>
                                </div>
                                <div className="flex justify-between py-2 text-lg font-bold">
                                    <span className="text-orange-600">Reste à payer</span>
                                    <span className="text-orange-600">{formatMoney(facture.reste_a_payer)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Historique des paiements (hors modal) */}
                {facture.payments && facture.payments.length > 0 && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Historique des paiements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Résumé par méthode de paiement */}
                            <div className="mb-4 flex flex-wrap gap-3">
                                {Object.entries(
                                    facture.payments.reduce((acc, p) => {
                                        const key = p.payment_method;
                                        acc[key] = (acc[key] || 0) + p.amount;
                                        return acc;
                                    }, {} as Record<string, number>)
                                ).map(([method, total]) => (
                                    <div key={method} className="flex items-center gap-2 bg-muted rounded px-3 py-1 text-sm font-medium">
                                        <span>{modesPaiement[method] || method}:</span>
                                        <span className="text-green-600">{formatMoney(total)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-lg border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>#</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Méthode</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Banque</TableHead>
                                            <TableHead>Numéro chèque</TableHead>
                                            <TableHead>Référence</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {facture.payments.map((p, idx) => (
                                            <TableRow key={p.id}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>{formatMoney(p.amount)}</TableCell>
                                                <TableCell>{modesPaiement[p.payment_method] || p.payment_method}</TableCell>
                                                <TableCell>{p.payment_date}</TableCell>
                                                <TableCell>{p.bank_name || '-'}</TableCell>
                                                <TableCell>{p.cheque_number || '-'}</TableCell>
                                                <TableCell>{p.reference || '-'}</TableCell>
                                                <TableCell>{p.notes || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Informations supplémentaires */}
                <div className="text-sm text-muted-foreground">
                    <p>Créé le {facture.created_at} par {facture.creator?.name || 'Système'}</p>
                </div>
        </AppLayout>
    );
}
