import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Users, Clock, CalendarCheck, TrendingUp,
    Building2, UserCheck, AlertCircle, Activity,
} from 'lucide-react';

interface StatsJour {
    total: number;
    presents: number;
    absents: number;
    en_cours: number;
    taux: number;
}

interface StatsMois {
    total_journees: number;
    total_heures: number;
    moyenne_heures_jour: number;
    techniciens_actifs: number;
}

interface EvolutionItem {
    mois: string;
    mois_full: string;
    jours: number;
    techniciens: number;
    heures: number;
}

interface TopTechnicien {
    id: number;
    nom: string;
    prenom: string;
    specialite: string;
    jours: number;
    heures: number;
}

interface StatsChantier {
    id: number;
    nom: string;
    reference: string;
    techniciens: number;
    jours: number;
    heures: number;
}

interface Props {
    today: string;
    month: number;
    year: number;
    monthLabel: string;
    stats_jour: StatsJour;
    stats_mois: StatsMois;
    evolution: EvolutionItem[];
    top_techniciens: TopTechnicien[];
    stats_chantiers: StatsChantier[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pointage', href: '/pointages' },
    { title: 'Statistiques', href: '/pointages/statistiques' },
];

const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];
const MONTH_LABELS: Record<number, string> = {
    1:'Janvier',2:'Février',3:'Mars',4:'Avril',5:'Mai',6:'Juin',
    7:'Juillet',8:'Août',9:'Septembre',10:'Octobre',11:'Novembre',12:'Décembre',
};

export default function PointageStatistiques({
    today, month, year, monthLabel,
    stats_jour, stats_mois, evolution, top_techniciens, stats_chantiers,
}: Props) {
    const [selectedMonth, setSelectedMonth] = useState(month);
    const [selectedYear, setSelectedYear]   = useState(year);

    const handleFilter = (m: number, y: number) => {
        router.get('/pointages/statistiques', { month: m, year: y }, { preserveState: true });
    };

    // Max heures pour les barres relatives
    const maxHeuresEvo  = Math.max(...evolution.map(e => e.heures), 1);
    const maxHeuresTop  = Math.max(...top_techniciens.map(t => t.heures), 1);
    const maxHeuresChan = Math.max(...stats_chantiers.map(c => c.heures), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statistiques Pointage" />

            <div className="p-6 space-y-6">

                {/* ===== TITRE + FILTRE ===== */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Statistiques Pointage</h1>
                        <p className="text-gray-400 mt-1 text-sm">Vue d'ensemble de la présence</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <select
                            value={selectedMonth}
                            onChange={e => { const m = +e.target.value; setSelectedMonth(m); handleFilter(m, selectedYear); }}
                            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                        >
                            {MONTHS.map(m => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={e => { const y = +e.target.value; setSelectedYear(y); handleFilter(selectedMonth, y); }}
                            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                        >
                            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* ===== STATS DU JOUR ===== */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Aujourd'hui — {new Date(today).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Total */}
                        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                <span className="text-xs text-gray-400 uppercase tracking-wide">Total</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{stats_jour.total}</div>
                            <div className="text-xs text-gray-500 mt-1">techniciens</div>
                        </div>
                        {/* Présents */}
                        <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <UserCheck className="w-5 h-5 text-green-400" />
                                <span className="text-xs text-green-400 uppercase tracking-wide">Présents</span>
                            </div>
                            <div className="text-3xl font-bold text-green-300">{stats_jour.presents}</div>
                            <div className="text-xs text-green-600 mt-1">ont pointé</div>
                        </div>
                        {/* En cours */}
                        <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-yellow-400" />
                                <span className="text-xs text-yellow-400 uppercase tracking-wide">En cours</span>
                            </div>
                            <div className="text-3xl font-bold text-yellow-300">{stats_jour.en_cours}</div>
                            <div className="text-xs text-yellow-600 mt-1">sans check-out</div>
                        </div>
                        {/* Absents */}
                        <div className="bg-red-950 border border-red-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                                <span className="text-xs text-red-400 uppercase tracking-wide">Absents</span>
                            </div>
                            <div className="text-3xl font-bold text-red-300">{stats_jour.absents}</div>
                            <div className="text-xs text-red-600 mt-1">non pointés</div>
                        </div>
                        {/* Taux */}
                        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                <span className="text-xs text-gray-400 uppercase tracking-wide">Taux présence</span>
                            </div>
                            <div className="text-3xl font-bold text-purple-300">{stats_jour.taux}%</div>
                            {/* Mini barre */}
                            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                                    style={{ width: `${stats_jour.taux}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== STATS DU MOIS ===== */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-blue-400" />
                        {monthLabel} {year}
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-950 border border-blue-800 rounded-xl p-4">
                            <div className="text-xs text-blue-400 uppercase tracking-wide mb-2">Journées travaillées</div>
                            <div className="text-3xl font-bold text-blue-300">{stats_mois.total_journees}</div>
                            <div className="text-xs text-blue-600 mt-1">entrées avec check-in + check-out</div>
                        </div>
                        <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                            <div className="text-xs text-green-400 uppercase tracking-wide mb-2">Total heures</div>
                            <div className="text-3xl font-bold text-green-300">{stats_mois.total_heures}h</div>
                            <div className="text-xs text-green-600 mt-1">cumulées ce mois</div>
                        </div>
                        <div className="bg-orange-950 border border-orange-800 rounded-xl p-4">
                            <div className="text-xs text-orange-400 uppercase tracking-wide mb-2">Moy. heures / jour</div>
                            <div className="text-3xl font-bold text-orange-300">{stats_mois.moyenne_heures_jour}h</div>
                            <div className="text-xs text-orange-600 mt-1">par jour travaillé</div>
                        </div>
                        <div className="bg-purple-950 border border-purple-800 rounded-xl p-4">
                            <div className="text-xs text-purple-400 uppercase tracking-wide mb-2">Techniciens actifs</div>
                            <div className="text-3xl font-bold text-purple-300">{stats_mois.techniciens_actifs}</div>
                            <div className="text-xs text-purple-600 mt-1">ont pointé ce mois</div>
                        </div>
                    </div>
                </section>

                {/* ===== EVOLUTION 6 MOIS (barres CSS) ===== */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Évolution — 6 derniers mois
                    </h2>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <div className="flex items-end gap-3 h-48">
                            {evolution.map((e, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    {/* Barre heures */}
                                    <div className="w-full flex flex-col items-center justify-end" style={{ height: '160px' }}>
                                        <div className="text-xs text-gray-400 mb-1 font-semibold">{e.heures > 0 ? `${e.heures}h` : ''}</div>
                                        <div
                                            className="w-full rounded-t-md bg-blue-500 transition-all duration-500"
                                            style={{ height: `${Math.round((e.heures / maxHeuresEvo) * 130)}px`, minHeight: e.heures > 0 ? '4px' : '0' }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-400 text-center leading-tight">{e.mois}</div>
                                </div>
                            ))}
                        </div>
                        {/* Légende */}
                        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-blue-500" />
                                Heures travaillées
                            </div>
                        </div>
                        {/* Tableau recap */}
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-xs text-gray-300">
                                <thead>
                                    <tr className="text-gray-500 border-b border-gray-700">
                                        <th className="text-left pb-2">Mois</th>
                                        <th className="text-center pb-2">Jours travaillés</th>
                                        <th className="text-center pb-2">Techniciens</th>
                                        <th className="text-center pb-2">Total heures</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {evolution.map((e, i) => (
                                        <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                            <td className="py-2 font-medium">{e.mois_full}</td>
                                            <td className="py-2 text-center">{e.jours}</td>
                                            <td className="py-2 text-center">{e.techniciens}</td>
                                            <td className="py-2 text-center text-blue-400 font-semibold">{e.heures}h</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* ===== TOP TECHNICIENS + CHANTIERS ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* TOP 5 TECHNICIENS */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            Top techniciens — {monthLabel} {year}
                        </h2>
                        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
                            {top_techniciens.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">Aucune donnée pour ce mois</p>
                            ) : top_techniciens.map((t, i) => (
                                <div key={t.id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-bold w-6 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-500'}`}>
                                                #{i + 1}
                                            </span>
                                            <div>
                                                <div className="text-sm font-semibold text-white">
                                                    {t.prenom} {t.nom}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">{t.specialite}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-blue-400">{t.heures}h</div>
                                            <div className="text-xs text-gray-500">{t.jours} j</div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-300' : i === 2 ? 'bg-orange-400' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.round((t.heures / maxHeuresTop) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* STATS PAR CHANTIER */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-400" />
                            Par chantier — {monthLabel} {year}
                        </h2>
                        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
                            {stats_chantiers.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">Aucune donnée pour ce mois</p>
                            ) : stats_chantiers.map((c, i) => (
                                <div key={c.id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div>
                                            <div className="text-sm font-semibold text-white">{c.nom}</div>
                                            <div className="text-xs text-gray-500">{c.reference} · {c.techniciens} tech · {c.jours} j</div>
                                        </div>
                                        <div className="text-sm font-bold text-green-400">{c.heures}h</div>
                                    </div>
                                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-green-500 transition-all duration-500"
                                            style={{ width: `${Math.round((c.heures / maxHeuresChan) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

            </div>
        </AppLayout>
    );
}
