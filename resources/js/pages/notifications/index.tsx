import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  created_at?: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

interface ChargeNotification {
  id: string;
  title: string;
  message: string;
  is_read?: boolean;
  status?: string;
  rejection_reason?: string | null;
  charge_reference?: string;
  created_at?: string | null;
  url?: string;
}

interface NotificationMetaSection {
  shown: number;
  total: number;
  limit: number;
  has_more: boolean;
}

interface Props {
  incomingRequests: TransferRequest[];
  outgoingRequests: TransferRequest[];
  chargeNotifications: ChargeNotification[];
  activeTab: 'all' | 'incoming' | 'outgoing' | 'charge';
  meta: {
    incoming: NotificationMetaSection;
    outgoing: NotificationMetaSection;
    charge: NotificationMetaSection;
  };
}

export default function NotificationsIndex({ incomingRequests, outgoingRequests, chargeNotifications, activeTab: initialActiveTab, meta }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'outgoing' | 'charge'>(initialActiveTab);

  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({
        only: ['incomingRequests', 'outgoingRequests', 'chargeNotifications', 'notificationCount', 'meta', 'activeTab'],
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadMore = (section: 'incoming' | 'outgoing' | 'charge') => {
    const stepBySection = {
      incoming: 8,
      outgoing: 8,
      charge: 12,
    } as const;

    router.get('/notifications', {
      tab: activeTab,
      incoming_limit: section === 'incoming' ? meta.incoming.limit + stepBySection.incoming : meta.incoming.limit,
      outgoing_limit: section === 'outgoing' ? meta.outgoing.limit + stepBySection.outgoing : meta.outgoing.limit,
      charge_limit: section === 'charge' ? meta.charge.limit + stepBySection.charge : meta.charge.limit,
    }, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const handleTabChange = (value: 'all' | 'incoming' | 'outgoing' | 'charge') => {
    setActiveTab(value);
    router.get('/notifications', {
      tab: value,
      incoming_limit: value === 'incoming' ? Math.max(meta.incoming.limit, 12) : meta.incoming.limit,
      outgoing_limit: value === 'outgoing' ? Math.max(meta.outgoing.limit, 12) : meta.outgoing.limit,
      charge_limit: value === 'charge' ? Math.max(meta.charge.limit, 20) : meta.charge.limit,
    }, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
    });
  };

  const renderIncomingSection = (compact = false) => {
    const items = compact ? incomingRequests.slice(0, 3) : incomingRequests;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">À valider ({meta.incoming.total})</p>
          {meta.incoming.total > 0 && (
            <p className="text-xs text-muted-foreground">{meta.incoming.shown} affichées</p>
          )}
        </div>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune demande entrante.</p>
        ) : (
          items.map((request) => (
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
                  {formatDateTime(request.created_at) && (
                    <p className="text-xs text-muted-foreground">{formatDateTime(request.created_at)}</p>
                  )}
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
        {!compact && meta.incoming.has_more && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => loadMore('incoming')}>
              Afficher plus
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderOutgoingSection = (compact = false) => {
    const items = compact ? outgoingRequests.slice(0, 3) : outgoingRequests;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Demandes envoyées ({meta.outgoing.total})</p>
          {meta.outgoing.total > 0 && (
            <p className="text-xs text-muted-foreground">{meta.outgoing.shown} affichées</p>
          )}
        </div>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune demande envoyée.</p>
        ) : (
          items.map((request) => (
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
                {formatDateTime(request.created_at) && (
                  <p className="text-xs text-muted-foreground">{formatDateTime(request.created_at)}</p>
                )}
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
        {!compact && meta.outgoing.has_more && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => loadMore('outgoing')}>
              Afficher plus
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderChargeSection = (compact = false) => {
    const items = compact ? chargeNotifications.slice(0, 3) : chargeNotifications;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Charges ({meta.charge.total})</p>
          {meta.charge.total > 0 && (
            <p className="text-xs text-muted-foreground">{meta.charge.shown} affichées</p>
          )}
        </div>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune notification de charge.</p>
        ) : (
          items.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'rounded-lg border border-border/60 p-4',
                notification.is_read ? 'bg-background' : 'bg-muted/40',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  {notification.rejection_reason && (
                    <p className="text-xs text-muted-foreground">
                      Motif du refus: <span className="font-medium text-foreground">{notification.rejection_reason}</span>
                    </p>
                  )}
                  {notification.created_at && (
                    <p className="text-xs text-muted-foreground">{notification.created_at}</p>
                  )}
                </div>
                {notification.url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={notification.url}>Ouvrir</a>
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
        {!compact && meta.charge.has_more && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => loadMore('charge')}>
              Afficher plus
            </Button>
          </div>
        )}
      </div>
    );
  };

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
            <CardDescription>Accès rapide par type sans scroll long</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {meta.incoming.total === 0 && meta.outgoing.total === 0 && meta.charge.total === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                <p className="text-sm text-muted-foreground">Aucune notification pour le moment.</p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as typeof activeTab)} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Aperçu</TabsTrigger>
                  <TabsTrigger value="charge">Charges ({meta.charge.total})</TabsTrigger>
                  <TabsTrigger value="incoming">À valider ({meta.incoming.total})</TabsTrigger>
                  <TabsTrigger value="outgoing">Envoyées ({meta.outgoing.total})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4 space-y-5">
                  <div className="grid gap-3 md:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => handleTabChange('charge')}
                      className="rounded-lg border border-border/60 bg-background p-4 text-left transition hover:bg-muted/40"
                    >
                      <p className="text-xs text-muted-foreground">Charges</p>
                      <p className="text-xl font-semibold">{meta.charge.total}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange('incoming')}
                      className="rounded-lg border border-border/60 bg-background p-4 text-left transition hover:bg-muted/40"
                    >
                      <p className="text-xs text-muted-foreground">À valider</p>
                      <p className="text-xl font-semibold">{meta.incoming.total}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange('outgoing')}
                      className="rounded-lg border border-border/60 bg-background p-4 text-left transition hover:bg-muted/40"
                    >
                      <p className="text-xs text-muted-foreground">Demandes envoyées</p>
                      <p className="text-xl font-semibold">{meta.outgoing.total}</p>
                    </button>
                  </div>

                  <div className="space-y-5">
                    {renderChargeSection(true)}
                    {meta.charge.total > 3 && (
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleTabChange('charge')}>
                          Voir toutes les charges
                        </Button>
                      </div>
                    )}

                    {renderIncomingSection(true)}
                    {meta.incoming.total > 3 && (
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleTabChange('incoming')}>
                          Voir toutes les demandes à valider
                        </Button>
                      </div>
                    )}

                    {renderOutgoingSection(true)}
                    {meta.outgoing.total > 3 && (
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleTabChange('outgoing')}>
                          Voir toutes les demandes envoyées
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="charge" className="mt-4">
                  <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                    {renderChargeSection(false)}
                  </div>
                </TabsContent>

                <TabsContent value="incoming" className="mt-4">
                  <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                    {renderIncomingSection(false)}
                  </div>
                </TabsContent>

                <TabsContent value="outgoing" className="mt-4">
                  <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
                    {renderOutgoingSection(false)}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
