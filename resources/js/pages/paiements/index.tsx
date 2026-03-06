import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { Users, Wallet, TrendingDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Technicien {
    id: number;
    nom: string;
    prenom: string;
    photo?: string;
    specialite_label: string;
    type_contrat: string;
    type_contrat_label: string;
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
}

interface Chantier {
    id: number;
    nom: string;
    reference: string;
}

interface Stats {
    total_techniciens: number;
    total_brut: number;
    total_avances: number;
    total_net: number;
    total_paye: number;
    total_reste: number;
    payes: number;
    partiels: number;
    non_payes: number;
}

interface Props {
    techniciens: Technicien[];
    stats: Stats;
    chantiers: Chantier[];
    month: number;
    year: number;
    chantier_id?: string;
    filters: { search?: string; chantier_id?: string };
    statuts: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Paie Techniciens', href: '/paiements' },
];

const monthNames = [
    '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

function statutBadge(statut: string) {
    const map: Record<string, { label: string; class: string }> = {
        paye:               { label: 'Payé',              class: 'bg-green-100 text-green-800' },
        partiellement_paye: { label: 'Partiel',           class: 'bg-yellow-100 text-yellow-800' },
        non_paye:           { label: 'Non payé',          class: 'bg-red-100 text-red-800' },
    };
    const s = map[statut] ?? { label: statut, class: 'bg-gray-100 text-gray-700' };
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.class}`}>{s.label}</span>;
}

export default function PaiementsIndex({ techniciens, stats, chantiers, month, year, chantier_id, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (params: Record<string, string | number | undefined>) => {
        router.get('/paiements', { month, year, chantier_id, search, ...params }, { preserveState: true });
    };

    const fmt = (n: number) => new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(n);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paie Techniciens" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paie Techniciens</h1>
                        <p className="text-sm text-gray-500">{monthNames[month]} {year}</p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Techniciens</p>
                                    <p className="text-xl font-bold">{stats.total_techniciens}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-indigo-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Total Brut</p>
                                    <p className="text-lg font-bold">{fmt(stats.total_brut)} DH</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Total Net</p>
                                    <p className="text-lg font-bold">{fmt(stats.total_net)} DH</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Payés</p>
                                    <p className="text-xl font-bold text-green-600">{stats.payes}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Partiels</p>
                                    <p className="text-xl font-bold text-yellow-600">{stats.partiels}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Non payés</p>
                                    <p className="text-xl font-bold text-red-600">{stats.non_payes}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            {/* Month */}
                            <Select value={String(month)} onValueChange={(v) => applyFilters({ month: v })}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Mois" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthNames.slice(1).map((m, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Year */}
                            <Select value={String(year)} onValueChange={(v) => applyFilters({ year: v })}>
                                <SelectTrigger className="w-28">
                                    <SelectValue placeholder="Année" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Chantier */}
                            <Select value={chantier_id ?? 'all'} onValueChange={(v) => applyFilters({ chantier_id: v === 'all' ? undefined : v })}>
                                <SelectTrigger className="w-52">
                                    <SelectValue placeholder="Tous les chantiers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les chantiers</SelectItem>
                                    {chantiers.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.reference} — {c.nom}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Search */}
                            <form onSubmit={(e) => { e.preventDefault(); applyFilters({ search }); }} className="flex gap-2">
                                <Input
                                    placeholder="Rechercher technicien..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-56"
                                />
                                <Button type="submit" variant="outline">Chercher</Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Récapitulatif — {monthNames[month]} {year}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500">Technicien</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500">Contrat</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500">Jours</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500">Salaire/j</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500">Brut</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500">Avances</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500">Déductions</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500">Primes</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500">Net à payer</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500">Reste</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-500">Statut</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {techniciens.length === 0 ? (
                                        <tr>
                                            <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
                                                Aucun technicien trouvé pour ce mois
                                            </td>
                                        </tr>
                                    ) : techniciens.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{t.nom} {t.prenom}</div>
                                                <div className="text-xs text-gray-400">{t.specialite_label}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="text-xs">{t.type_contrat_label}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">{t.jours_travailles}j</td>
                                            <td className="px-4 py-3 text-right">{fmt(t.salaire_journalier)}</td>
                                            <td className="px-4 py-3 text-right font-medium">{fmt(t.salaire_brut)}</td>
                                            <td className="px-4 py-3 text-right text-red-600">
                                                {t.total_avances > 0 ? `-${fmt(t.total_avances)}` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-red-600">
                                                {t.total_deductions > 0 ? `-${fmt(t.total_deductions)}` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-green-600">
                                                {t.total_primes > 0 ? `+${fmt(t.total_primes)}` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-blue-700">
                                                {fmt(t.net_a_payer)} DH
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-orange-600">
                                                {t.reste_a_payer > 0 ? `${fmt(t.reste_a_payer)} DH` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center">{statutBadge(t.statut)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Link
                                                    href={`/paiements/technicien/${t.id}?month=${month}&year=${year}${chantier_id ? `&chantier_id=${chantier_id}` : ''}`}
                                                    className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                >
                                                    Détails
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {techniciens.length > 0 && (
                                    <tfoot className="border-t bg-gray-50 dark:bg-gray-800">
                                        <tr className="font-bold">
                                            <td className="px-4 py-3" colSpan={4}>Total</td>
                                            <td className="px-4 py-3 text-right">{fmt(stats.total_brut)} DH</td>
                                            <td className="px-4 py-3 text-right text-red-600">-{fmt(stats.total_avances)} DH</td>
                                            <td className="px-4 py-3 text-right text-red-600">—</td>
                                            <td className="px-4 py-3 text-right text-green-600">—</td>
                                            <td className="px-4 py-3 text-right text-blue-700">{fmt(stats.total_net)} DH</td>
                                            <td className="px-4 py-3 text-right text-orange-600">{fmt(stats.total_reste)} DH</td>
                                            <td colSpan={2} />
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
