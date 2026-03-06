import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';
import { HardHat, Users, Clock, QrCode, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

interface Chantier {
    id: number;
    nom: string;
    reference: string;
    adresse: string;
    client_nom: string | null;
    statut: string;
    statut_label: string;
    presents_today: number;
    en_cours_today: number;
}

interface Stats {
    total_presents: number;
    total_en_cours: number;
    sans_chantier_presents: number;
    sans_chantier_en_cours: number;
}

interface PaginatedChantiers {
    data: Chantier[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    chantiers: PaginatedChantiers | Chantier[];
    today: string;
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pointages', href: '/pointages' },
];

const statutColors: Record<string, string> = {
    en_attente: 'bg-yellow-500',
    en_cours: 'bg-blue-500',
    termine: 'bg-green-500',
    annule: 'bg-red-500',
};

export default function PointagesIndex({ chantiers, today, stats }: Props) {
    const isPaginated = !Array.isArray(chantiers) && 'data' in chantiers;
    const chantiersList: Chantier[] = isPaginated ? (chantiers as PaginatedChantiers).data : (chantiers as Chantier[]);
    const paginated = isPaginated ? (chantiers as PaginatedChantiers) : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pointages par Chantier" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Pointages par Chantier</h1>
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
                            <p className="text-3xl font-bold text-green-600">{stats.total_presents}</p>
                            <p className="text-sm text-gray-500">Total Présents</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <p className="text-3xl font-bold text-yellow-600">{stats.total_en_cours}</p>
                            <p className="text-sm text-gray-500">En Cours</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <p className="text-3xl font-bold text-orange-600">{stats.sans_chantier_presents}</p>
                            <p className="text-sm text-gray-500">Sans Chantier</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">{paginated ? paginated.total : chantiersList.length}</p>
                            <p className="text-sm text-gray-500">Chantiers Actifs</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Liste des chantiers */}
                {chantiersList.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Aucun chantier en cours
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chantiersList.map((chantier) => (
                            <Link
                                key={chantier.id}
                                href={`/chantier/${chantier.id}/pointages`}
                                className="block"
                            >
                                <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <HardHat className="h-5 w-5 text-primary" />
                                                {chantier.nom}
                                            </CardTitle>
                                            <Badge className={statutColors[chantier.statut] || 'bg-gray-500'}>
                                                {chantier.statut_label}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-500">{chantier.reference}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-3 truncate">
                                            {chantier.adresse}
                                        </p>
                                        {chantier.client_nom && (
                                            <p className="text-xs text-gray-500 mb-3">
                                                Client: {chantier.client_nom}
                                            </p>
                                        )}
                                        <div className="flex gap-4 pt-2 border-t">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-4 w-4 text-green-500" />
                                                <span className="text-sm font-medium">{chantier.presents_today}</span>
                                                <span className="text-xs text-gray-500">présents</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-yellow-500" />
                                                <span className="text-sm font-medium">{chantier.en_cours_today}</span>
                                                <span className="text-xs text-gray-500">en cours</span>
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
                            Page {paginated.current_page} / {paginated.last_page} — {paginated.total} chantiers
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
