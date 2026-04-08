import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Pointage {
    technicien_id: number;
    nom: string;
    prenom: string;
    photo?: string;
    check_in?: string;
    check_out?: string;
    status: 'present' | 'en_cours' | 'absent';
}

interface PaginatedPointages {
    data: Pointage[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    per_page: number;
}

interface Props {
    today: string;
    stats: {
        total: number;
        presents: number;
        absents: number;
        en_cours: number;
    };
    pointages: PaginatedPointages | Pointage[];
}

const statusBadge = {
    present: { bg: 'bg-green-500', label: 'Présent' },
    en_cours: { bg: 'bg-yellow-500', label: 'En cours' },
    absent: { bg: 'bg-red-500', label: 'Absent' },
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pointage', href: '/pointages/dashboard' },
];

export default function PointageDashboard({ today, stats, pointages }: Props) {
    const isPaginated = !Array.isArray(pointages) && 'data' in pointages;
    const pointagesList: Pointage[] = isPaginated ? (pointages as PaginatedPointages).data : (pointages as Pointage[]);
    const paginated = isPaginated ? (pointages as PaginatedPointages) : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Pointage" />
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Pointage du {today}</h1>

                {/* Cards Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-900 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">Total Techniciens</div>
                        <div className="text-3xl font-bold">{stats.total}</div>
                    </div>
                    <div className="bg-green-900 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">Présents</div>
                        <div className="text-3xl font-bold">{stats.presents}</div>
                    </div>
                    <div className="bg-yellow-900 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">En cours</div>
                        <div className="text-3xl font-bold">{stats.en_cours}</div>
                    </div>
                    <div className="bg-red-900 p-4 rounded-lg">
                        <div className="text-sm text-gray-400">Absents</div>
                        <div className="text-3xl font-bold">{stats.absents}</div>
                    </div>
                </div>

                {/* Tableau */}
                <div className="rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="border-b border-gray-700 p-3 text-left">Photo</th>
                                <th className="border-b border-gray-700 p-3 text-left">Nom</th>
                                <th className="border-b border-gray-700 p-3 text-center">Check-in</th>
                                <th className="border-b border-gray-700 p-3 text-center">Check-out</th>
                                <th className="border-b border-gray-700 p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pointagesList.map((p) => (
                                <tr key={p.technicien_id} className="hover:bg-gray-800/50">
                                    <td className="border-b border-gray-700 p-3">
                                        {p.photo ? (
                                            <img src={p.photo} alt={p.nom} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="border-b border-gray-700 p-3">
                                        {p.prenom} {p.nom}
                                    </td>
                                    <td className="border-b border-gray-700 p-3 text-center">{p.check_in || '-'}</td>
                                    <td className="border-b border-gray-700 p-3 text-center">{p.check_out || '-'}</td>
                                    <td className="border-b border-gray-700 p-3 text-center">
                                        <span className={`${statusBadge[p.status].bg} px-2 py-1 rounded text-white text-xs font-bold`}>
                                            {statusBadge[p.status].label}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {paginated && paginated.last_page > 1 && (
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-sm text-gray-400">
                            {paginated.from ?? 0}-{paginated.to ?? 0} sur {paginated.total} techniciens
                        </p>
                        <div className="flex gap-2">
                            {paginated.current_page > 1 && (
                                <Link href={`/pointages/dashboard?page=${paginated.current_page - 1}`} preserveScroll>
                                    <button className="flex items-center gap-1 px-3 py-1 rounded border border-gray-600 text-sm hover:bg-gray-800">
                                        <ChevronLeft className="h-4 w-4" /> Précédent
                                    </button>
                                </Link>
                            )}
                            <span className="px-3 py-1 text-sm text-gray-400">
                                Page {paginated.current_page} / {paginated.last_page}
                            </span>
                            {paginated.current_page < paginated.last_page && (
                                <Link href={`/pointages/dashboard?page=${paginated.current_page + 1}`} preserveScroll>
                                    <button className="flex items-center gap-1 px-3 py-1 rounded border border-gray-600 text-sm hover:bg-gray-800">
                                        Suivant <ChevronRight className="h-4 w-4" />
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
