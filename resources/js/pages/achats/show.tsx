import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
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
  const { data, setData, post, processing, reset, errors } = useForm<{
    montant: string;
    mode_paiement: string;
    file: File | null;
    cheque_numero?: string;
    cheque_banque?: string;
    cheque_echeance?: string;
    cheque_titulaire?: string;
    virement_numero?: string;
    virement_date?: string;
    virement_note?: string;
  }>({
    montant: '',
    mode_paiement: '',
    file: null,
    cheque_numero: '',
    cheque_banque: '',
    cheque_echeance: '',
    cheque_titulaire: '',
    virement_numero: '',
    virement_date: '',
    virement_note: '',
  });
  const [montantError, setMontantError] = useState<string>('');
  const montantValid = (() => {
    const v = parseFloat(data.montant);
    if (isNaN(v) || v <= 0) return false;
    if (achat.reste_a_payer !== undefined && v > achat.reste_a_payer) return false;
    return true;
  })();
  const handlePaiement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!montantValid) {
      setMontantError('Le montant doit être strictement supérieur à 0.');
      return;
    }
    setMontantError('');
    const formData = new FormData();
    formData.append('montant', data.montant);
    formData.append('mode_paiement', data.mode_paiement);
    if (data.file) formData.append('file', data.file);
    if (data.cheque_numero) formData.append('cheque_numero', data.cheque_numero);
    if (data.cheque_banque) formData.append('cheque_banque', data.cheque_banque);
    if (data.cheque_echeance) formData.append('cheque_echeance', data.cheque_echeance);
    if (data.cheque_titulaire) formData.append('cheque_titulaire', data.cheque_titulaire);
    if (data.virement_numero) formData.append('reference', data.virement_numero);
    if (data.virement_date) formData.append('virement_date', data.virement_date);
    if (data.virement_note) formData.append('virement_note', data.virement_note);
    router.post(`/achats/${achat.id}/paiement`, formData);
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
                    <div
                      style={{
                        maxHeight: achat.paiements.length > 6 ? 320 : 'none',
                        overflowY: achat.paiements.length > 6 ? 'auto' : 'visible',
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                        background: '#18181b',
                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                      }}
                      className="transition-all"
                    >
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-muted sticky top-0 z-10">
                            <th className="px-3 py-2 text-left font-semibold">Montant</th>
                            <th className="px-3 py-2 text-left font-semibold">Mode</th>
                            <th className="px-3 py-2 text-left font-semibold">Date</th>
                            <th className="px-3 py-2 text-left font-semibold">Utilisateur</th>
                            <th className="px-3 py-2 text-left font-semibold">Fichier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {achat.paiements.map((p, i) => (
                            <tr
                              key={p.id}
                              className={i % 2 === 0 ? 'bg-background' : 'bg-muted/40'}
                            >
                              <td className="px-3 py-2 font-medium">{p.montant.toFixed(2)} DH</td>
                              <td className="px-3 py-2">{p.mode_paiement}</td>
                              <td className="px-3 py-2">{p.date_paiement}</td>
                              <td className="px-3 py-2">{p.user ?? '-'}</td>
                              <td className="px-3 py-2">
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
                            const num = parseFloat(val);
                            if (num > max) val = max.toString();
                            setData('montant', val);
                            if (val === '' || num <= 0) {
                              setMontantError('Le montant doit être strictement supérieur à 0.');
                            } else if (num > max) {
                              setMontantError('Le montant ne peut pas dépasser le reste à payer.');
                            } else {
                              setMontantError('');
                            }
                          }}
                          className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                          required
                        />
                        {(montantError || errors.montant) && (
                          <div className="text-red-600 text-xs mt-1">{montantError || errors.montant}</div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="mode_paiement" className="block text-sm font-medium mb-1">Mode de paiement</label>
                        <select
                          id="mode_paiement"
                          value={data.mode_paiement || ''}
                          onChange={e => setData('mode_paiement', e.target.value)}
                          className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                          required
                          onFocus={e => {
                            const select = e.target as HTMLSelectElement;
                            const option = select.querySelector('option[value=""]');
                            if (option) (option as HTMLOptionElement).hidden = true;
                          }}
                        >
                          <option value="" disabled={!!data.mode_paiement}>Sélectionner</option>
                          <option value="espece">Espèce</option>
                          <option value="cheque">Chèque</option>
                          <option value="virement">Virement</option>
                        </select>
                        {errors.mode_paiement && <div className="text-red-600 text-xs mt-1">{errors.mode_paiement}</div>}
                      </div>
                      {data.mode_paiement === 'cheque' && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="cheque_numero" className="block text-sm font-medium mb-1">Numéro de chèque</label>
                              <input
                                id="cheque_numero"
                                type="text"
                                className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                value={data.cheque_numero || ''}
                                onChange={e => setData('cheque_numero', e.target.value)}
                              />
                              {errors.cheque_numero && <div className="text-red-600 text-xs mt-1">{errors.cheque_numero}</div>}
                            </div>
                            <div>
                              <label htmlFor="cheque_banque" className="block text-sm font-medium mb-1">Banque</label>
                              <input
                                id="cheque_banque"
                                type="text"
                                className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                value={data.cheque_banque || ''}
                                onChange={e => setData('cheque_banque', e.target.value)}
                              />
                              {errors.cheque_banque && <div className="text-red-600 text-xs mt-1">{errors.cheque_banque}</div>}
                            </div>
                            <div>
                              <label htmlFor="cheque_echeance" className="block text-sm font-medium mb-1">Date d'échéance</label>
                              <input
                                id="cheque_echeance"
                                type="date"
                                className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                value={data.cheque_echeance || ''}
                                onChange={e => setData('cheque_echeance', e.target.value)}
                              />
                              {errors.cheque_echeance && <div className="text-red-600 text-xs mt-1">{errors.cheque_echeance}</div>}
                            </div>
                            <div>
                              <label htmlFor="cheque_titulaire" className="block text-sm font-medium mb-1">Titulaire</label>
                              <input
                                id="cheque_titulaire"
                                type="text"
                                className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                value={data.cheque_titulaire || ''}
                                onChange={e => setData('cheque_titulaire', e.target.value)}
                              />
                              {errors.cheque_titulaire && <div className="text-red-600 text-xs mt-1">{errors.cheque_titulaire}</div>}
                            </div>
                          </div>
                          <div>
                            <label htmlFor="file" className="block text-sm font-medium mb-1">Justificatif (PDF ou image)</label>
                            <input
                              id="file"
                              type="file"
                              accept="application/pdf,image/*"
                              className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                              onChange={e => setData('file', e.target.files?.[0] ?? null)}
                              // not required
                            />
                            {errors.file && <div className="text-red-600 text-xs mt-1">{errors.file}</div>}
                          </div>
                        </>
                      )}
                      {data.mode_paiement === 'virement' && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                              <label htmlFor="virement_numero" className="block text-sm font-medium mb-1">Référence du virement</label>
                              <input
                                id="virement_numero"
                                type="text"
                                className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                value={data.virement_numero || ''}
                                onChange={e => setData('virement_numero', e.target.value)}
                              />
                            </div>
                            <div>
                              <label htmlFor="virement_date" className="block text-sm font-medium mb-1">Date du virement</label>
                              <input
                                id="virement_date"
                                type="date"
                                className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                value={data.virement_date || ''}
                                onChange={e => setData('virement_date', e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="file" className="block text-sm font-medium mb-1">Fichier du virement (PDF ou image)</label>
                            <input
                              id="file"
                              type="file"
                              accept="application/pdf,image/*"
                              className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                              onChange={e => setData('file', e.target.files?.[0] ?? null)}
                            />
                            {errors.file && <div className="text-red-600 text-xs mt-1">{errors.file}</div>}
                          </div>
                          <div>
                            <label htmlFor="virement_note" className="block text-sm font-medium mb-1">Note</label>
                            <textarea
                              id="virement_note"
                              className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                              value={data.virement_note || ''}
                              onChange={e => setData('virement_note', e.target.value)}
                            />
                          </div>
                        </>
                      )}
                      <AlertDialogFooter>
                        <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <button
                            type="submit"
                            disabled={
                              processing ||
                              !montantValid ||
                              !data.mode_paiement ||
                              (data.mode_paiement === 'cheque' && (
                                !data.cheque_numero?.trim() ||
                                !data.cheque_banque?.trim() ||
                                !data.cheque_echeance?.trim() ||
                                !data.cheque_titulaire?.trim()
                              )) ||
                              (data.mode_paiement === 'virement' && (
                                !data.virement_numero?.trim() ||
                                !data.virement_date?.trim()
                              ))
                            }
                          >
                            Valider
                          </button>
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
