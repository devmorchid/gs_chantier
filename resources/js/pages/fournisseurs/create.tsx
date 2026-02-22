import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useForm } from '@inertiajs/react';

interface FournisseurForm {
  type: 'personne' | 'societe';
  name: string;
  rc: string;
  ice: string;
  if_fiscal: string;
  tp: string;
  telephone: string;
  email: string;
  contact_person: string;
  adresse: string;
  ville: string;
  pays: string;
  rib: string;
  banque: string;
  notes: string;
  status: 'actif' | 'inactif';
}

export default function FournisseursCreate() {
  const { data, setData, post, processing, errors } = useForm<FournisseurForm>({
    type: 'societe',
    name: '',
    rc: '',
    ice: '',
    if_fiscal: '',
    tp: '',
    telephone: '',
    email: '',
    contact_person: '',
    adresse: '',
    ville: '',
    pays: 'Maroc',
    rib: '',
    banque: '',
    notes: '',
    status: 'actif',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/fournisseurs');
  };

  return (
    <AppLayout>
      <Head title="Nouveau fournisseur" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/fournisseurs">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Ajouter un fournisseur</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Informations du fournisseur</CardTitle>
              <CardDescription>Renseignez les informations principales du fournisseur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Identification</p>
                  <p className="text-xs text-muted-foreground">Type et nom</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-medium">Type <span className="text-destructive">*</span></label>
                    <Select value={data.type} onValueChange={(v) => setData('type', v as FournisseurForm['type'])}>
                      <SelectTrigger className="w-full">
                        {data.type === 'societe' ? 'Société' : 'Personne'}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="societe">Société</SelectItem>
                        <SelectItem value="personne">Personne</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Nom <span className="text-destructive">*</span></label>
                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Informations légales</p>
                  <p className="text-xs text-muted-foreground">RC, ICE, IF, TP</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input placeholder="RC" value={data.rc} onChange={(e) => setData('rc', e.target.value)} />
                  <Input placeholder="ICE" value={data.ice} onChange={(e) => setData('ice', e.target.value)} />
                  <Input placeholder="IF Fiscal" value={data.if_fiscal} onChange={(e) => setData('if_fiscal', e.target.value)} />
                  <Input placeholder="TP" value={data.tp} onChange={(e) => setData('tp', e.target.value)} />
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Contact</p>
                  <p className="text-xs text-muted-foreground">Téléphone, email, personne de contact</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input placeholder="Téléphone" value={data.telephone} onChange={(e) => setData('telephone', e.target.value)} />
                  <Input placeholder="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                  <Input placeholder="Contact" value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} />
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Adresse</p>
                  <p className="text-xs text-muted-foreground">Adresse, ville, pays</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Input placeholder="Adresse" value={data.adresse} onChange={(e) => setData('adresse', e.target.value)} />
                  <Input placeholder="Ville" value={data.ville} onChange={(e) => setData('ville', e.target.value)} />
                  <Input placeholder="Pays" value={data.pays} onChange={(e) => setData('pays', e.target.value)} />
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Banque & Paiement</p>
                  <p className="text-xs text-muted-foreground">RIB, banque, délai</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input placeholder="RIB" value={data.rib} onChange={(e) => setData('rib', e.target.value)} />
                  <Input placeholder="Banque" value={data.banque} onChange={(e) => setData('banque', e.target.value)} />
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">Notes & Statut</p>
                  <p className="text-xs text-muted-foreground">Informations complémentaires</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Textarea placeholder="Notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                  <div className="space-y-2">
                    <label className="font-medium">Statut</label>
                    <Select value={data.status} onValueChange={(v) => setData('status', v as FournisseurForm['status'])}>
                      <SelectTrigger className="w-full">
                        {data.status === 'actif' ? 'Actif' : 'Inactif'}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="inactif">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-4">
            <Button asChild variant="outline">
              <Link href="/fournisseurs">Annuler</Link>
            </Button>
            <Button type="submit" disabled={processing}>Enregistrer</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
