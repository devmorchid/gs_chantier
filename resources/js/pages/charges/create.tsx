import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ArrowLeft, FileText, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ChantierOption {
  id: number;
  reference: string;
  nom: string;
}

interface Props {
  statuts: Record<string, string>;
  types: Record<string, string>;
  chantiers: ChantierOption[];
  requiresChantier: boolean;
  isAdmin: boolean;
}

interface ChargeForm {
  libelle: string;
  type: string;
  chantier_id: string;
  montant: string;
  date: string;
  description: string;
  payment_method: string;
  status: string;
  files: File[];
}

export default function ChargesCreate({ statuts, types, chantiers, requiresChantier, isAdmin }: Props) {
  const paymentOptions = [
    { value: 'especes', label: 'Especes' },
    { value: 'virement', label: 'Virement bancaire' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'carte', label: 'Carte bancaire' },
    { value: 'autre', label: 'Autre' },
  ];

  const [filePreviews, setFilePreviews] = useState<Array<{
    key: string;
    name: string;
    type: string;
    size: number;
    url: string;
    isImage: boolean;
  }>>([]);

  const { data, setData, post, processing, errors } = useForm<ChargeForm>({
    libelle: '',
    type: isAdmin ? 'chantier' : 'entreprise',
    chantier_id: '',
    montant: '',
    date: '',
    description: '',
    payment_method: '',
    status: 'pending',
    files: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/charges', { forceFormData: true });
  };

  useEffect(() => {
    if (isAdmin && data.type === 'entreprise' && data.chantier_id) {
      setData('chantier_id', '');
    }
  }, [isAdmin, data.type, data.chantier_id, setData]);

  useEffect(() => {
    const nextPreviews = data.files.map((file) => {
      const url = URL.createObjectURL(file);
      return {
        key: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url,
        isImage: file.type.startsWith('image/'),
      };
    });

    setFilePreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [data.files]);

  const handleRemoveFile = (key: string) => {
    const nextFiles = data.files.filter((file) => `${file.name}-${file.size}-${file.lastModified}` !== key);
    setData('files', nextFiles);
  };

  return (
    <AppLayout>
      <Head title="Nouvelle charge" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/charges">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Ajouter une charge</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Informations de la charge</CardTitle>
              <CardDescription>Renseignez les details principaux</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Details</p>
                  <p className="text-xs text-muted-foreground">Type, chantier et montant</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-medium">Libelle <span className="text-destructive">*</span></label>
                    <Input
                      value={data.libelle}
                      onChange={(e) => setData('libelle', e.target.value)}
                      placeholder="Ex: Achat de materiel"
                    />
                    {errors.libelle && <p className="text-sm text-destructive">{errors.libelle}</p>}
                  </div>
                  {isAdmin && (
                    <div className="space-y-2">
                      <label className="font-medium">Type <span className="text-destructive">*</span></label>
                      <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                        <SelectTrigger className="w-full">
                          {types[data.type]}
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(types).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                    </div>
                  )}
                  {(!isAdmin || data.type === 'chantier') && (
                    <div className="space-y-2">
                      <label className="font-medium">Chantier {requiresChantier && <span className="text-destructive">*</span>}</label>
                      <Select
                        value={data.chantier_id || 'none'}
                        onValueChange={(value) => setData('chantier_id', value === 'none' ? '' : value)}
                      >
                        <SelectTrigger className="w-full">
                          {data.chantier_id
                            ? (chantiers.find((chantier) => String(chantier.id) === data.chantier_id)?.reference ?? 'Chantier')
                            : 'Selectionner un chantier'}
                        </SelectTrigger>
                        <SelectContent>
                          {!requiresChantier && <SelectItem value="none">Sans chantier</SelectItem>}
                          {chantiers.map((chantier) => (
                            <SelectItem key={chantier.id} value={String(chantier.id)}>
                              {chantier.reference} - {chantier.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.chantier_id && <p className="text-sm text-destructive">{errors.chantier_id}</p>}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="font-medium">Montant (DH) <span className="text-destructive">*</span></label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.montant}
                      onChange={(e) => setData('montant', e.target.value)}
                      placeholder="0.00"
                    />
                    {errors.montant && <p className="text-sm text-destructive">{errors.montant}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Date <span className="text-destructive">*</span></label>
                    <Input
                      type="date"
                      value={data.date}
                      onChange={(e) => setData('date', e.target.value)}
                    />
                    {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Complement</p>
                  <p className="text-xs text-muted-foreground">Paiement, statut et description</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-medium">Methode de paiement</label>
                    <Select
                      value={data.payment_method || 'none'}
                      onValueChange={(value) => setData('payment_method', value === 'none' ? '' : value)}
                    >
                      <SelectTrigger className="w-full">
                        {data.payment_method
                          ? (paymentOptions.find((option) => option.value === data.payment_method)?.label ?? 'Methode')
                          : 'Selectionner une methode'}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Non defini</SelectItem>
                        {paymentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.payment_method && <p className="text-sm text-destructive">{errors.payment_method}</p>}
                  </div>
                  {isAdmin && (
                    <div className="space-y-2">
                      <label className="font-medium">Statut <span className="text-destructive">*</span></label>
                      <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                        <SelectTrigger className="w-full">
                          {statuts[data.status]}
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statuts).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                    </div>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-medium">Description</label>
                    <Textarea
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Details ou remarques"
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Justificatifs</p>
                  <p className="text-xs text-muted-foreground">Images ou PDF (optionnel)</p>
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Fichiers</label>
                  <Input
                    type="file"
                    name="files"
                    multiple
                    accept="application/pdf,image/*"
                    onChange={(e) => setData('files', Array.from(e.target.files ?? []))}
                  />
                  {errors.files && <p className="text-sm text-destructive">{errors.files}</p>}
                  {data.files.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {data.files.length} fichier(s) selectionne(s)
                    </p>
                  )}
                  {filePreviews.length > 0 && (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {filePreviews.map((preview) => (
                        <div key={preview.key} className="rounded-lg border border-border/60 bg-background p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                            {preview.isImage ? (
                              <img
                                src={preview.url}
                                alt={preview.name}
                                className="h-16 w-16 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                                <FileText className="h-8 w-8" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <p className="truncate text-sm font-medium">{preview.name}</p>
                              <p className="text-xs text-muted-foreground">{preview.type || 'fichier'}</p>
                              {!preview.isImage && (
                                <a
                                  href={preview.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary underline"
                                >
                                  Ouvrir le PDF
                                </a>
                              )}
                            </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(preview.key)}
                              className="shrink-0 rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                              aria-label={`Supprimer ${preview.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button asChild variant="outline">
              <Link href="/charges">Annuler</Link>
            </Button>
            <Button type="submit" disabled={processing}>
              <Save className="mr-2 h-4 w-4" /> Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
