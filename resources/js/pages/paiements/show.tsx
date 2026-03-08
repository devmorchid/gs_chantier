import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, Link } from '@inertiajs/react';
import {
    CalendarDays, Clock, Wallet, TrendingDown, Plus, FileText,
    CheckCircle2, AlertCircle, ChevronLeft, Printer, CreditCard, Banknote, Smartphone, Image,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Technicien {
    id: number;
    nom: string;
    prenom: string;
    photo?: string;
    specialite_label: string;
    type_contrat_label: string;
    salaire_journalier: number;
}

interface Fiche {
    jours_travailles: number;
    total_heures: number;
    salaire_journalier: number;
    salaire_brut: number;
    total_avances: number;
    total_deductions: number;
    total_primes: number;
    net_a_payer: number;
    montant_paye: number;
    reste_a_payer: number;
    statut: string;
    paiement_id?: number;
    mode_paiement?: string;
    mode_paiement_label?: string;
    // Chèque
    cheque_numero?: string;
    cheque_date_echeance?: string;
    cheque_banque?: string;
    cheque_image?: string;
    // Virement
    virement_reference?: string;
    virement_banque?: string;
    // Transfert mobile
    transfert_numero?: string;
    transfert_service?: string;
}

interface Pointage {
    date: string;
    day: string;
    check_in?: string;
    check_out?: string;
    heures: number;
    statut: string;
}

interface Avance {
    id: number;
    montant: number;
    date: string;
    notes?: string;
    statut: string;
}

interface Deduction {
    id: number;
    montant: number;
    date: string;
    type: string;
    raison?: string;
}

interface Prime {
    id: number;
    montant: number;
    date: string;
    type: string;
    raison?: string;
}

interface HistoriquePaiement {
    id: number;
    periode: string;
    net_a_payer: number;
    montant_paye: number;
    statut: string;
    statut_key: string;
    date_paiement?: string;
}

interface Chantier {
    id: number;
    nom: string;
    reference: string;
}

interface Props {
    technicien: Technicien;
    fiche: Fiche;
    pointages: Pointage[];
    avances: Avance[];
    deductions: Deduction[];
    primes: Prime[];
    historique_paiements: HistoriquePaiement[];
    chantiers: Chantier[];
    month: number;
    year: number;
    chantier_id?: string;
    types_deduction: Record<string, string>;
    types_prime: Record<string, string>;
    modes_paiement: Record<string, string>;
}

const monthNames = [
    '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

function fmt(n: number) {
    return new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(n);
}

function StatutBadge({ statut }: { statut: string }) {
    const map: Record<string, string> = {
        paye: 'bg-green-100 text-green-800',
        partiellement_paye: 'bg-yellow-100 text-yellow-800',
        non_paye: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = { paye: 'Payé', partiellement_paye: 'Partiel', non_paye: 'Non payé' };
    return (
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', map[statut] ?? 'bg-gray-100 text-gray-700')}>
            {labels[statut] ?? statut}
        </span>
    );
}

// ─── Modale Avance ──────────────────────────────────────────────────────────

function AvanceModal({ technicienId, chantiers, month, year, chantierId }: {
    technicienId: number, chantiers: Chantier[], month: number, year: number, chantierId?: string,
}) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        montant: '',
        date: `${year}-${String(month).padStart(2, '0')}-01`,
        notes: '',
        chantier_id: chantierId ?? '',
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/paiements/technicien/${technicienId}/avance`, {
            onSuccess: () => { setOpen(false); reset(); },
        });
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1 border-orange-300 text-orange-700 hover:bg-orange-50">
                    <Plus className="h-3.5 w-3.5" /> Avance
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Enregistrer une avance</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label>Montant (DH)</Label>
                        <Input type="number" min="1" value={data.montant} onChange={(e) => setData('montant', e.target.value)} required />
                        {errors.montant && <p className="text-xs text-red-500">{errors.montant}</p>}
                    </div>
                    <div>
                        <Label>Date</Label>
                        <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} required />
                    </div>
                    <div>
                        <Label>Chantier (optionnel)</Label>
                        <Select value={data.chantier_id} onValueChange={(v) => setData('chantier_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Aucun</SelectItem>
                                {chantiers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Notes</Label>
                        <Input value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button type="submit" disabled={processing}>Enregistrer</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Modale Déduction ────────────────────────────────────────────────────────

function DeductionModal({ technicienId, types, chantiers, month, year, chantierId }: {
    technicienId: number, types: Record<string, string>, chantiers: Chantier[], month: number, year: number, chantierId?: string,
}) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        montant: '',
        date: `${year}-${String(month).padStart(2, '0')}-01`,
        type: 'absence',
        raison: '',
        chantier_id: chantierId ?? '',
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/paiements/technicien/${technicienId}/deduction`, {
            onSuccess: () => { setOpen(false); reset(); },
        });
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1 border-red-300 text-red-700 hover:bg-red-50">
                    <Plus className="h-3.5 w-3.5" /> Déduction
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Ajouter une déduction</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label>Type</Label>
                        <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(types).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Montant (DH)</Label>
                        <Input type="number" min="1" value={data.montant} onChange={(e) => setData('montant', e.target.value)} required />
                        {errors.montant && <p className="text-xs text-red-500">{errors.montant}</p>}
                    </div>
                    <div>
                        <Label>Date</Label>
                        <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} required />
                    </div>
                    <div>
                        <Label>Raison</Label>
                        <Input value={data.raison} onChange={(e) => setData('raison', e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button type="submit" disabled={processing}>Enregistrer</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Modale Prime ────────────────────────────────────────────────────────────

function PrimeModal({ technicienId, types, chantiers, month, year, chantierId }: {
    technicienId: number, types: Record<string, string>, chantiers: Chantier[], month: number, year: number, chantierId?: string,
}) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        montant: '',
        date: `${year}-${String(month).padStart(2, '0')}-01`,
        type: 'performance',
        raison: '',
        chantier_id: chantierId ?? '',
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/paiements/technicien/${technicienId}/prime`, {
            onSuccess: () => { setOpen(false); reset(); },
        });
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1 border-green-300 text-green-700 hover:bg-green-50">
                    <Plus className="h-3.5 w-3.5" /> Prime
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Ajouter une prime</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label>Type</Label>
                        <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(types).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Montant (DH)</Label>
                        <Input type="number" min="1" value={data.montant} onChange={(e) => setData('montant', e.target.value)} required />
                        {errors.montant && <p className="text-xs text-red-500">{errors.montant}</p>}
                    </div>
                    <div>
                        <Label>Date</Label>
                        <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} required />
                    </div>
                    <div>
                        <Label>Raison</Label>
                        <Input value={data.raison} onChange={(e) => setData('raison', e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button type="submit" disabled={processing}>Enregistrer</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Modale Paiement ─────────────────────────────────────────────────────────

function PayerModal({ technicienId, fiche, month, year, chantierId, modes_paiement }: {
    technicienId: number, fiche: Fiche, month: number, year: number, chantierId?: string,
    modes_paiement: Record<string, string>,
}) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<{
        month: string; year: string; montant_paye: string; mode_paiement: string;
        date_paiement: string; chantier_id: string; notes: string;
        cheque_numero: string; cheque_date_echeance: string; cheque_banque: string;
        cheque_image: File | null;
        virement_reference: string; virement_banque: string;
        transfert_numero: string;
    }>({
        month: String(month),
        year: String(year),
        montant_paye: String(fiche.reste_a_payer),
        mode_paiement: 'especes',
        date_paiement: new Date().toISOString().split('T')[0],
        chantier_id: chantierId ?? '',
        notes: '',
        cheque_numero: '',
        cheque_date_echeance: '',
        cheque_banque: '',
        cheque_image: null,
        virement_reference: '',
        virement_banque: '',
        transfert_numero: '',
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/paiements/technicien/${technicienId}/payer`, {
            forceFormData: true,
            onSuccess: () => { setOpen(false); reset(); },
        });
    };
    const mode = data.mode_paiement;
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-1 bg-green-600 hover:bg-green-700">
                    <Wallet className="h-4 w-4" />
                    {fiche.statut === 'non_paye' ? 'Payer' : 'Paiement partiel'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
                <div className="mb-4 rounded-lg bg-blue-50 p-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Net à payer</span>
                        <span className="font-bold text-blue-700">{fmt(fiche.net_a_payer)} DH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Déjà payé</span>
                        <span className="font-medium text-green-600">{fmt(fiche.montant_paye)} DH</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 text-sm font-bold">
                        <span>Reste à payer</span>
                        <span className="text-orange-600">{fmt(fiche.reste_a_payer)} DH</span>
                    </div>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label>Montant à payer (DH)</Label>
                        <Input
                            type="number"
                            min="0.01"
                            max={fiche.reste_a_payer}
                            step="0.01"
                            value={data.montant_paye}
                            onChange={(e) => setData('montant_paye', e.target.value)}
                            required
                        />
                        {errors.montant_paye && <p className="text-xs text-red-500">{errors.montant_paye}</p>}
                    </div>
                    <div>
                        <Label>Mode de paiement</Label>
                        <Select value={data.mode_paiement} onValueChange={(v) => setData('mode_paiement', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(modes_paiement).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ── Chèque fields ── */}
                    {mode === 'cheque' && (
                        <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                            <p className="text-xs font-semibold text-blue-700 uppercase">Détails du chèque</p>
                            <div>
                                <Label>N° du chèque *</Label>
                                <Input value={data.cheque_numero} onChange={(e) => setData('cheque_numero', e.target.value)} placeholder="Ex: 0012345" required />
                                {errors.cheque_numero && <p className="text-xs text-red-500">{errors.cheque_numero}</p>}
                            </div>
                            <div>
                                <Label>Date d'échéance *</Label>
                                <Input type="date" value={data.cheque_date_echeance} onChange={(e) => setData('cheque_date_echeance', e.target.value)} required />
                                {errors.cheque_date_echeance && <p className="text-xs text-red-500">{errors.cheque_date_echeance}</p>}
                            </div>
                            <div>
                                <Label>Banque</Label>
                                <Input value={data.cheque_banque} onChange={(e) => setData('cheque_banque', e.target.value)} placeholder="Ex: Attijariwafa Bank" />
                            </div>
                            <div>
                                <Label>Scanner le chèque (photo)</Label>
                                <Input type="file" accept="image/*" onChange={(e) => setData('cheque_image', e.target.files?.[0] ?? null)} />
                                {errors.cheque_image && <p className="text-xs text-red-500">{errors.cheque_image}</p>}
                            </div>
                        </div>
                    )}

                    {/* ── Virement fields ── */}
                    {mode === 'virement' && (
                        <div className="space-y-3 rounded-lg border border-purple-200 bg-purple-50/50 p-3">
                            <p className="text-xs font-semibold text-purple-700 uppercase">Détails du virement</p>
                            <div>
                                <Label>Référence du virement *</Label>
                                <Input value={data.virement_reference} onChange={(e) => setData('virement_reference', e.target.value)} placeholder="Ex: VIR-20260307-001" required />
                                {errors.virement_reference && <p className="text-xs text-red-500">{errors.virement_reference}</p>}
                            </div>
                            <div>
                                <Label>Banque</Label>
                                <Input value={data.virement_banque} onChange={(e) => setData('virement_banque', e.target.value)} placeholder="Ex: CIH Bank" />
                            </div>
                        </div>
                    )}

                    {/* ── Wafa Cash / Cash Plus fields ── */}
                    {(mode === 'wafa_cash' || mode === 'cash_plus') && (
                        <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50/50 p-3">
                            <p className="text-xs font-semibold text-orange-700 uppercase">
                                Détails {mode === 'wafa_cash' ? 'Wafa Cash' : 'Cash Plus'}
                            </p>
                            <div>
                                <Label>N° de transaction / téléphone *</Label>
                                <Input value={data.transfert_numero} onChange={(e) => setData('transfert_numero', e.target.value)} placeholder="Ex: 0612345678" required />
                                {errors.transfert_numero && <p className="text-xs text-red-500">{errors.transfert_numero}</p>}
                            </div>
                        </div>
                    )}

                    <div>
                        <Label>Date du paiement</Label>
                        <Input type="date" value={data.date_paiement} onChange={(e) => setData('date_paiement', e.target.value)} required />
                    </div>
                    <div>
                        <Label>Notes (optionnel)</Label>
                        <Textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={2} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                            Confirmer le paiement
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function PaiementsShow({
    technicien, fiche, pointages, avances, deductions, primes,
    historique_paiements, chantiers, month, year, chantier_id,
    types_deduction, types_prime, modes_paiement,
}: Props) {

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Paie Techniciens', href: '/paiements' },
        { title: `${technicien.nom} ${technicien.prenom}`, href: '#' },
    ];

    const applyFilter = (params: Record<string, string | number | undefined>) => {
        router.get(`/paiements/technicien/${technicien.id}`, { month, year, chantier_id, ...params }, { preserveState: true });
    };

    const pdfUrl = `/paiements/technicien/${technicien.id}/pdf?month=${month}&year=${year}${chantier_id ? `&chantier_id=${chantier_id}` : ''}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Fiche paie — ${technicien.nom} ${technicien.prenom}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link href="/paiements" className="flex items-center text-gray-500 hover:text-gray-700">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{technicien.nom} {technicien.prenom}</h1>
                            <p className="text-sm text-gray-500">{technicien.specialite_label} · {technicien.type_contrat_label}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={pdfUrl} target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm" className="gap-1">
                                <Printer className="h-4 w-4" /> Fiche PDF
                            </Button>
                        </a>
                        {fiche.statut !== 'paye' && (
                            <PayerModal
                                technicienId={technicien.id}
                                fiche={fiche}
                                month={month}
                                year={year}
                                chantierId={chantier_id}
                                modes_paiement={modes_paiement}
                            />
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <Select value={String(month)} onValueChange={(v) => applyFilter({ month: v })}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {monthNames.slice(1).map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={String(year)} onValueChange={(v) => applyFilter({ year: v })}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={chantier_id ?? 'all'} onValueChange={(v) => applyFilter({ chantier_id: v === 'all' ? undefined : v })}>
                        <SelectTrigger className="w-52"><SelectValue placeholder="Tous les chantiers" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les chantiers</SelectItem>
                            {chantiers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.reference} — {c.nom}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Fiche calcul */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <CalendarDays className="h-8 w-8 text-blue-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Jours travaillés</p>
                                    <p className="text-2xl font-bold">{fiche.jours_travailles}</p>
                                    <p className="text-xs text-gray-400">{fiche.total_heures}h total</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Wallet className="h-8 w-8 text-indigo-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Salaire brut</p>
                                    <p className="text-2xl font-bold">{fmt(fiche.salaire_brut)} DH</p>
                                    <p className="text-xs text-gray-400">{fmt(fiche.salaire_journalier)} DH/j</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 space-y-2">
                            <p className="text-xs font-medium text-gray-500">Récapitulatif</p>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Brut</span>
                                    <span className="font-medium">{fmt(fiche.salaire_brut)} DH</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>— Avances</span>
                                    <span>{fmt(fiche.total_avances)} DH</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>— Déductions</span>
                                    <span>{fmt(fiche.total_deductions)} DH</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>+ Primes</span>
                                    <span>{fmt(fiche.total_primes)} DH</span>
                                </div>
                                <div className="flex justify-between border-t pt-1 font-bold text-blue-700">
                                    <span>Net à payer</span>
                                    <span>{fmt(fiche.net_a_payer)} DH</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-500">Statut paiement</p>
                                <StatutBadge statut={fiche.statut} />
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payé</span>
                                    <span className="font-medium text-green-600">{fmt(fiche.montant_paye)} DH</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span>Reste</span>
                                    <span className="text-orange-600">{fmt(fiche.reste_a_payer)} DH</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Grid 2 colonnes */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Pointages du mois */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" /> Pointages — {monthNames[month]} {year}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-64 overflow-y-auto">
                                <table className="w-full text-xs">
                                    <thead className="sticky top-0 border-b bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Date</th>
                                            <th className="px-3 py-2 text-left">Entrée</th>
                                            <th className="px-3 py-2 text-left">Sortie</th>
                                            <th className="px-3 py-2 text-right">Heures</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {pointages.length === 0 ? (
                                            <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-400">Aucun pointage</td></tr>
                                        ) : pointages.map((p, i) => (
                                            <tr key={i} className={cn('hover:bg-gray-50', p.statut === 'absent' && 'bg-red-50')}>
                                                <td className="px-3 py-1.5">
                                                    <div className="font-medium">{p.date}</div>
                                                    <div className="text-gray-400 capitalize">{p.day}</div>
                                                </td>
                                                <td className="px-3 py-1.5">{p.check_in ?? '—'}</td>
                                                <td className="px-3 py-1.5">{p.check_out ?? '—'}</td>
                                                <td className="px-3 py-1.5 text-right">{p.heures > 0 ? `${p.heures}h` : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Avances */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <TrendingDown className="h-4 w-4 text-orange-500" /> Avances
                                    {avances.length > 0 && (
                                        <span className="font-normal text-orange-600">({fmt(avances.reduce((s, a) => s + a.montant, 0))} DH)</span>
                                    )}
                                </CardTitle>
                                <AvanceModal
                                    technicienId={technicien.id}
                                    chantiers={chantiers}
                                    month={month}
                                    year={year}
                                    chantierId={chantier_id}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-48 overflow-y-auto">
                                {avances.length === 0 ? (
                                    <p className="px-4 py-4 text-center text-sm text-gray-400">Aucune avance</p>
                                ) : (
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 border-b bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Date</th>
                                                <th className="px-3 py-2 text-right">Montant</th>
                                                <th className="px-3 py-2 text-left">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {avances.map((a) => (
                                                <tr key={a.id}>
                                                    <td className="px-3 py-1.5">{a.date}</td>
                                                    <td className="px-3 py-1.5 text-right font-medium text-red-600">{fmt(a.montant)} DH</td>
                                                    <td className="px-3 py-1.5 text-gray-500">{a.notes ?? '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Déductions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <AlertCircle className="h-4 w-4 text-red-500" /> Déductions
                                    {deductions.length > 0 && (
                                        <span className="font-normal text-red-600">({fmt(deductions.reduce((s, d) => s + d.montant, 0))} DH)</span>
                                    )}
                                </CardTitle>
                                <DeductionModal
                                    technicienId={technicien.id}
                                    types={types_deduction}
                                    chantiers={chantiers}
                                    month={month}
                                    year={year}
                                    chantierId={chantier_id}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-48 overflow-y-auto">
                                {deductions.length === 0 ? (
                                    <p className="px-4 py-4 text-center text-sm text-gray-400">Aucune déduction</p>
                                ) : (
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 border-b bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Date</th>
                                                <th className="px-3 py-2 text-left">Type</th>
                                                <th className="px-3 py-2 text-right">Montant</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {deductions.map((d) => (
                                                <tr key={d.id}>
                                                    <td className="px-3 py-1.5">{d.date}</td>
                                                    <td className="px-3 py-1.5">{d.type}</td>
                                                    <td className="px-3 py-1.5 text-right font-medium text-red-600">{fmt(d.montant)} DH</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Primes */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Primes
                                    {primes.length > 0 && (
                                        <span className="font-normal text-green-600">({fmt(primes.reduce((s, p) => s + p.montant, 0))} DH)</span>
                                    )}
                                </CardTitle>
                                <PrimeModal
                                    technicienId={technicien.id}
                                    types={types_prime}
                                    chantiers={chantiers}
                                    month={month}
                                    year={year}
                                    chantierId={chantier_id}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-48 overflow-y-auto">
                                {primes.length === 0 ? (
                                    <p className="px-4 py-4 text-center text-sm text-gray-400">Aucune prime</p>
                                ) : (
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 border-b bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Date</th>
                                                <th className="px-3 py-2 text-left">Type</th>
                                                <th className="px-3 py-2 text-right">Montant</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {primes.map((p) => (
                                                <tr key={p.id}>
                                                    <td className="px-3 py-1.5">{p.date}</td>
                                                    <td className="px-3 py-1.5">{p.type}</td>
                                                    <td className="px-3 py-1.5 text-right font-medium text-green-600">{fmt(p.montant)} DH</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Détails du mode de paiement */}
                {fiche.mode_paiement && fiche.statut !== 'non_paye' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <CreditCard className="h-4 w-4" /> Détails du paiement — {fiche.mode_paiement_label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {/* Chèque */}
                                {fiche.mode_paiement === 'cheque' && (
                                    <>
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                            <p className="text-xs font-semibold text-blue-700 mb-1">N° du chèque</p>
                                            <p className="text-sm font-mono font-bold">{fiche.cheque_numero ?? '—'}</p>
                                        </div>
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                            <p className="text-xs font-semibold text-blue-700 mb-1">Date d'échéance</p>
                                            <p className="text-sm font-bold">{fiche.cheque_date_echeance ?? '—'}</p>
                                        </div>
                                        {fiche.cheque_banque && (
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                <p className="text-xs font-semibold text-blue-700 mb-1">Banque</p>
                                                <p className="text-sm font-bold">{fiche.cheque_banque}</p>
                                            </div>
                                        )}
                                        {fiche.cheque_image && (
                                            <div className="col-span-full">
                                                <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                                                    <Image className="h-3.5 w-3.5" /> Photo du chèque
                                                </p>
                                                <a href={`/storage/${fiche.cheque_image}`} target="_blank" rel="noreferrer">
                                                    <img src={`/storage/${fiche.cheque_image}`} alt="Chèque scanné" className="max-w-sm rounded-lg border shadow-sm hover:shadow-md transition-shadow" />
                                                </a>
                                            </div>
                                        )}
                                    </>
                                )}
                                {/* Virement */}
                                {fiche.mode_paiement === 'virement' && (
                                    <>
                                        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                                            <p className="text-xs font-semibold text-purple-700 mb-1">Référence du virement</p>
                                            <p className="text-sm font-mono font-bold">{fiche.virement_reference ?? '—'}</p>
                                        </div>
                                        {fiche.virement_banque && (
                                            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                                                <p className="text-xs font-semibold text-purple-700 mb-1">Banque</p>
                                                <p className="text-sm font-bold">{fiche.virement_banque}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                {/* Wafa Cash / Cash Plus */}
                                {(fiche.mode_paiement === 'wafa_cash' || fiche.mode_paiement === 'cash_plus') && (
                                    <>
                                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                                            <p className="text-xs font-semibold text-orange-700 mb-1 flex items-center gap-1">
                                                <Smartphone className="h-3.5 w-3.5" /> Service
                                            </p>
                                            <p className="text-sm font-bold">{fiche.mode_paiement === 'wafa_cash' ? 'Wafa Cash' : 'Cash Plus'}</p>
                                        </div>
                                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                                            <p className="text-xs font-semibold text-orange-700 mb-1">N° transaction / téléphone</p>
                                            <p className="text-sm font-mono font-bold">{fiche.transfert_numero ?? '—'}</p>
                                        </div>
                                    </>
                                )}
                                {/* Espèces */}
                                {fiche.mode_paiement === 'especes' && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                        <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                                            <Banknote className="h-3.5 w-3.5" /> Paiement en espèces
                                        </p>
                                        <p className="text-sm font-bold">{fmt(fiche.montant_paye)} DH</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Historique Paiements */}
                {historique_paiements.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4" /> Historique des paiements
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Période</th>
                                        <th className="px-4 py-2 text-right">Net à payer</th>
                                        <th className="px-4 py-2 text-right">Montant payé</th>
                                        <th className="px-4 py-2 text-center">Statut</th>
                                        <th className="px-4 py-2 text-left">Date paiement</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {historique_paiements.map((h) => (
                                        <tr key={h.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2">{h.periode}</td>
                                            <td className="px-4 py-2 text-right font-medium">{fmt(h.net_a_payer)} DH</td>
                                            <td className="px-4 py-2 text-right text-green-600">{fmt(h.montant_paye)} DH</td>
                                            <td className="px-4 py-2 text-center"><StatutBadge statut={h.statut_key} /></td>
                                            <td className="px-4 py-2">{h.date_paiement ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
