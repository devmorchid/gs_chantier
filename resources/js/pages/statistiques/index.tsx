import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <form
          className="sticky top-0 z-10 mb-6 flex flex-wrap gap-4 items-end bg-background/95 py-3 px-2 rounded-lg shadow-sm border"
          style={{backdropFilter: 'blur(2px)'}}
          onSubmit={handleFilter}
        >
          <div className="w-[160px]">
            <label className="block text-sm font-medium mb-1">Année</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {[...Array(6)].map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <label className="block text-sm font-medium mb-1">Date début</label>
            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <div className="w-[180px]">
            <label className="block text-sm font-medium mb-1">Date fin</label>
            <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <button type="submit" className="btn btn-primary h-9 px-6">Filtrer</button>
          <button
            type="button"
            className="btn h-9 px-6 ml-2 border border-input bg-background text-foreground hover:bg-muted"
            onClick={() => {
              setMonth('all');
              setYear('all');
              setDateDebut('');
              setDateFin('');
              window.location.href = '/statistiques';
            }}
          >
            Réinitialiser
          </button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Chantiers</CardTitle>
            </CardHeader>
            <CardContent>
              <Pie data={{
                labels: ['En cours', 'Terminés', 'Annulés'],
                datasets: [{
                  data: [stats.chantiers.en_cours, stats.chantiers.termines, stats.chantiers.annules],
                  backgroundColor: ['#fbbf24', '#22c55e', '#ef4444'],
                }],
              }} />
              <div className="mt-4 text-center text-sm">Total: {stats.chantiers.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ventes (DH)</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={{
                labels: stats.labels,
                datasets: [{
                  label: 'Ventes',
                  data: stats.ventes.evolution,
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(37,99,235,0.2)',
                  fill: true,
                }],
              }} />
              <div className="mt-4 text-center text-sm">Total: {stats.ventes.total_montant.toLocaleString()} DH</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Achats (DH)</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={{
                labels: stats.labels,
                datasets: [{
                  label: 'Achats',
                  data: stats.achats.evolution,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16,185,129,0.2)',
                  fill: true,
                }],
              }} />
              <div className="mt-4 text-center text-sm">Total: {stats.achats.total_montant.toLocaleString()} DH</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Paiements reçus (DH)</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={{
                labels: ['Total paiements'],
                datasets: [{
                  label: 'Paiements',
                  data: [stats.paiements.total_montant],
                  backgroundColor: '#f59e42',
                }],
              }} />
              <div className="mt-4 text-center text-sm">Total: {stats.paiements.total_montant.toLocaleString()} DH</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">{stats.clients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
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
