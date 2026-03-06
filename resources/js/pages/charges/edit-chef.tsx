import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Eye, FileText, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ChantierOption {
  id: number;
  reference: string;
  nom: string;
}

interface ExistingAttachment {
  id: number;
  name: string;
  mime_type: string;
  size: number;
  url: string;
}

interface ChargeEditChef {
  id: number;
  reference: string;
  libelle: string;
  type: string;
  chantier_id: number | null;
  montant: number;
  date: string;
  description?: string | null;
  payment_method?: string | null;
  status: string;
  status_label: string;
  rejection_reason?: string | null;
  attachments?: ExistingAttachment[];
}

interface Props {
  charge: ChargeEditChef;
  chantiers: ChantierOption[];
}

interface ChargeForm {
  libelle: string;
  chantier_id: string;
  montant: string;
  date: string;
  description: string;
  payment_method: string;
  files: File[];
  delete_attachment_ids: number[];
}

const formatSize = (size: number) => {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
};

export default function ChargesEditChef({ charge, chantiers }: Props) {
  const [previewFile, setPreviewFile] = useState<ExistingAttachment | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>(charge.attachments ?? []);
  const [filePreviews, setFilePreviews] = useState<Array<{
    key: string;
    name: string;
    type: string;
    size: number;
    url: string;
    isImage: boolean;
  }>>([]);

  const paymentOptions = [
    { value: 'especes', label: 'Especes' },
    { value: 'virement', label: 'Virement bancaire' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'carte', label: 'Carte bancaire' },
    { value: 'autre', label: 'Autre' },
  ];

  const { data, setData, post, processing, errors } = useForm<ChargeForm & { _method: 'put' }>({
    _method: 'put',
    libelle: charge.libelle ?? '',
    chantier_id: charge.chantier_id ? String(charge.chantier_id) : '',
    montant: String(charge.montant ?? ''),
    date: charge.date ?? '',
    description: charge.description ?? '',
    payment_method: charge.payment_method ?? '',
    files: [],
    delete_attachment_ids: [],
  });

  const handleRemoveAttachment = (file: ExistingAttachment) => {
    setExistingAttachments((prev) => prev.filter((item) => item.id !== file.id));
    setData('delete_attachment_ids', Array.from(new Set([...data.delete_attachment_ids, file.id])));
    if (previewFile?.id === file.id) {
      setPreviewFile(null);
    }
  };

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

  const handleRemoveNewFile = (key: string) => {
    const nextFiles = data.files.filter((file) => `${file.name}-${file.size}-${file.lastModified}` !== key);
    setData('files', nextFiles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/charges/${charge.id}`, { forceFormData: true });
  };

  const isImageFile = (mimeType: string) => mimeType.startsWith('image/');
  const isPdfFile = (mimeType: string, url: string) =>
    mimeType === 'application/pdf' || url.toLowerCase().endsWith('.pdf');

  return (
    <AppLayout>
      <Head title={`Modifier ${charge.reference}`} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/charges/${charge.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Modifier la charge refusee {charge.reference}</h1>
            <p className="text-muted-foreground">Apres modification, la charge sera renvoyee a l'administrateur.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Motif de refus</CardTitle>
              <CardDescription>Corrigez votre charge selon le retour de l'administrateur.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-sm">{charge.rejection_reason ?? '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modifier la charge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-medium">Libelle <span className="text-destructive">*</span></label>
                  <Input value={data.libelle} onChange={(e) => setData('libelle', e.target.value)} />
                  {errors.libelle && <p className="text-sm text-destructive">{errors.libelle}</p>}
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Chantier <span className="text-destructive">*</span></label>
                  <Select value={data.chantier_id} onValueChange={(value) => setData('chantier_id', value)}>
                    <SelectTrigger className="w-full">
                      {data.chantier_id
                        ? (chantiers.find((chantier) => String(chantier.id) === data.chantier_id)?.reference ?? 'Chantier')
                        : 'Selectionner un chantier'}
                    </SelectTrigger>
                    <SelectContent>
                      {chantiers.map((chantier) => (
                        <SelectItem key={chantier.id} value={String(chantier.id)}>
                          {chantier.reference} - {chantier.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.chantier_id && <p className="text-sm text-destructive">{errors.chantier_id}</p>}
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Montant (DH) <span className="text-destructive">*</span></label>
                  <Input type="number" step="0.01" value={data.montant} onChange={(e) => setData('montant', e.target.value)} />
                  {errors.montant && <p className="text-sm text-destructive">{errors.montant}</p>}
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Date <span className="text-destructive">*</span></label>
                  <Input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                  {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                </div>
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
                <div className="space-y-2 md:col-span-2">
                  <label className="font-medium">Description</label>
                  <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="font-medium">Ajouter des justificatifs (optionnel)</label>
                  <Input
                    type="file"
                    name="files"
                    multiple
                    accept="application/pdf,image/*"
                    onChange={(e) => setData('files', Array.from(e.target.files ?? []))}
                  />
                  {errors.files && <p className="text-sm text-destructive">{errors.files}</p>}
                  {data.files.length > 0 && (
                    <p className="text-xs text-muted-foreground">{data.files.length} fichier(s) selectionne(s)</p>
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
                              onClick={() => handleRemoveNewFile(preview.key)}
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

          <Card>
            <CardHeader>
              <CardTitle>Justificatifs existants</CardTitle>
              <CardDescription>Vous pouvez supprimer un ou plusieurs fichiers avant de renvoyer la charge.</CardDescription>
            </CardHeader>
            <CardContent>
              {existingAttachments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fichier</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {existingAttachments.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>{file.mime_type}</TableCell>
                        <TableCell>{formatSize(file.size)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setPreviewFile(file)}>
                              <Eye className="mr-2 h-4 w-4" /> Voir
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveAttachment(file)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun fichier joint.</p>
              )}

              {data.delete_attachment_ids.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {data.delete_attachment_ids.length} fichier(s) seront supprimé(s) lors de l'enregistrement.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button asChild variant="outline">
              <Link href={`/charges/${charge.id}`}>Annuler</Link>
            </Button>
            <Button type="submit" disabled={processing}>
              <Save className="mr-2 h-4 w-4" /> Enregistrer et renvoyer
            </Button>
          </div>
        </form>

        <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{previewFile?.name ?? 'Apercu du fichier'}</DialogTitle>
            </DialogHeader>

            {previewFile && isImageFile(previewFile.mime_type) && (
              <div className="max-h-[75vh] overflow-auto">
                <img src={previewFile.url} alt={previewFile.name} className="h-auto max-h-[70vh] w-full rounded-md object-contain" />
              </div>
            )}

            {previewFile && isPdfFile(previewFile.mime_type, previewFile.url) && (
              <iframe src={previewFile.url} title={previewFile.name} className="h-[70vh] w-full rounded-md border" />
            )}

            {previewFile && !isImageFile(previewFile.mime_type) && !isPdfFile(previewFile.mime_type, previewFile.url) && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Ce type de fichier ne peut pas etre previsualise dans la popup.</p>
                <Button asChild variant="outline" className="w-fit">
                  <a href={previewFile.url} target="_blank" rel="noreferrer">Ouvrir le fichier</a>
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
