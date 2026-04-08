import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowDownCircle, ArrowUpCircle, AlertTriangle, Clock, ArrowLeft } from 'lucide-react';

interface AlerteCheque {
    id: number;
    cheque_number: string;
    bank_name: string;
    amount: number;
    direction: string;
    type_label: string;
    beneficiaire: string | null;
    motif: string | null;
    due_date: string;
    jours_restants: number;
    en_retard: boolean;
}

interface Props {
    cheques_a_encaisser: AlerteCheque[];
    cheques_a_payer: AlerteCheque[];
    total_alertes: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chèques', href: '/cheques' },
    { title: 'Alertes', href: '/cheques/notifications' },
];

function formatMontant(val: number) {
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
}

function EcheanceBadge({ jours, enRetard }: { jours: number; enRetard: boolean }) {
    if (enRetard) {
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> En retard</Badge>;
    }
    if (jours === 0) {
        return <Badge variant="destructive" className="gap-1"><Clock className="h-3 w-3" /> Aujourd'hui</Badge>;
    }
    if (jours === 1) {
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300 gap-1"><Clock className="h-3 w-3" /> Demain</Badge>;
    }
    if (jours <= 3) {
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">{jours} jours</Badge>;
    }
    return <Badge variant="outline">{jours} jours</Badge>;
}

function ChequeAlertTable({ cheques, emptyMessage }: { cheques: AlerteCheque[]; emptyMessage: string }) {
    if (cheques.length === 0) {
        return <p className="text-center py-8 text-muted-foreground">{emptyMessage}</p>;
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>N° Chèque</TableHead>
                    <TableHead>Banque</TableHead>
                    <TableHead>Bénéficiaire</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Délai</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {cheques.map((cheque) => (
                    <TableRow key={cheque.id} className={cheque.en_retard ? 'bg-red-50' : cheque.jours_restants <= 1 ? 'bg-orange-50' : ''}>
                        <TableCell className="font-mono font-medium">{cheque.cheque_number}</TableCell>
                        <TableCell>{cheque.bank_name}</TableCell>
                        <TableCell>{cheque.beneficiaire || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{cheque.motif || '—'}</TableCell>
                        <TableCell className="text-right font-semibold">{formatMontant(cheque.amount)} MAD</TableCell>
                        <TableCell>{cheque.due_date}</TableCell>
                        <TableCell>
                            <EcheanceBadge jours={cheque.jours_restants} enRetard={cheque.en_retard} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function ChequesNotifications({ cheques_a_encaisser, cheques_a_payer, total_alertes }: Props) {
    const totalEncaissement = cheques_a_encaisser.reduce((s, c) => s + Number(c.amount), 0);
    const totalDecaissement = cheques_a_payer.reduce((s, c) => s + Number(c.amount), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Alertes Chèques (${total_alertes})`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-7 w-7 text-orange-500" />
                        <div>
                            <h1 className="text-2xl font-bold">Alertes Chèques</h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                {total_alertes} chèque(s) arrivant à échéance ou en retard
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => router.get('/cheques')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au suivi
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-green-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <ArrowDownCircle className="h-5 w-5 text-green-600" />
                                Chèques à encaisser
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700">{cheques_a_encaisser.length} chèque(s)</div>
                            <p className="text-sm text-green-600">{formatMontant(totalEncaissement)} MAD à récupérer</p>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <ArrowUpCircle className="h-5 w-5 text-red-600" />
                                Chèques à payer
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700">{cheques_a_payer.length} chèque(s)</div>
                            <p className="text-sm text-red-600">{formatMontant(totalDecaissement)} MAD à débourser</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Chèques à encaisser */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowDownCircle className="h-5 w-5 text-green-600" />
                            Chèques reçus — à encaisser
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ChequeAlertTable
                            cheques={cheques_a_encaisser}
                            emptyMessage="Aucun chèque à encaisser dans les prochains jours"
                        />
                    </CardContent>
                </Card>

                {/* Chèques à payer */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowUpCircle className="h-5 w-5 text-red-600" />
                            Chèques émis — à payer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ChequeAlertTable
                            cheques={cheques_a_payer}
                            emptyMessage="Aucun chèque à payer dans les prochains jours"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
