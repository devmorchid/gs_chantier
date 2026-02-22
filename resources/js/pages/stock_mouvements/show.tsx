import AppLayout from '@/layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import type { StockMouvement } from '@/types';
import {
  Boxes,
  ArrowLeft,
  ArrowLeftRight,
  MapPin,
  CalendarDays,
  Package,
  FileText,
} from 'lucide-react';

interface Props {
  mouvement: StockMouvement;
}

export default function StockMouvementsShow({ mouvement }: Props) {
  const items = mouvement.items ?? [];
  const totalQuantite = items.length
    ? items.reduce((sum, item) => sum + (item.quantite ?? 0), 0)
    : mouvement.quantite;
  return (
    <AppLayout>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/stock-mouvements">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Détail mouvement de stock</h1>
          </div>
        </div>
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle>Informations du mouvement</CardTitle>
            <CardDescription>
              Visualisez les informations principales du mouvement de stock
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Boxes className="h-4 w-4" />
                  </span>
                  Produits
                </div>
                <p className="text-sm text-muted-foreground">
                  {items.length ? `${items.length} produits` : mouvement.produit?.name || '-'}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Identification du stock</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-4 w-4" />
                  </span>
                  Référence
                </div>
                <p className="text-sm text-muted-foreground">{mouvement.reference || '-'}</p>
                <p className="mt-2 text-xs text-muted-foreground">Numéro du mouvement</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <ArrowLeftRight className="h-4 w-4" />
                  </span>
                  Type
                </div>
                <p className="text-sm text-muted-foreground">{mouvement.type}</p>
                <p className="mt-2 text-xs text-muted-foreground">Nature du mouvement</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Package className="h-4 w-4" />
                  </span>
                  Quantité totale
                </div>
                <p className="text-sm text-muted-foreground">{totalQuantite}</p>
                <p className="mt-2 text-xs text-muted-foreground">Unités concernées</p>
              </div>
            </div>

            {items.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Package className="h-4 w-4" />
                  </span>
                  Détails des produits
                </div>
                <div className="grid gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm">
                      <span className="font-medium">{item.produit?.name ?? '-'}</span>
                      <span className="text-muted-foreground">Qté: {item.quantite}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-4 w-4" />
                </span>
                Trajet du mouvement
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Origine</p>
                  <p className="text-sm">{mouvement.origine || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Destination</p>
                  <p className="text-sm">{mouvement.destination}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <CalendarDays className="h-4 w-4" />
                </span>
                Date du mouvement
              </div>
              <p className="text-sm text-muted-foreground">{mouvement.date}</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.get('/stock-mouvements')}>Retour</Button>
          <Button
            variant="outline"
            onClick={() => window.open(`/stock-mouvements/${mouvement.id}/pdf`, '_blank', 'noopener,noreferrer')}
          >
            PDF
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
