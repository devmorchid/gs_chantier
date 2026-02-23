import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText } from 'lucide-react';
import type { Vente } from '@/types/vente';

interface Props {
  vente: Vente;
}

export default function VentesShow({ vente }: Props) {
  return (
    <AppLayout>
      <Head title={`Vente ${vente.reference}`} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/ventes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vente {vente.reference}</h1>
              <p className="text-muted-foreground">Enregistrée par {vente.user ?? '-'} le {vente.date}</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/ventes">Retour</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Détails de la vente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Client</p>
                <p className="text-sm font-medium">{vente.client ?? '-'}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">TVA</p>
                <p className="text-sm font-medium">{vente.tva_rate ?? 0}%</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Remise</p>
                <p className="text-sm font-medium">{(vente.remise ?? 0).toFixed(2)} DH</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix de vente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vente.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.produit ?? '-'}</TableCell>
                    <TableCell>{item.quantite}</TableCell>
                    <TableCell>{item.prix_vente.toFixed(2)} DH</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Total HT</p>
                <p className="text-sm font-medium">{(vente.total_ht ?? 0).toFixed(2)} DH</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Total TVA</p>
                <p className="text-sm font-medium">{(vente.total_tva ?? 0).toFixed(2)} DH</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Total TTC</p>
                <p className="text-sm font-medium">{(vente.total_ttc ?? 0).toFixed(2)} DH</p>
              </div>
            </div>

            {vente.notes && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Notes</p>
                <p className="text-sm">{vente.notes}</p>
              </div>
            )}

            <Button asChild variant="outline" className="inline-flex items-center">
              <a href={`/ventes/${vente.id}/pdf`} target="_blank" rel="noreferrer">
                <FileText className="mr-2 h-4 w-4" /> Exporter
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
