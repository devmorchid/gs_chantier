import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

import { router } from '@inertiajs/react';

export default function StatistiquesChantiers({ stats }: { stats: any }) {
  // Replace 'any' with a proper type for stats if available
  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Statistiques', href: '/statistiques' }, { title: 'Chantiers', href: '/statistiques/chantiers' }]}> 
      <Head title="Statistiques Chantiers" />
      <div className="flex flex-col gap-6 p-6">
        <button
          onClick={() => router.visit('/statistiques')}
          className="self-start mb-2 px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition"
        >
          ← Retour aux statistiques
        </button>
        <h1 className="text-2xl font-bold mb-4">Statistiques Chantiers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-zinc-900 rounded-lg shadow p-6 flex flex-col items-center border border-blue-700">
            <div className="text-4xl font-bold text-blue-500">{stats.total}</div>
            <div className="mt-2 text-sm text-blue-300">Total chantiers</div>
          </div>
          <div className="bg-zinc-900 rounded-lg shadow p-6 flex flex-col items-center border border-yellow-500">
            <div className="text-4xl font-bold text-yellow-400">{stats.en_cours}</div>
            <div className="mt-2 text-sm text-yellow-200">En cours</div>
          </div>
          <div className="bg-zinc-900 rounded-lg shadow p-6 flex flex-col items-center border border-green-600">
            <div className="text-4xl font-bold text-green-400">{stats.termines}</div>
            <div className="mt-2 text-sm text-green-200">Terminés</div>
          </div>
          <div className="bg-zinc-900 rounded-lg shadow p-6 flex flex-col items-center border border-red-500">
            <div className="text-4xl font-bold text-red-400">{stats.annules}</div>
            <div className="mt-2 text-sm text-red-200">Annulés</div>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-lg shadow p-6 mt-8 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2 text-center">Répartition des chantiers</h2>
          <Pie
            data={{
              labels: ['En cours', 'Terminés', 'Annulés'],
              datasets: [
                {
                  data: [stats.en_cours, stats.termines, stats.annules],
                  backgroundColor: ['#fbbf24', '#22c55e', '#ef4444'],
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              plugins: {
                legend: { display: true, position: 'bottom' },
              },
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
}
