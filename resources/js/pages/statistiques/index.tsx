import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import {
  Building2,
  ShoppingCart,
  Receipt,
  CreditCard,
  Users,
  Truck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);
ChartJS.register(Filler);

interface StatistiquesData {
  chantiers: { total: number; en_cours: number; termines: number; annules: number };
  ventes: { total: number; total_montant: number; evolution: number[] };
  achats: { total: number; total_montant: number; evolution: number[] };
  paiements: { total: number; total_montant: number };
  clients: number;
  fournisseurs: number;
  labels: string[];
}

export default function StatistiquesIndex({ stats, filters }: { stats: StatistiquesData, filters: any }) {
  const [month, setMonth] = useState(filters?.month || '');
  const [year, setYear] = useState(filters?.year || '');
  const [dateDebut, setDateDebut] = useState(filters?.date_debut || '');
  const [dateFin, setDateFin] = useState(filters?.date_fin || '');

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    if (dateDebut) params.append('date_debut', dateDebut);
    if (dateFin) params.append('date_fin', dateFin);
    window.location.href = `/statistiques?${params.toString()}`;
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Statistiques', href: '/statistiques' }]}> 
      <Head title="Statistiques" />
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold">Statistiques globales</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.get('/statistiques/chantiers')}>
            <CardHeader className="flex flex-row items-center gap-2">
              <Icon iconNode={Building2} className="w-6 h-6 text-blue-700 mr-2" />
              <CardTitle>Chantiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center text-blue-700">{stats.chantiers.total}</div>
              <div className="flex justify-center gap-4 mt-2 text-sm">
                <span className="text-yellow-500">En cours: {stats.chantiers.en_cours}</span>
                <span className="text-green-600">Terminés: {stats.chantiers.termines}</span>
                <span className="text-red-500">Annulés: {stats.chantiers.annules}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.get('/statistiques/ventes')}>
            <CardHeader className="flex flex-row items-center gap-2">
              <Icon iconNode={ShoppingCart} className="w-6 h-6 text-blue-700 mr-2" />
              <CardTitle>Ventes (DH)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center text-blue-700">{stats.ventes.total_montant.toLocaleString()} DH</div>
              <div className="text-center text-sm mt-2">Nombre: {stats.ventes.total}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.get('/statistiques/achats')}>
            <CardHeader className="flex flex-row items-center gap-2">
              <Icon iconNode={Receipt} className="w-6 h-6 text-green-700 mr-2" />
              <CardTitle>Achats (DH)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center text-green-700">{stats.achats.total_montant.toLocaleString()} DH</div>
              <div className="text-center text-sm mt-2">Nombre: {stats.achats.total}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.get('/statistiques/paiements')}>
            <CardHeader className="flex flex-row items-center gap-2">
              <Icon iconNode={CreditCard} className="w-6 h-6 text-orange-600 mr-2" />
              <CardTitle>Paiements reçus (DH)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center text-orange-600">{stats.paiements.total_montant.toLocaleString()} DH</div>
              <div className="text-center text-sm mt-2">Nombre: {stats.paiements.total}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.get('/statistiques/clients')}>
            <CardHeader className="flex flex-row items-center gap-2">
              <Icon iconNode={Users} className="w-6 h-6 text-blue-700 mr-2" />
              <CardTitle>Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">{stats.clients}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.get('/statistiques/fournisseurs')}>
            <CardHeader className="flex flex-row items-center gap-2">
              <Icon iconNode={Truck} className="w-6 h-6 text-blue-700 mr-2" />
              <CardTitle>Fournisseurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">{stats.fournisseurs}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
