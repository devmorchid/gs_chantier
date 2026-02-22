import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Boxes, Barcode, Tag, Package, Truck, Coins, Image as ImageIcon } from 'lucide-react';

interface Produit {
  id: number;
  code_barre: string;
  name: string;
  category?: { id: number; name: string } | null;
  prix_achat: string;
  prix_vente: string;
  fournisseur?: { id: number; name: string } | null;
  quantite?: string | number;
  image?: string | null;
}

interface Props {
  produit: Produit;
}

export default function ProduitShow({ produit }: Props) {
  const defaultImage = '/storage/produits/default_img.avif';
  const imageSrc = produit.image
    ? (produit.image.startsWith('http') ? produit.image : `/storage/${produit.image}`)
    : defaultImage;

  return (
    <AppLayout>
      <Head title={`Produit: ${produit.name}`} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/produits">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{produit.name}</h1>
              <p className="text-muted-foreground">Code barre: {produit.code_barre}</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={`/produits/${produit.id}/edit`}>Modifier</Link>
          </Button>
        </div>
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle>Fiche produit</CardTitle>
            <CardDescription>Détails et caractéristiques du produit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Boxes className="h-4 w-4" />
                  </span>
                  Produit
                </div>
                <p className="text-sm text-muted-foreground">{produit.name}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Barcode className="h-4 w-4" />
                  </span>
                  Code barre
                </div>
                <p className="text-sm text-muted-foreground">{produit.code_barre}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Tag className="h-4 w-4" />
                  </span>
                  Catégorie
                </div>
                <p className="text-sm text-muted-foreground">{produit.category?.name || '-'}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Truck className="h-4 w-4" />
                </span>
                Fournisseur
              </div>
                <p className="text-sm text-muted-foreground">{produit.fournisseur?.name || '-'}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Coins className="h-4 w-4" />
                  </span>
                  Prix d'achat
                </div>
                <p className="text-sm text-muted-foreground">{produit.prix_achat} DH</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Coins className="h-4 w-4" />
                  </span>
                  Prix de vente
                </div>
                <p className="text-sm text-muted-foreground">{produit.prix_vente} DH</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Package className="h-4 w-4" />
                  </span>
                  Quantité en stock
                </div>
                <p className="text-sm text-muted-foreground">{produit.quantite ?? '-'}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="h-4 w-4" />
                </span>
                Image du produit
              </div>
              <img
                src={imageSrc}
                alt={produit.name}
                className="w-40 h-40 object-cover rounded border"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
