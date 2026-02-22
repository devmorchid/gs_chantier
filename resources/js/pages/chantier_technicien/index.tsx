import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Technicien {
  id: number;
  nom: string;
  prenom: string;
}

interface Affectation {
  id: number;
  technicien: Technicien;
  date_affectation: string;
  date_fin?: string;
  actif: boolean;
}

interface Props {
  chantier: { id: number; nom: string };
  affectations: Affectation[];
  techniciens: Technicien[];
}

export default function ChantierTechnicienIndex({ chantier, affectations, techniciens }: Props) {
  const [form, setForm] = useState({ technicien_id: '', date_affectation: '' });

  return (
    <AppLayout breadcrumbs={[{ title: 'Chantiers', href: '/chantiers' }, { title: chantier.nom, href: `/chantiers/${chantier.id}` }, { title: 'Affectations', href: '#' }]}> 
      <Head title={`Affectation Techniciens - ${chantier.nom}`} />
      <h1 className="text-2xl font-bold mb-4">Affecter un technicien</h1>
      <form onSubmit={e => { e.preventDefault(); router.post(`/chantiers/${chantier.id}/affectations`, form); }} className="flex gap-2 mb-8">
        <select value={form.technicien_id} onChange={e => setForm(f => ({ ...f, technicien_id: e.target.value }))} className="border rounded px-2 py-1">
          <option value="">-- Technicien --</option>
          {techniciens.map(t => <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>)}
        </select>
        <input type="date" value={form.date_affectation} onChange={e => setForm(f => ({ ...f, date_affectation: e.target.value }))} className="border rounded px-2 py-1" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Affecter</button>
      </form>
      <h2 className="text-xl font-semibold mb-2">Affectations en cours</h2>
      <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">Technicien</th>
            <th className="px-4 py-2">Date début</th>
            <th className="px-4 py-2">Date fin</th>
            <th className="px-4 py-2">Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {affectations.map(a => (
            <tr key={a.id} className={a.actif ? '' : 'opacity-60'}>
              <td className="px-4 py-2">{a.technicien.nom} {a.technicien.prenom}</td>
              <td className="px-4 py-2">{a.date_affectation}</td>
              <td className="px-4 py-2">{a.date_fin || '-'}</td>
              <td className="px-4 py-2">{a.actif ? 'Actif' : 'Terminé'}</td>
              <td className="px-4 py-2">
                {a.actif && <button onClick={() => router.post(`/affectations/${a.id}/finish`)} className="text-red-600">Terminer</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppLayout>
  );
}
