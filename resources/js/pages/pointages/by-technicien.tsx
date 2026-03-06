import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Download, FileText, Pencil, X, Check } from 'lucide-react';

interface Technicien {
    id: number;
    nom: string;
    prenom: string;
    photo?: string;
    specialite?: string;
}

interface Pointage {
    id: number;
    date: string;
    date_raw: string;
    day_name: string;
    check_in?: string;
    check_in_raw?: string;
    check_out?: string;
    check_out_raw?: string;
    duration?: number;
    status: 'present' | 'en_cours' | 'absent';
}

interface Props {
    technicien: Technicien;
    month: number;
    year: number;
    stats: {
        total_days: number;
        total_hours: number;
    };
    pointages: Pointage[];
}

const statusBadge = {
    present: { bg: 'bg-green-500', label: 'Présent' },
    en_cours: { bg: 'bg-yellow-500', label: 'En cours' },
    absent: { bg: 'bg-red-500', label: 'Absent' },
};

export default function PointageByTechnicien({ technicien, month, year, stats, pointages }: Props) {
    const { auth } = usePage<{ auth: { user: { roles: string[] } } }>().props;
    const isAdmin = auth?.user?.roles?.includes('admin');

    const [selectedMonth, setSelectedMonth] = useState(month);
    const [selectedYear, setSelectedYear] = useState(year);

    // Modal state
    const [editingPointage, setEditingPointage] = useState<Pointage | null>(null);
    const [form, setForm] = useState({ date: '', check_in: '', check_out: '' });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFilterChange = (newMonth: number, newYear: number) => {
        router.get(`/technicien/${technicien.id}/pointages`, {
            month: newMonth,
            year: newYear,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleMonthChange = (newMonth: number) => {
        setSelectedMonth(newMonth);
        handleFilterChange(newMonth, selectedYear);
    };

    const handleYearChange = (newYear: number) => {
        setSelectedYear(newYear);
        handleFilterChange(selectedMonth, newYear);
    };

    const openEdit = (p: Pointage) => {
        setEditingPointage(p);
        setForm({
            date: p.date_raw,
            check_in: p.check_in_raw ?? '',
            check_out: p.check_out_raw ?? '',
        });
        setErrors({});
    };

    const closeEdit = () => {
        setEditingPointage(null);
        setErrors({});
    };

    const handleSave = () => {
        if (!editingPointage) return;
        setSaving(true);
        setErrors({});
        router.put(`/pointages/${editingPointage.id}/update`, form, {
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
                setEditingPointage(null);
            },
            onError: (errs) => {
                setSaving(false);
                setErrors(errs);
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pointage', href: '/pointages/dashboard' },
        { title: `${technicien.prenom} ${technicien.nom}`, href: `/technicien/${technicien.id}/pointages` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pointages - ${technicien.prenom} ${technicien.nom}`} />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    {technicien.photo && (
                        <img src={technicien.photo} alt={technicien.nom} className="w-16 h-16 rounded-full object-cover" />
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">{technicien.prenom} {technicien.nom}</h1>
                        <p className="text-gray-400 mt-1">{technicien.specialite || 'Technicien'}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-900 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">Jours Travaillés</div>
                        <div className="text-3xl font-bold">{stats.total_days}</div>
                    </div>
                    <div className="bg-green-900 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">Total Heures</div>
                        <div className="text-3xl font-bold">{stats.total_hours.toFixed(1)}h</div>
                    </div>
                </div>

                {/* Filters + Export */}
                <div className="flex gap-4 items-center flex-wrap">
                    <select
                        value={selectedMonth}
                        onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                            <option key={m} value={m}>
                                {new Date(selectedYear, m - 1).toLocaleString('fr-FR', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => handleYearChange(parseInt(e.target.value))}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                        {[2024, 2025, 2026, 2027].map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    {/* Export Buttons */}
                    <div className="flex gap-2 ml-auto">
                        <a
                            href={`/technicien/${technicien.id}/pointages/pdf?month=${selectedMonth}&year=${selectedYear}`}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            Exporter PDF
                        </a>
                        <a
                            href={`/technicien/${technicien.id}/pointages/export?month=${selectedMonth}&year=${selectedYear}`}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Exporter Excel
                        </a>
                    </div>
                </div>

                {/* Tableau */}
                <div className="rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="border-b border-gray-700 p-3 text-left">Date</th>
                                <th className="border-b border-gray-700 p-3 text-left">Jour</th>
                                <th className="border-b border-gray-700 p-3 text-center">Check-in</th>
                                <th className="border-b border-gray-700 p-3 text-center">Check-out</th>
                                <th className="border-b border-gray-700 p-3 text-center">Durée (h)</th>
                                <th className="border-b border-gray-700 p-3 text-center">Status</th>
                                {isAdmin && (
                                    <th className="border-b border-gray-700 p-3 text-center">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {pointages.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-800/50">
                                    <td className="border-b border-gray-700 p-3">{p.date}</td>
                                    <td className="border-b border-gray-700 p-3">{p.day_name}</td>
                                    <td className="border-b border-gray-700 p-3 text-center">{p.check_in || '-'}</td>
                                    <td className="border-b border-gray-700 p-3 text-center">{p.check_out || '-'}</td>
                                    <td className="border-b border-gray-700 p-3 text-center">
                                        {p.duration ? p.duration.toFixed(1) : '-'}
                                    </td>
                                    <td className="border-b border-gray-700 p-3 text-center">
                                        <span className={`${statusBadge[p.status].bg} px-2 py-1 rounded text-white text-xs font-bold`}>
                                            {statusBadge[p.status].label}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="border-b border-gray-700 p-3 text-center">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                                                title="Modifier ce pointage"
                                            >
                                                <Pencil className="w-3 h-3" />
                                                Modifier
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {pointages.length === 0 && (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6} className="border-b border-gray-700 p-4 text-center text-gray-400">
                                        Aucun pointage pour cette période
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========== MODAL EDIT POINTAGE (Admin only) ========== */}
            {isAdmin && editingPointage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4">
                        {/* Header modal */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                            <div>
                                <h2 className="text-lg font-bold text-white">Modifier le pointage</h2>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {editingPointage.day_name} {editingPointage.date}
                                </p>
                            </div>
                            <button onClick={closeEdit} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body modal */}
                        <div className="px-6 py-5 space-y-4">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                                />
                                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
                            </div>

                            {/* Check-in */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Check-in</label>
                                <input
                                    type="time"
                                    value={form.check_in}
                                    onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                                />
                                {errors.check_in && <p className="text-red-400 text-xs mt-1">{errors.check_in}</p>}
                            </div>

                            {/* Check-out */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Check-out <span className="text-gray-500 text-xs">(optionnel)</span>
                                </label>
                                <input
                                    type="time"
                                    value={form.check_out}
                                    onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                                />
                                {errors.check_out && <p className="text-red-400 text-xs mt-1">{errors.check_out}</p>}
                            </div>
                        </div>

                        {/* Footer modal */}
                        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-700">
                            <button
                                onClick={closeEdit}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
