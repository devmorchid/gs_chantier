import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import {
    HardHat, Users, UserCheck, UserX, Clock,
    ArrowLeft, Calendar, BarChart3, ChevronRight,
} from 'lucide-react';

interface Chantier {
    id: number;
    nom: string;
    reference: string;
    adresse: string;
    statut: string;
    statut_label: string;
    client_nom: string | null;
}

interface TechnicienRow {
    id: number;
    nom: string;
    prenom: string;
    photo: string | null;
    specialite_label: string | null;
    status_today: 'present' | 'en_cours' | 'absent';
    check_in_today: string | null;
    check_out_today: string | null;
    jours_mois: number;
    heures_mois: number;
}

interface JourHistorique {
    date: string;
    date_raw: string;
    presents: number;
    en_cours: number;
    total: number;
    heures: number;
}

interface Props {
    chantier: Chantier;
    today: string;
    month: number;
    year: number;
    stats: { total: number; presents: number; en_cours: number; absents: number };
    techniciens: TechnicienRow[];
    historique_jours: JourHistorique[];
}

const statusConfig = {
    present: { bg: 'bg-green-500', label: 'Présent', ring: 'ring-green-500' },
    en_cours: { bg: 'bg-yellow-500', label: 'En cours', ring: 'ring-yellow-500' },
    absent: { bg: 'bg-red-500', label: 'Absent', ring: 'ring-red-500' },
};

const months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },     { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' }, { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' },
];

const statutColors: Record<string, string> = {
    en_attente: 'bg-yellow-500',
    en_cours: 'bg-blue-500',
    termine: 'bg-green-500',
    annule: 'bg-red-500',
};

export default function PointageByChantier({ chantier, today, month, year, stats, techniciens, historique_jours }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pointages', href: '/pointages' },
        { title: chantier.nom, href: `/chantier/${chantier.id}/pointages` },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const handleMonthChange = (val: string) => {
        router.get(`/chantier/${chantier.id}/pointages`, { month: val, year }, { preserveState: true, preserveScroll: true });
    };
    const handleYearChange = (val: string) => {
        router.get(`/chantier/${chantier.id}/pointages`, { month, year: val }, { preserveState: true, preserveScroll: true });
    };

    const totalHeuresMois = techniciens.reduce((sum, t) => sum + t.heures_mois, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pointages — ${chantier.nom}`} />

            <div className="p-6 space-y-6">

                {/* ---- HEADER ---- */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <HardHat className="h-7 w-7 text-primary" />
                            <h1 className="text-3xl font-bold">{chantier.nom}</h1>
                            <Badge className={statutColors[chantier.statut] ?? 'bg-gray-500'}>
                                {chantier.statut_label}
                            </Badge>
                        </div>
                        <p className="text-gray-500 text-sm">{chantier.reference} — {chantier.adresse}</p>
                        {chantier.client_nom && (
                            <p className="text-gray-400 text-xs mt-1">Client : {chantier.client_nom}</p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">Aujourd'hui : {today}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/pointages">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </Button>
                        </Link>
                        <Link href="/pointages/statistiques">
                            <Button variant="outline" size="sm">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Statistiques
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* ---- STATS DU JOUR ---- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <Users className="h-7 w-7 mx-auto text-blue-500 mb-1" />
                            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                            <p className="text-xs text-gray-500">Techniciens</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <UserCheck className="h-7 w-7 mx-auto text-green-500 mb-1" />
                            <p className="text-3xl font-bold text-green-600">{stats.presents}</p>
                            <p className="text-xs text-gray-500">Présents</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <Clock className="h-7 w-7 mx-auto text-yellow-500 mb-1" />
                            <p className="text-3xl font-bold text-yellow-600">{stats.en_cours}</p>
                            <p className="text-xs text-gray-500">En cours</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <UserX className="h-7 w-7 mx-auto text-red-500 mb-1" />
                            <p className="text-3xl font-bold text-red-600">{stats.absents}</p>
                            <p className="text-xs text-gray-500">Absents</p>
                        </CardContent>
                    </Card>
                </div>

                {/* ---- FILTRE MOIS ---- */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-500 font-medium">Historique :</span>
                    <Select value={month.toString()} onValueChange={handleMonthChange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(m => (
                                <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={year.toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-400 ml-auto">
                        Total mois : <strong>{Math.round(totalHeuresMois * 10) / 10}h</strong> de travail
                    </span>
                </div>

                {/* ---- ÉVOLUTION MENSUELLE (bar chart CSS) ---- */}
                {historique_jours.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Présences par jour — {months.find(m => m.value === month)?.label} {year}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-1 h-28 overflow-x-auto pb-1">
                                {historique_jours.map(jour => {
                                    const maxTotal = Math.max(...historique_jours.map(j => j.total), 1);
                                    const height = Math.max(4, (jour.total / maxTotal) * 88);
                                    return (
                                        <div key={jour.date_raw} className="flex flex-col items-center gap-0.5 min-w-[28px]">
                                            <span className="text-[9px] text-gray-400">{jour.total}</span>
                                            <div
                                                className="w-5 rounded-t transition-all"
                                                style={{
                                                    height: `${height}px`,
                                                    backgroundColor: jour.date_raw === today ? '#3b82f6' : '#22c55e',
                                                }}
                                                title={`${jour.date} : ${jour.total} tech, ${jour.heures}h`}
                                            />
                                            <span className="text-[9px] text-gray-500">{jour.date}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded bg-green-500 inline-block" /> Jours passés
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Aujourd'hui
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ---- LISTE DES TECHNICIENS ---- */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Techniciens affectés ({techniciens.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {techniciens.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">Aucun technicien affecté à ce chantier</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40">
                                            <th className="p-3 text-left">Technicien</th>
                                            <th className="p-3 text-left">Spécialité</th>
                                            <th className="p-3 text-center">Statut aujourd'hui</th>
                                            <th className="p-3 text-center">Entrée</th>
                                            <th className="p-3 text-center">Sortie</th>
                                            <th className="p-3 text-center">Jours / mois</th>
                                            <th className="p-3 text-center">Heures / mois</th>
                                            <th className="p-3 text-center">Détails</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {techniciens.map(t => (
                                            <tr key={t.id} className="border-b hover:bg-muted/20 transition-colors">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-8 h-8 rounded-full ring-2 ${statusConfig[t.status_today].ring} overflow-hidden flex-shrink-0`}>
                                                            {t.photo ? (
                                                                <img src={`/storage/${t.photo}`} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-500 flex items-center justify-center text-white text-xs font-bold">
                                                                    {t.prenom[0]}{t.nom[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="font-medium">{t.prenom} {t.nom}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-gray-500 text-xs">{t.specialite_label ?? '—'}</td>
                                                <td className="p-3 text-center">
                                                    <Badge className={statusConfig[t.status_today].bg}>
                                                        {statusConfig[t.status_today].label}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-center font-mono">
                                                    {t.check_in_today ?? <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="p-3 text-center font-mono">
                                                    {t.check_out_today ?? <span className="text-gray-400">—</span>}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="font-semibold">{t.jours_mois}</span>
                                                    <span className="text-gray-400 text-xs ml-1">j</span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="font-semibold">{t.heures_mois}</span>
                                                    <span className="text-gray-400 text-xs ml-1">h</span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Link href={`/technicien/${t.id}/pointages`}>
                                                        <Button variant="outline" size="sm">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ---- HISTORIQUE TABLEAU ---- */}
                {historique_jours.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Détail journalier — {months.find(m => m.value === month)?.label} {year}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40">
                                            <th className="p-3 text-left">Date</th>
                                            <th className="p-3 text-center">Présents</th>
                                            <th className="p-3 text-center">En cours</th>
                                            <th className="p-3 text-center">Total</th>
                                            <th className="p-3 text-center">Heures</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historique_jours.map(jour => (
                                            <tr
                                                key={jour.date_raw}
                                                className={`border-b hover:bg-muted/20 transition-colors ${jour.date_raw === today ? 'bg-blue-500/10 font-semibold' : ''}`}
                                            >
                                                <td className="p-3">
                                                    {jour.date}
                                                    {jour.date_raw === today && (
                                                        <Badge className="ml-2 bg-blue-500 text-xs">Aujourd'hui</Badge>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center text-green-600 font-medium">{jour.presents}</td>
                                                <td className="p-3 text-center text-yellow-600 font-medium">{jour.en_cours}</td>
                                                <td className="p-3 text-center font-bold">{jour.total}</td>
                                                <td className="p-3 text-center">{jour.heures}h</td>
                                            </tr>
                                        ))}
                                        <tr className="border-t-2 bg-muted/30 font-bold">
                                            <td className="p-3">Total</td>
                                            <td className="p-3 text-center text-green-600">
                                                {historique_jours.reduce((s, j) => s + j.presents, 0)}
                                            </td>
                                            <td className="p-3 text-center text-yellow-600">
                                                {historique_jours.reduce((s, j) => s + j.en_cours, 0)}
                                            </td>
                                            <td className="p-3 text-center">
                                                {historique_jours.reduce((s, j) => s + j.total, 0)}
                                            </td>
                                            <td className="p-3 text-center">
                                                {Math.round(historique_jours.reduce((s, j) => s + j.heures, 0) * 10) / 10}h
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </AppLayout>
    );
}
