import React from 'react';
import { Head } from '@inertiajs/react';

interface Technicien {
  id: number;
  nom: string;
  prenom: string;
  photo?: string;
  check_in?: string | null;
  check_out?: string | null;
  status: 'present' | 'en_cours' | 'absent';
}

interface Props {
  techniciens: Technicien[];
  date: string;
}

const statusColor = {
  present: 'text-green-500',
  en_cours: 'text-yellow-500',
  absent: 'text-red-500',
};
const statusLabel = {
  present: 'Présent',
  en_cours: 'En cours',
  absent: 'Absent',
};

export default function PointageToday({ techniciens, date }: Props) {
  return (
    <div className="p-8">
      <Head title="Présence du jour" />
      <h1 className="text-2xl font-bold mb-6">Présence du {date}</h1>
      <table className="min-w-full border text-xs bg-black text-white">
        <thead>
          <tr>
            <th className="border px-2 py-1">Technicien</th>
            <th className="border px-2 py-1">Photo</th>
            <th className="border px-2 py-1">Check-in</th>
            <th className="border px-2 py-1">Check-out</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {techniciens.map((tech) => (
            <tr key={tech.id}>
              <td className="border px-2 py-1 font-semibold">{tech.nom} {tech.prenom}</td>
              <td className="border px-2 py-1 text-center">
                {tech.photo ? (
                  <img src={tech.photo} alt={tech.nom} className="w-10 h-10 rounded-full object-cover mx-auto" />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="border px-2 py-1 text-center">{tech.check_in || '-'}</td>
              <td className="border px-2 py-1 text-center">{tech.check_out || '-'}</td>
              <td className={`border px-2 py-1 text-center font-bold ${statusColor[tech.status]}`}>{statusLabel[tech.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
