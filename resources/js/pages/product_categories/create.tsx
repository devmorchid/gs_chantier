import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function ProductCategoriesCreate() {
  const [form, setForm] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/product-categories', form, {
      onError: (err) => setErrors(err as Record<string, string>),
    });
  };

  return (
    <AppLayout>
      <Head title="Nouvelle catégorie" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/product-categories">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Ajouter une catégorie</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Informations de la catégorie</CardTitle>
              <CardDescription>
                Définissez le nom et la description de la catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Identification</p>
                  <p className="text-xs text-muted-foreground">Nom et description</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="font-medium">
                      Nom <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="name"
                      id="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      maxLength={255}
                      placeholder="Ex: Matériaux"
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="font-medium">
                      Description
                    </label>
                    <Textarea
                      name="description"
                      id="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Ex: Matériaux pour chantier"
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-4">
            <Button asChild variant="outline">
              <Link href="/product-categories">Annuler</Link>
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
