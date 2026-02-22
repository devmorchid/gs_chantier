import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface CatalogService {
  id: number;
  name: string;
  active: boolean;
}

interface Props {
  services: {
    data: CatalogService[];
    current_page: number;
    last_page: number;
  };
}

export default function Index({ services }: Props) {
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<number|null>(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (service: CatalogService) => {
    setEditId(service.id);
    setEditName(service.name);
  };

  const handleUpdate = () => {
    if (editId) {
      router.put(`/catalog-services/${editId}`, { name: editName });
      setEditId(null);
      setEditName('');
    }
  };

  const handleAdd = () => {
    router.post('/catalog-services', { name });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Catalogue des services', href: '/catalog-services' }]}> 
      <Head title="Catalogue des services" />
      <div className="mb-4 flex gap-2">
        {editId ? (
          <>
            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nom du service" className="border rounded-lg px-3 py-2 bg-neutral-900 text-white focus:ring-2 focus:ring-blue-500" />
            <Button className="rounded-lg px-4 py-2 bg-blue-600 text-white font-semibold" onClick={handleUpdate}>Enregistrer</Button>
            <Button className="rounded-lg px-4 py-2 bg-gray-600 text-white font-semibold" onClick={() => { setEditId(null); setEditName(''); }}>Annuler</Button>
          </>
        ) : (
          <>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du service" className="border rounded-lg px-3 py-2 bg-neutral-900 text-white focus:ring-2 focus:ring-green-500" />
            <Button className="rounded-lg px-4 py-2 bg-green-600 text-white font-semibold" onClick={handleAdd}>Ajouter</Button>
          </>
        )}
      </div>
      <table className="w-full border border-neutral-700 rounded-lg overflow-hidden shadow-lg">
        <thead className="bg-neutral-800 text-white">
          <tr>
            <th className="py-2 px-4 text-left">ID</th>
            <th className="py-2 px-4 text-left">Nom</th>
            <th className="py-2 px-4 text-left">Statut</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-neutral-900 text-white">
          {services.data.map(service => (
            <tr key={service.id} className="border-b border-neutral-700 hover:bg-neutral-800 transition">
              <td className="py-2 px-4">{service.id}</td>
              <td className="py-2 px-4 font-semibold">
                {editId === service.id ? (
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="border rounded-lg px-2 py-1 bg-neutral-800 text-white focus:ring-2 focus:ring-blue-500" />
                ) : (
                  service.name
                )}
              </td>
              <td className="py-2 px-4">
                <Badge className={service.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>{service.active ? 'Actif' : 'Désactivé'}</Badge>
              </td>
              <td className="py-2 px-4 flex gap-2">
                <Button className="rounded-lg bg-blue-600 text-white px-3 py-1" onClick={() => handleEdit(service)}>Modifier</Button>
                <Button className={service.active ? 'rounded-lg bg-yellow-500 text-black px-3 py-1' : 'rounded-lg bg-green-500 text-white px-3 py-1'} onClick={() => router.post(`/catalog-services/${service.id}/toggle-active`)}>{service.active ? 'Désactiver' : 'Activer'}</Button>
                <Button className="rounded-lg bg-red-500 text-white px-3 py-1" onClick={() => router.delete(`/catalog-services/${service.id}`)}>Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppLayout>
  );
}
