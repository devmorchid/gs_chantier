import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowDownCircle, ArrowUpCircle, Clock, XCircle, List } from 'lucide-react';

interface ChequeStats {
    a_encaisser: number;
    a_payer: number;
    en_attente: number;
    rejetes: number;
    total_encaisse_mois: number;
    total_decaisse_mois: number;
    montant_en_attente_encaissement: number;
    montant_en_attente_decaissement: number;
}

interface EcheanceCheque {
    id: number;
    cheque_number: string;
    bank_name: string;
    amount: number;
    direction: string;
    type_label: string;
    status: string;
    beneficiaire: string | null;
    due_date: string;
    jours_restants: number;
}

interface Props {
    stats: ChequeStats;
    echeances: EcheanceCheque[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chèques', href: '/cheques' },
    { title: 'Dashboard', href: '/cheques/dashboard' },
];

function formatMontant(val: number) {
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
}

export default function ChequesDashboard({ stats, echeances }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Chèques" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Dashboard Chèques</h1>
                    <Button variant="outline" onClick={() => router.get('/cheques')}>
                        <List className="h-4 w-4 mr-2" />
                        Suivi des chèques
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-green-800">À encaisser</CardTitle>
                            <ArrowDownCircle className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700">{stats.a_encaisser}</div>
                            <p className="text-xs text-green-600 mt-1">
                                {formatMontant(stats.montant_en_attente_encaissement)} MAD en attente
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 bg-red-50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-red-800">À payer</CardTitle>
                            <ArrowUpCircle className="h-5 w-5 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700">{stats.a_payer}</div>
                            <p className="text-xs text-red-600 mt-1">
                                {formatMontant(stats.montant_en_attente_decaissement)} MAD en attente
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-800">En attente</CardTitle>
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-700">{stats.en_attente}</div>
                            <p className="text-xs text-yellow-600 mt-1">chèques non traités</p>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 bg-gray-50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-800">Rejetés</CardTitle>
                            <XCircle className="h-5 w-5 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-700">{stats.rejetes}</div>
                            <p className="text-xs text-gray-600 mt-1">chèques rejetés</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total encaissé ce mois</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {formatMontant(stats.total_encaisse_mois)} MAD
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Total décaissé ce mois</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">
                                {formatMontant(stats.total_decaisse_mois)} MAD
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Echeances */}
                <Card>
                    <CardHeader>
                        <CardTitle>Échéances prochaines (7 jours)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>N° Chèque</TableHead>
                                    <TableHead>Banque</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Bénéficiaire</TableHead>
                                    <TableHead className="text-right">Montant</TableHead>
                                    <TableHead>Échéance</TableHead>
                                    <TableHead>Jours restants</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {echeances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                            Aucune échéance dans les 7 prochains jours
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    echeances.map((cheque) => (
                                        <TableRow key={cheque.id}>
                                            <TableCell className="font-mono">{cheque.cheque_number}</TableCell>
                                            <TableCell>{cheque.bank_name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {cheque.direction === 'encaissement' ? (
                                                        <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <ArrowUpCircle className="h-4 w-4 text-red-600" />
                                                    )}
                                                    <span className="text-sm">{cheque.type_label}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{cheque.beneficiaire || '—'}</TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatMontant(cheque.amount)} MAD
                                            </TableCell>
                                            <TableCell>{cheque.due_date}</TableCell>
                                            <TableCell>
                                                <Badge variant={cheque.jours_restants <= 1 ? 'destructive' : 'outline'}>
                                                    {cheque.jours_restants <= 0 ? "Aujourd'hui" : `${cheque.jours_restants} jour(s)`}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
