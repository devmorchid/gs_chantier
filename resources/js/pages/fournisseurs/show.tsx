import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Landmark, FileText } from 'lucide-react';

interface Fournisseur {
  id: number;
  type: 'personne' | 'societe';
  name: string;
  rc?: string | null;
  ice?: string | null;
  if_fiscal?: string | null;
  tp?: string | null;
  telephone?: string | null;
  email?: string | null;
  contact_person?: string | null;
  adresse?: string | null;
  ville?: string | null;
  pays?: string | null;
  rib?: string | null;
  banque?: string | null;
  delai_paiement?: number | null;
  notes?: string | null;
  status: 'actif' | 'inactif';
}

interface Props {
  fournisseur: Fournisseur;
}

export default function FournisseursShow({ fournisseur }: Props) {
  return (
    <AppLayout>
      <Head title={`Fournisseur ${fournisseur.name}`} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/fournisseurs">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{fournisseur.name}</h1>
              <p className="text-muted-foreground">Détails du fournisseur</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/fournisseurs">Retour</Link>
            </Button>
            <Button asChild>
              <Link href={`/fournisseurs/${fournisseur.id}/edit`}>Modifier</Link>
            </Button>
          </div>
        </div>

        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle>Fiche fournisseur</CardTitle>
            <CardDescription>Informations générales et détails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  {fournisseur.type === 'societe' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  Type
                </div>
                <p className="text-sm text-muted-foreground">{fournisseur.type === 'societe' ? 'Société' : 'Personne'}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4" /> Statut
                </div>
                <Badge variant={fournisseur.status === 'actif' ? 'default' : 'secondary'}>
                  {fournisseur.status === 'actif' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Phone className="h-4 w-4" /> Contact
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Téléphone</p>
                  <p className="text-sm">{fournisseur.telephone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Email</p>
                  <p className="text-sm">{fournisseur.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Contact</p>
                  <p className="text-sm">{fournisseur.contact_person || '-'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4" /> Adresse
              </div>
              <p className="text-sm text-muted-foreground">
                {fournisseur.adresse || '-'} {fournisseur.ville ? `, ${fournisseur.ville}` : ''} {fournisseur.pays ? `, ${fournisseur.pays}` : ''}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4" /> Informations légales
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">RC</p>
                  <p className="text-sm">{fournisseur.rc || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">ICE</p>
                  <p className="text-sm">{fournisseur.ice || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">IF Fiscal</p>
                  <p className="text-sm">{fournisseur.if_fiscal || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">TP</p>
                  <p className="text-sm">{fournisseur.tp || '-'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Landmark className="h-4 w-4" /> Banque
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">RIB</p>
                  <p className="text-sm">{fournisseur.rib || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Banque</p>
                  <p className="text-sm">{fournisseur.banque || '-'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4" /> Notes
              </div>
              <p className="text-sm text-muted-foreground">{fournisseur.notes || '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
