import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Category {
  id: number;
  name: string;
  description?: string | null;
  produits_count?: number;
}

interface Props {
  categories: {
    data: Category[];
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
  filters: {
    search?: string;
  };
}

export default function ProductCategoriesIndex({ categories, filters }: Props) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(filters.search ?? '');
  const didMount = useRef(false);

  const handleDelete = (id: number, label: string) => {
    setDeleteId(id);
    setDeleteLabel(label);
    setOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      router.delete(`/product-categories/${deleteId}`);
      setOpen(false);
      setDeleteId(null);
      setDeleteLabel('');
    }
  };

  const resetSearch = () => {
    setSearch('');
    router.get('/product-categories', {}, { preserveState: true, replace: true, preserveScroll: true });
  };

  useEffect(() => {
    setSearch(filters.search ?? '');
  }, [filters.search]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const timer = setTimeout(() => {
      router.get('/product-categories', { search }, { preserveState: true, replace: true, preserveScroll: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <AppLayout>
      <Head title="Catégories de produits" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Catégories de produits</h1>
              <p className="text-muted-foreground">Organisez vos produits par catégories.</p>
            </div>
            <Button asChild>
              <Link href="/product-categories/create">
                <Plus className="mr-2 h-4 w-4" /> Nouvelle catégorie
              </Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <p className="text-sm font-semibold">Total</p>
              <p className="text-2xl font-semibold">{categories.total}</p>
              <p className="text-xs text-muted-foreground">Catégories enregistrées</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-4">
              <p className="text-sm font-semibold">Affichage</p>
              <p className="text-2xl font-semibold">{categories.from ?? 0}-{categories.to ?? 0}</p>
              <p className="text-xs text-muted-foreground">Éléments visibles</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des catégories</CardTitle>
            <p className="text-sm text-muted-foreground">Gérez les catégories disponibles pour vos produits.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold">Filtre</p>
                  <p className="text-xs text-muted-foreground">Recherchez par nom ou description</p>
                </div>
                <div className="flex w-full max-w-sm items-center gap-2">
                  <Input
                    value={search}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearch(value);
                    }}
                    placeholder="Rechercher une catégorie..."
                  />
                  <Button variant="outline" onClick={resetSearch}>Réinitialiser</Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Produits</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Aucune catégorie trouvée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.data.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell>{category.produits_count ?? 0}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/product-categories/${category.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => handleDelete(category.id, category.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {categories.last_page > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Affichage de {(categories.current_page - 1) * categories.per_page + 1} à{' '}
                  {Math.min(categories.current_page * categories.per_page, categories.total)} sur{' '}
                  {categories.total} catégories
                </p>
                <div className="flex gap-2">
                  {categories.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? 'default' : 'outline'}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true, preserveScroll: true })}
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
              Cette action est irréversible. Voulez-vous supprimer la catégorie
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
