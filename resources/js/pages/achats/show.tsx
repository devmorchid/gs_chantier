import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText } from 'lucide-react';
import type { Achat } from '@/types/achat';

interface Props {
  achat: Achat;
}

export default function AchatsShow({ achat }: Props) {
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
                <p className="text-xs uppercase text-muted-foreground">Fournisseur</p>
                <p className="text-sm font-medium">{achat.fournisseur ?? '-'}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">TVA</p>
                <p className="text-sm font-medium">{achat.tva_rate ?? 0}%</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">Remise</p>
                <p className="text-sm font-medium">{(achat.remise ?? 0).toFixed(2)} DH</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix d'achat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achat.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.produit ?? '-'}</TableCell>
                    <TableCell>{item.quantite}</TableCell>
                    <TableCell>{item.prix_achat.toFixed(2)} DH</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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
      </div>
    </AppLayout>
  );
}
