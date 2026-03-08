import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Head } from '@inertiajs/react';

interface ChequeStats {
  a_encaisser: number;
  a_payer: number;
  en_attente: number;
  total_encaissé_mois: number;
}

interface Props {
  stats: ChequeStats;
}

export default function ChequesDashboard({ stats }: Props) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Chèques', href: '/cheques/dashboard' }]}> 
      <Head title="Dashboard Chèques" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader>🟢 Chèques à encaisser</CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">{stats.a_encaisser}</CardContent>
        </Card>
        <Card>
          <CardHeader>🔴 Chèques à payer</CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">{stats.a_payer}</CardContent>
        </Card>
        <Card>
          <CardHeader>🟡 En attente</CardHeader>
          <CardContent className="text-2xl font-bold text-yellow-600">{stats.en_attente}</CardContent>
        </Card>
        <Card>
          <CardHeader>🔵 Total encaissé ce mois</CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">{stats.total_encaissé_mois} MAD</CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
