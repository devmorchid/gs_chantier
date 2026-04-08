import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import { Users, Clock, UserCheck, UserX, Search, QrCode, BarChart3, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Technicien {
    id: number;
    nom: string;
    prenom: string;
    photo: string | null;
    specialite: string | null;
    specialite_label: string | null;
    qr_code: string | null;
    status_today: 'present' | 'en_cours' | 'absent';
    check_in_today: string | null;
    check_out_today: string | null;
    jours_present_mois: number;
    total_heures_mois: number;
}

interface Stats {
    total: number;
    presents: number;
    en_cours: number;
    absents: number;
}

interface PaginatedTechniciens {
    data: Technicien[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    techniciens: PaginatedTechniciens | Technicien[];
    today: string;
    month: number;
    year: number;
    stats: Stats;
    filters?: { search?: string; month?: number; year?: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pointages', href: '/pointages' },
    { title: 'Par Technicien', href: '/pointages/techniciens' },
];

const statusConfig = {
    present: { bg: 'bg-green-500', label: 'Présent' },
    en_cours: { bg: 'bg-yellow-500', label: 'En cours' },
    absent: { bg: 'bg-red-500', label: 'Absent' },
};

const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
];

export default function PointagesTechniciens({ techniciens, today, month, year, stats, filters }: Props) {
    const isPaginated = !Array.isArray(techniciens) && 'data' in techniciens;
    const techniciensList: Technicien[] = isPaginated ? (techniciens as PaginatedTechniciens).data : (techniciens as Technicien[]);
    const paginated = isPaginated ? (techniciens as PaginatedTechniciens) : null;

    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const handleMonthChange = (newMonth: string) => {
        router.get('/pointages/techniciens', { month: newMonth, year, search: searchQuery }, { preserveState: true, preserveScroll: true });
    };

    const handleYearChange = (newYear: string) => {
        router.get('/pointages/techniciens', { month, year: newYear, search: searchQuery }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        router.get('/pointages/techniciens', { month, year, search: value }, { preserveState: true, preserveScroll: true });
    };

    // Status filter is client-side on current page
    const filteredTechniciens = statusFilter === 'all'
        ? techniciensList
        : techniciensList.filter(t => t.status_today === statusFilter);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pointages par Technicien" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Pointages par Technicien</h1>
                        <p className="text-gray-500 mt-1">Date: {today}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/pointages/dashboard">
                            <Button variant="outline">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Dashboard Global
                            </Button>
                        </Link>
                        <Link href="/pointages/scanner">
                            <Button>
                                <QrCode className="mr-2 h-4 w-4" />
                                Scanner QR
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                            <p className="text-sm text-gray-500">Total Techniciens</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <UserCheck className="h-8 w-8 mx-auto text-green-500 mb-2" />
                            <p className="text-3xl font-bold text-green-600">{stats.presents}</p>
                            <p className="text-sm text-gray-500">Présents</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <Clock className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                            <p className="text-3xl font-bold text-yellow-600">{stats.en_cours}</p>
                            <p className="text-sm text-gray-500">En Cours</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <UserX className="h-8 w-8 mx-auto text-red-500 mb-2" />
                            <p className="text-3xl font-bold text-red-600">{stats.absents}</p>
                            <p className="text-sm text-gray-500">Absents</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex flex-wrap gap-4">
                            {/* Search */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Rechercher technicien..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous</SelectItem>
                                    <SelectItem value="present">Présents</SelectItem>
                                    <SelectItem value="en_cours">En cours</SelectItem>
                                    <SelectItem value="absent">Absents</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Month Filter */}
                            <Select value={month.toString()} onValueChange={handleMonthChange}>
                                <SelectTrigger className="w-[140px]">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => (
                                        <SelectItem key={m.value} value={m.value.toString()}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Year Filter */}
                            <Select value={year.toString()} onValueChange={handleYearChange}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Techniciens List */}
                {filteredTechniciens.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Aucun technicien trouvé
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTechniciens.map((technicien) => (
                            <Link
                                key={technicien.id}
                                href={`/technicien/${technicien.id}/pointages`}
                                className="block"
                            >
                                <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start gap-3">
                                            {/* Photo */}
                                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                {technicien.photo ? (
                                                    <img 
                                                        src={`/storage/${technicien.photo}`} 
                                                        alt={`${technicien.prenom} ${technicien.nom}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-lg font-bold text-gray-500">
                                                        {technicien.prenom[0]}{technicien.nom[0]}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">
                                                    {technicien.prenom} {technicien.nom}
                                                </CardTitle>
                                                <p className="text-xs text-gray-500">{technicien.specialite_label || 'Technicien'}</p>
                                            </div>
                                            
                                            <Badge className={statusConfig[technicien.status_today].bg}>
                                                {statusConfig[technicien.status_today].label}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Today's times */}
                                        {technicien.status_today !== 'absent' && (
                                            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Entrée:</span>
                                                    <span className="font-medium">{technicien.check_in_today || '-'}</span>
                                                </div>
                                                {technicien.check_out_today && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Sortie:</span>
                                                        <span className="font-medium">{technicien.check_out_today}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Month stats */}
                                        <div className="flex gap-4 pt-2 border-t">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm font-medium">{technicien.jours_present_mois}</span>
                                                <span className="text-xs text-gray-500">jours</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-green-500" />
                                                <span className="text-sm font-medium">{technicien.total_heures_mois}h</span>
                                                <span className="text-xs text-gray-500">ce mois</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {paginated && paginated.last_page > 1 && (
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-sm text-gray-500">
                            Page {paginated.current_page} / {paginated.last_page} — {paginated.total} techniciens
                        </p>
                        <div className="flex gap-1">
                            {paginated.links.map((link, i) => {
                                if (link.label === '&laquo; Previous') {
                                    return (
                                        <Link key={i} href={link.url ?? '#'} preserveScroll>
                                            <Button variant="outline" size="sm" disabled={!link.url}>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    );
                                }
                                if (link.label === 'Next &raquo;') {
                                    return (
                                        <Link key={i} href={link.url ?? '#'} preserveScroll>
                                            <Button variant="outline" size="sm" disabled={!link.url}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    );
                                }
                                return (
                                    <Link key={i} href={link.url ?? '#'} preserveScroll>
                                        <Button
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
