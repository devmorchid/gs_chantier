import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Affectation {
  id: number;
  chantier: { id: number; nom: string };
}

interface Props {
  affectations: Affectation[];
}

export default function TechnicienPointage({ affectations }: Props) {
  const [form, setForm] = useState({ chantier_id: '', latitude: '', longitude: '', check_in: '', photo_path: '' });

  return (
    <AppLayout breadcrumbs={[{ title: 'Mon Pointage', href: '/mon-pointage' }]}> 
      <Head title="Mon Pointage" />
      <h1 className="text-2xl font-bold mb-4">Mon Pointage</h1>
      <form onSubmit={e => { e.preventDefault(); router.post('/mon-pointage', form); }} className="flex flex-wrap gap-2 mb-8">
        <select value={form.chantier_id} onChange={e => setForm(f => ({ ...f, chantier_id: e.target.value }))} className="border rounded px-2 py-1">
          <option value="">-- Sélectionner chantier --</option>
          {affectations.map(a => <option key={a.id} value={a.chantier.id}>{a.chantier.nom}</option>)}
        </select>
        <input type="text" placeholder="Latitude" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} className="border rounded px-2 py-1" />
        <input type="text" placeholder="Longitude" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} className="border rounded px-2 py-1" />
        <input type="time" placeholder="Check-in" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} className="border rounded px-2 py-1" />
        <input type="text" placeholder="Photo (URL)" value={form.photo_path} onChange={e => setForm(f => ({ ...f, photo_path: e.target.value }))} className="border rounded px-2 py-1" />
        <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">Pointer</button>
      </form>
      <div className="text-gray-500 text-sm">Seuls les chantiers où tu es affecté s'affichent ici.</div>
    </AppLayout>
  );
}
