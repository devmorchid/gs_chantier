import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowUp, Check, Download, Eye, FileText, Pencil, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Charge } from '@/types/charge';

interface Props {
  charge: Charge;
  canEdit: boolean;
  isAdmin: boolean;
}

const formatSize = (size: number) => {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
};

export default function ChargesShow({ charge, canEdit, isAdmin }: Props) {
  const displayRef = charge.reference || `#${charge.id}`;
  const [previewFile, setPreviewFile] = useState<NonNullable<Charge['attachments']>[number] | null>(null);
  const [showGoTop, setShowGoTop] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');

  const isImageFile = (mimeType: string) => mimeType.startsWith('image/');
  const isPdfFile = (mimeType: string, url: string) =>
    mimeType === 'application/pdf' || url.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    const onScroll = () => {
      setShowGoTop(window.scrollY > 120);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAccept = () => {
    setAcceptDialogOpen(true);
  };

  const handleConfirmAccept = () => {
    setIsAccepting(true);

    router.put(`/charges/${charge.id}`, {
      status: 'accepted',
      rejection_reason: '',
    }, {
      onSuccess: () => setAcceptDialogOpen(false),
      onFinish: () => setIsAccepting(false),
    });
  };

  const handleReject = () => {
    setRejectReasonError('');
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectReasonError('Le motif du refus est obligatoire.');
      return;
    }

    setIsRejecting(true);

    router.put(
      `/charges/${charge.id}`,
      {
        status: 'rejected',
        rejection_reason: rejectReason.trim(),
      },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectReason('');
          setRejectReasonError('');
        },
        onFinish: () => setIsRejecting(false),
      },
    );
  };

  return (
    <AppLayout>
      <Head title={`Charge ${displayRef}`} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/charges">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Charge {displayRef}</h1>
              <p className="text-muted-foreground">{charge.type_label ?? charge.type} - {charge.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && canEdit && charge.status === 'pending' && (
              <>
                <Button variant="outline" onClick={handleReject}>
                  <X className="mr-2 h-4 w-4" /> Refuser
                </Button>
                <Button onClick={handleAccept}>
                  <Check className="mr-2 h-4 w-4" /> Accepter
                </Button>
              </>
            )}
            {!isAdmin && canEdit && (
              <Button asChild variant="outline">
                <Link href={`/charges/${charge.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <a href={`/charges/${charge.id}/pdf`} target="_blank" rel="noreferrer">
                <FileText className="mr-2 h-4 w-4" /> Exporter
              </a>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Details de la charge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Chantier</p>
                <p className="text-sm font-medium">
                  {charge.chantier ? `${charge.chantier.reference} - ${charge.chantier.nom}` : '-'}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Libelle</p>
                <p className="text-sm font-medium">{charge.libelle ?? '-'}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Montant</p>
                <p className="text-sm font-medium">{charge.montant.toFixed(2)} DH</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Statut</p>
                <p className="text-sm font-medium">{charge.status_label}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Methode de paiement</p>
                <p className="text-sm font-medium">{charge.payment_method ?? '-'}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{charge.date}</p>
              </div>
            </div>

            {charge.description && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Description</p>
                <p className="text-sm">{charge.description}</p>
              </div>
            )}

            {charge.rejection_reason && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Motif de refus</p>
                <p className="text-sm">{charge.rejection_reason}</p>
              </div>
            )}

            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Justificatifs</p>
                  <p className="text-xs text-muted-foreground">Fichiers joints</p>
                </div>
              </div>

              {charge.attachments && charge.attachments.length > 0 ? (
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
                    {charge.attachments.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>{file.mime_type}</TableCell>
                        <TableCell>{formatSize(file.size)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setPreviewFile(file)}>
                              <Eye className="mr-2 h-4 w-4" /> Voir
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <a href={file.url} target="_blank" rel="noreferrer">
                                <Download className="mr-2 h-4 w-4" /> Telecharger
                              </a>
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
            </div>
          </CardContent>
        </Card>

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

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Motif du refus</DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              <Textarea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectReasonError) setRejectReasonError('');
                }}
                placeholder="Saisissez la raison du refus"
              />
              {rejectReasonError && <p className="text-sm text-destructive">{rejectReasonError}</p>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Annuler</Button>
              <Button variant="destructive" onClick={handleConfirmReject} disabled={isRejecting}>
                Confirmer le refus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Confirmer l'acceptation</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
              Voulez-vous accepter cette charge ?
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleConfirmAccept} disabled={isAccepting}>Confirmer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {showGoTop && (
          <Button
            type="button"
            size="icon"
            className="fixed bottom-6 right-6"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Retour en haut"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </AppLayout>
  );
}
