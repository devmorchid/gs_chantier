import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Technicien {
  id: number;
  nom: string;
  prenom: string;
}

interface Attendance {
  id: number;
  technicien: Technicien;
  check_in: string;
  check_out?: string;
  latitude?: number;
  longitude?: number;
  photo_path?: string;
  status: string;
}

interface Props {
  chantier: { id: number; nom: string };
  attendances: Attendance[];
}

export default function AttendancesIndex({ chantier, attendances }: Props) {
  const [form, setForm] = useState({ technicien_id: '', latitude: '', longitude: '', check_in: '', photo_path: '' });

  return (
    <AppLayout breadcrumbs={[{ title: 'Chantiers', href: '/chantiers' }, { title: chantier.nom, href: `/chantiers/${chantier.id}` }, { title: 'Pointage', href: '#' }]}> 
      <Head title={`Pointage - ${chantier.nom}`} />
      <h1 className="text-2xl font-bold mb-4">Pointage Technicien</h1>
      <form onSubmit={e => { e.preventDefault(); router.post(`/chantiers/${chantier.id}/attendances`, form); }} className="flex flex-wrap gap-2 mb-8">
        <input type="number" placeholder="ID Technicien" value={form.technicien_id} onChange={e => setForm(f => ({ ...f, technicien_id: e.target.value }))} className="border rounded px-2 py-1" />
        <input type="text" placeholder="Latitude" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} className="border rounded px-2 py-1" />
        <input type="text" placeholder="Longitude" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} className="border rounded px-2 py-1" />
        <input type="time" placeholder="Check-in" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} className="border rounded px-2 py-1" />
        <input type="text" placeholder="Photo (URL)" value={form.photo_path} onChange={e => setForm(f => ({ ...f, photo_path: e.target.value }))} className="border rounded px-2 py-1" />
        <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">Enregistrer</button>
      </form>
      <h2 className="text-xl font-semibold mb-2">Présences aujourd'hui</h2>
      <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">Technicien</th>
            <th className="px-4 py-2">Check-in</th>
            <th className="px-4 py-2">Check-out</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Photo</th>
          </tr>
        </thead>
        <tbody>
          {attendances.map(a => (
            <tr key={a.id}>
              <td className="px-4 py-2">{a.technicien.nom} {a.technicien.prenom}</td>
              <td className="px-4 py-2">{a.check_in}</td>
              <td className="px-4 py-2">{a.check_out || '-'}</td>
              <td className="px-4 py-2">{a.status}</td>
              <td className="px-4 py-2">{a.photo_path ? <img src={a.photo_path} alt="Selfie" className="w-10 h-10 rounded-full" /> : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppLayout>
  );
}
