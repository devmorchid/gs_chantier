
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText, Eye, Download } from 'lucide-react';
import type { Achat } from '@/types/achat';
import { useState } from 'react';

interface Props {
  achat: Achat;
}

export default function AchatsShow({ achat }: Props) {
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string; name: string } | null>(null);
  const paiementProgress = achat.total_ttc && achat.total_ttc > 0 ? ((achat.montant_paye ?? 0) / achat.total_ttc) * 100 : 0;
  const { data, setData, post, processing, reset, errors } = useForm<{ montant: string; mode_paiement: string; file: File | null }>({ montant: '', mode_paiement: '', file: null });
  const handlePaiement = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('montant', data.montant);
    formData.append('mode_paiement', data.mode_paiement);
    if (data.file) formData.append('file', data.file);
    post(`/achats/${achat.id}/paiement`, formData);
    // onSuccess can be handled via useEffect or after post if needed
  };
  return (
    <AppLayout>
      <Head title={`Achat ${achat.reference}`} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/achats">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Achat {achat.reference}</h1>
              <p className="text-muted-foreground">Enregistré par {achat.user ?? '-'} le {achat.date}</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/achats">Retour</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Détails de l'achat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Total HT</p>
                <p className="text-sm font-medium">{(achat.total_ht ?? 0).toFixed(2)} DH</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Total TVA</p>
                <p className="text-sm font-medium">{(achat.total_tva ?? 0).toFixed(2)} DH</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Total TTC</p>
                <p className="text-sm font-medium">{(achat.total_ttc ?? 0).toFixed(2)} DH</p>
              </div>
            </div>
            {/* Payment progress bar */}
            <div className="rounded-lg bg-muted p-4 space-y-3 mt-4">
              <div className="flex justify-between text-sm">
                <span>Progression du paiement</span>
                <span className="font-medium">{paiementProgress.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all duration-300"
                  style={{ width: `${paiementProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">
                  Payé: {(achat.montant_paye ?? 0).toFixed(2)} DH
                </span>
                <span className="text-orange-600">
                  Reste: {(achat.reste_a_payer ?? 0).toFixed(2)} DH
                </span>
              </div>
              {/* Historique des paiements */}
              {achat.paiements && achat.paiements.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Historique des paiements</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-2 py-1 text-left">Montant</th>
                          <th className="px-2 py-1 text-left">Mode</th>
                          <th className="px-2 py-1 text-left">Date</th>
                          <th className="px-2 py-1 text-left">Utilisateur</th>
                          <th className="px-2 py-1 text-left">Fichier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {achat.paiements.map(p => (
                          <tr key={p.id}>
                            <td className="px-2 py-1">{p.montant.toFixed(2)} DH</td>
                            <td className="px-2 py-1">{p.mode_paiement}</td>
                            <td className="px-2 py-1">{p.date_paiement}</td>
                            <td className="px-2 py-1">{p.user ?? '-'}</td>
                            <td className="px-2 py-1">
                              {p.file ? (
                                <div className="flex gap-2 items-center">
                                  <Button size="icon" variant="ghost" type="button" onClick={() =>
                                    p.file && setPreviewFile({
                                      url: `/achats/paiements/file/${encodeURIComponent(p.file.replace('paiements_achats/', ''))}`,
                                      type: p.file.endsWith('.pdf') ? 'application/pdf' : (p.file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : ''),
                                      name: p.file.split('/').pop() || 'Justificatif',
                                    })
                                  }>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button asChild size="icon" variant="ghost">
                                    <a href={`/achats/paiements/file/${encodeURIComponent(p.file.replace('paiements_achats/', ''))}`} target="_blank" rel="noreferrer">
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </Button>
                                </div>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {paiementProgress < 100 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" className="mt-4">Ajouter un paiement</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ajouter un paiement</AlertDialogTitle>
                    </AlertDialogHeader>
                    <form onSubmit={handlePaiement} className="space-y-4">
                      <div>
                        <label htmlFor="montant" className="block text-sm font-medium mb-1">Montant</label>
                        <input
                          id="montant"
                          type="number"
                          min="0.01"
                          max={achat.reste_a_payer ?? 0}
                          step="0.01"
                          value={data.montant}
                          onChange={e => {
                            const max = achat.reste_a_payer ?? 0;
                            let val = e.target.value;
                            if (parseFloat(val) > max) val = max.toString();
                            setData('montant', val);
                          }}
                          className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                          required
                        />
                        {errors.montant && <div className="text-red-600 text-xs mt-1">{errors.montant}</div>}
                      </div>
                      <div>
                        <label htmlFor="mode_paiement" className="block text-sm font-medium mb-1">Mode de paiement</label>
                        <select
                          id="mode_paiement"
                          value={data.mode_paiement || ''}
                          onChange={e => setData('mode_paiement', e.target.value)}
                          className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                          required
                        >
                          <option value="">Sélectionner</option>
                          <option value="espece">Espèce</option>
                          <option value="cheque">Chèque</option>
                          <option value="virement">Virement</option>
                          <option value="autre">Autre</option>
                        </select>
                        {errors.mode_paiement && <div className="text-red-600 text-xs mt-1">{errors.mode_paiement}</div>}
                      </div>
                      <div>
                        <label htmlFor="file" className="block text-sm font-medium mb-1">Justificatif (PDF ou image)</label>
                        <input
                          id="file"
                          type="file"
                          accept="application/pdf,image/*"
                          className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                          onChange={e => setData('file', e.target.files?.[0] ?? null)}
                          required={data.mode_paiement === 'cheque' || data.mode_paiement === 'virement'}
                        />
                        {errors.file && <div className="text-red-600 text-xs mt-1">{errors.file}</div>}
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <button type="submit" disabled={processing}>Valider</button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </form>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            {achat.notes && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Notes</p>
                <p className="text-sm">{achat.notes}</p>
              </div>
            )}
            <Button asChild variant="outline" className="inline-flex items-center">
              <a href={`/achats/${achat.id}/pdf`} target="_blank" rel="noreferrer">
                <FileText className="mr-2 h-4 w-4" /> Exporter
              </a>
            </Button>
          </CardContent>
        </Card>
      {/* Popup preview for justificatif file */}
      {previewFile && (
        <AlertDialog open={!!previewFile} onOpenChange={open => !open && setPreviewFile(null)}>
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{previewFile.name}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="py-4">
              {previewFile.type === 'application/pdf' ? (
                <iframe src={previewFile.url} title={previewFile.name} className="w-full h-[70vh] rounded border" />
              ) : previewFile.type === 'image' ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-[70vh] w-full object-contain rounded" />
              ) : (
                <a href={previewFile.url} target="_blank" rel="noreferrer" className="text-primary underline">Ouvrir le fichier</a>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button" onClick={() => setPreviewFile(null)}>Fermer</AlertDialogCancel>
              <AlertDialogAction asChild>
                <a href={previewFile.url} download className="btn btn-primary">Télécharger</a>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
    </AppLayout>
  );
}
