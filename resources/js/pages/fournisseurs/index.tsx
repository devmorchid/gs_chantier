import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Eye, Users, Building2 } from 'lucide-react';
import { useState } from 'react';

interface Fournisseur {
  id: number;
  type: 'personne' | 'societe';
  name: string;
  telephone?: string | null;
  email?: string | null;
  status: 'actif' | 'inactif';
  ville?: string | null;
  pays?: string | null;
}

interface Props {
  fournisseurs: {
    data: Fournisseur[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
  };
}

export default function FournisseursIndex({ fournisseurs }: Props) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [open, setOpen] = useState(false);

  const handleDelete = (id: number, label: string) => {
    setDeleteId(id);
    setDeleteLabel(label);
    setOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      router.delete(`/fournisseurs/${deleteId}`);
      setOpen(false);
      setDeleteId(null);
      setDeleteLabel('');
    }
  };

  return (
    <AppLayout>
      <Head title="Fournisseurs" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Fournisseurs</h1>
              <p className="text-muted-foreground">Gérez vos fournisseurs et leurs informations.</p>
            </div>
            <Button asChild>
              <Link href="/fournisseurs/create">
                <Plus className="mr-2 h-4 w-4" /> Nouveau fournisseur
              </Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Users className="h-4 w-4" />
                </span>
                Total
              </div>
              <p className="text-2xl font-semibold">{fournisseurs.total}</p>
              <p className="text-xs text-muted-foreground">Fournisseurs enregistrés</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Building2 className="h-4 w-4" />
                </span>
                Affichage
              </div>
              <p className="text-2xl font-semibold">{fournisseurs.from ?? 0}-{fournisseurs.to ?? 0}</p>
              <p className="text-xs text-muted-foreground">Éléments visibles</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Users className="h-4 w-4" />
                </span>
                Cette page
              </div>
              <p className="text-2xl font-semibold">{fournisseurs.data.length}</p>
              <p className="text-xs text-muted-foreground">Résultats affichés</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des fournisseurs</CardTitle>
            <p className="text-sm text-muted-foreground">Consultez et gérez vos fournisseurs.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Pays</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fournisseurs.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Aucun fournisseur trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fournisseurs.data.map((fournisseur) => (
                      <TableRow key={fournisseur.id}>
                        <TableCell>{fournisseur.name}</TableCell>
                        <TableCell>{fournisseur.type === 'societe' ? 'Société' : 'Personne'}</TableCell>
                        <TableCell>{fournisseur.telephone || '-'}</TableCell>
                        <TableCell>{fournisseur.email || '-'}</TableCell>
                        <TableCell>{fournisseur.ville || '-'}</TableCell>
                        <TableCell>{fournisseur.pays || '-'}</TableCell>
                        <TableCell>{fournisseur.status === 'actif' ? 'Actif' : 'Inactif'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/fournisseurs/${fournisseur.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/fournisseurs/${fournisseur.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => handleDelete(fournisseur.id, fournisseur.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {fournisseurs.last_page > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Affichage de {(fournisseurs.current_page - 1) * fournisseurs.per_page + 1} à{' '}
                  {Math.min(fournisseurs.current_page * fournisseurs.per_page, fournisseurs.total)} sur{' '}
                  {fournisseurs.total} fournisseurs
                </p>
                <div className="flex gap-2">
                  {fournisseurs.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? 'default' : 'outline'}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.get(link.url)}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Voulez-vous supprimer le fournisseur
              {deleteLabel ? ` (« ${deleteLabel} »)` : ''} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
