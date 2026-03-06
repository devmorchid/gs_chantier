import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StatistiquesClients({ stats }: { stats: any }) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Statistiques', href: '/statistiques' }, { title: 'Clients', href: '/statistiques/clients' }]}> 
      <Head title="Statistiques Clients" />
      <div className="flex flex-col gap-6 p-6">
        <button
          onClick={() => router.visit('/statistiques')}
          className="self-start mb-2 px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition"
        >
          ← Retour aux statistiques
        </button>
        <h1 className="text-2xl font-bold mb-4">Statistiques Clients</h1>
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-blue-700">{stats.total}</div>
          <div className="mt-2 text-sm text-blue-400">Total clients</div>
        </div>
        <div className="mt-8 w-full">
          <h2 className="text-lg font-semibold mb-2 text-center">Nouveaux clients par mois</h2>
          <Bar
            data={{
              labels: stats.labels || [],
              datasets: [
                {
                  label: 'Nouveaux clients',
                  data: stats.evolution || [],
                  backgroundColor: '#2563eb',
                },
              ],
            }}
            options={{
              plugins: {
                legend: { display: false },
              },
              scales: {
                x: {
                  title: { display: true, text: 'Mois', color: '#fff' },
                  ticks: { color: '#fff' },
                  grid: { color: 'rgba(255,255,255,0.1)' },
                },
                y: {
                  title: { display: true, text: 'Nombre', color: '#fff' },
                  ticks: { color: '#fff' },
                  grid: { color: 'rgba(255,255,255,0.1)' },
                },
              },
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
}
