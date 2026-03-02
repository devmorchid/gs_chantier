import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Line } from 'react-chartjs-2';
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const mois_fr = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function StatistiquesVentes({ stats, filters = {} }: { stats: any, filters?: any }) {

  const [mode, setMode] = React.useState(filters.mode || 'mois');
  const [year, setYear] = React.useState(filters.year || currentYear);
  const [month, setMonth] = React.useState(filters.month || currentMonth);
  const [dateDebut, setDateDebut] = React.useState(filters.date_debut || '');
  const [dateFin, setDateFin] = React.useState(filters.date_fin || '');

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/statistiques/ventes', { mode, year, month, date_debut: dateDebut, date_fin: dateFin }, { preserveState: true });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Statistiques', href: '/statistiques' }, { title: 'Ventes', href: '/statistiques/ventes' }]}> 
      <Head title="Statistiques Ventes" />
      <div className="flex flex-col gap-6 p-6">
        <button
          onClick={() => router.visit('/statistiques')}
          className="self-start mb-2 px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition"
        >
          ← Retour aux statistiques
        </button>
        <h1 className="text-2xl font-bold mb-4">Statistiques Ventes</h1>
        <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end mb-4">
          <div>
            <label className="block text-sm text-white mb-1">Date début</label>
            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="rounded p-2 bg-zinc-800 text-white" />
          </div>
          <div>
            <label className="block text-sm text-white mb-1">Date fin</label>
            <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="rounded p-2 bg-zinc-800 text-white" />
          </div>
          <div>
            <label className="block text-sm text-white mb-1">Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)} className="rounded p-2 bg-zinc-800 text-white">
              <option value="mois">Par mois</option>
              <option value="annee">Par année</option>
              <option value="jour">Mois spécifique</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white mb-1">Année</label>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="rounded p-2 bg-zinc-800 text-white w-24" min="2000" max={currentYear} />
          </div>
          {(mode === 'mois' || mode === 'jour') && (
            <div>
              <label className="block text-sm text-white mb-1">Mois</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))} className="rounded p-2 bg-zinc-800 text-white">
                {mois_fr.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-600 transition">Filtrer</button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-zinc-900 rounded-lg shadow p-6 flex flex-col items-center border border-blue-700">
            <div className="text-4xl font-bold text-blue-500">{stats.total_montant?.toLocaleString()} DH</div>
            <div className="mt-2 text-sm text-blue-300">Total ventes</div>
          </div>
          <div className="bg-zinc-900 rounded-lg shadow p-6 flex flex-col items-center border border-green-600">
            <div className="text-4xl font-bold text-green-400">{stats.total}</div>
            <div className="mt-2 text-sm text-green-200">Nombre de ventes</div>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-lg shadow p-6 mt-8 w-full">
          <h2 className="text-lg font-semibold mb-2 text-center text-white">Évolution des ventes</h2>
          <Line
            data={{
              labels: stats.labels || [],
              datasets: [
                {
                  label: 'Ventes',
                  data: stats.evolution || [],
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(37,99,235,0.2)',
                  fill: true,
                },
              ],
            }}
            options={{
              plugins: {
                legend: { display: false },
              },
              scales: {
                x: { title: { display: true, text: mode === 'jour' ? 'Jour' : (mode === 'annee' ? 'Année' : 'Mois'), color: '#fff' }, ticks: { color: '#fff' } },
                y: { title: { display: true, text: 'Montant (DH)', color: '#fff' }, ticks: { color: '#fff' } },
              },
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
}
