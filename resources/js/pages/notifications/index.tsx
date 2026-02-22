import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { useEffect } from 'react';

interface TransferRequest {
  id: number;
  requester: { id: number; name: string } | null;
  approver?: { id: number; name: string } | null;
  produit: { id: number; name: string } | null;
  items?: { id: number; produit: { id: number; name: string }; quantite: number }[];
  origine_label: string;
  destination_label: string;
  destination_chantier_id?: number | null;
  destinationChantier?: { id: number; nom: string; responsable?: { id: number; name: string } | null } | null;
  quantite: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Props {
  incomingRequests: TransferRequest[];
  outgoingRequests: TransferRequest[];
}

export default function NotificationsIndex({ incomingRequests, outgoingRequests }: Props) {
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({
        only: ['incomingRequests', 'outgoingRequests', 'notificationCount'],
        preserveState: true,
        preserveScroll: true,
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout>
      <Head title="Notifications" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
              <p className="text-muted-foreground">Consultez vos alertes et mises à jour.</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Centre de notifications</CardTitle>
            <CardDescription>Demandes de transfert en attente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                <p className="text-sm text-muted-foreground">Aucune notification pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-semibold">À valider</p>
                  {incomingRequests.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucune demande entrante.</p>
                  ) : (
                    incomingRequests.map((request) => (
                      <div key={request.id} className="rounded-lg border border-border/60 bg-background p-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">Demande de transfert reçue</p>
                            <p className="text-xs text-muted-foreground">
                              De: {request.requester?.name ?? 'Utilisateur'}
                            </p>
                            <div className="text-sm text-muted-foreground">
                              {request.items?.length ? (
                                <div className="space-y-1">
                                  {request.items.map((item) => (
                                    <div key={item.id}>
                                      <span className="font-medium text-foreground">{item.produit?.name ?? '-'}</span>
                                      {' '}• Quantité: <span className="font-medium text-foreground">{item.quantite}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p>
                                  Produit: <span className="font-medium text-foreground">{request.produit?.name ?? '-'}</span>
                                  {' '}• Quantité: <span className="font-medium text-foreground">{request.quantite}</span>
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Origine: {request.origine_label} → Destination: {request.destination_label}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => router.post(`/notifications/${request.id}/reject`)}
                            >
                              Refuser
                            </Button>
                            <Button
                              onClick={() => router.post(`/notifications/${request.id}/approve`)}
                            >
                              Accepter
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold">Demandes envoyées</p>
                  {outgoingRequests.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucune demande envoyée.</p>
                  ) : (
                    outgoingRequests.map((request) => (
                      <div key={request.id} className="rounded-lg border border-border/60 bg-background p-4">
                        <div>
                          <p className="text-sm font-semibold">
                            {request.status === 'pending'
                              ? `Demande envoyée à ${request.destinationChantier?.responsable?.name ?? 'utilisateur'}`
                              : request.status === 'approved'
                                ? 'Transfert accepté'
                                : 'Transfert refusé'}
                          </p>
                            <div className="text-sm text-muted-foreground">
                              {request.items?.length ? (
                                <div className="space-y-1">
                                  {request.items.map((item) => (
                                    <div key={item.id}>
                                      <span className="font-medium text-foreground">{item.produit?.name ?? '-'}</span>
                                      {' '}• Quantité: <span className="font-medium text-foreground">{item.quantite}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p>
                                  Produit: <span className="font-medium text-foreground">{request.produit?.name ?? '-'}</span>
                                  {' '}• Quantité: <span className="font-medium text-foreground">{request.quantite}</span>
                                </p>
                              )}
                            </div>
                          <p className="text-xs text-muted-foreground">
                            Origine: {request.origine_label} → Destination: {request.destination_label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Destination: {request.destinationChantier?.nom ?? request.destination_label}
                          </p>
                          {request.status !== 'pending' && (
                            <p className="text-xs text-muted-foreground">
                              Réponse: {request.status === 'approved' ? 'Acceptée' : 'Refusée'}
                              {request.approver?.name ? ` par ${request.approver.name}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
