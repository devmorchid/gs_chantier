import React from 'react';
import { Head } from '@inertiajs/react';

interface TechnicienPresence {
  id: number;
  nom: string;
  prenom: string;
  salaire_journalier: number;
  presence: Record<number, boolean>;
  days_present: number;
  total: number;
}

interface Props {
  mois: number;
  annee: number;
  daysInMonth: number;
  techniciens: TechnicienPresence[];
}

export default function PointageMois({ mois, annee, daysInMonth, techniciens }: Props) {
  return (
    <div className="p-8">
      <Head title="Pointage mensuel techniciens" />
      <h1 className="text-2xl font-bold mb-6">Pointage mensuel des techniciens</h1>
      <table className="min-w-full border text-xs">
        <thead>
          <tr>
            <th className="border px-2 py-1">Technicien</th>
            {[...Array(daysInMonth)].map((_, i) => (
              <th key={i} className="border px-1 py-1 text-center">{i + 1}</th>
            ))}
            <th className="border px-2 py-1">Présences</th>
          </tr>
        </thead>
        <tbody>
          {techniciens.map((tech) => (
            <tr key={tech.id}>
              <td className="border px-2 py-1 font-semibold">{tech.nom} {tech.prenom}</td>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <td key={i} className="border text-center">
                  {tech.presence[i + 1] ? '✔️' : ''}
                </td>
              ))}
              <td className="border text-center font-bold">{tech.days_present}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
