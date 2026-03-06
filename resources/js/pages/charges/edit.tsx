import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

interface ChargeEditInfo {
  id: number;
  reference: string;
  libelle?: string | null;
  status: string;
  status_label: string;
  rejection_reason?: string | null;
  date?: string | null;
  type_label?: string | null;
}

interface Props {
  charge: ChargeEditInfo;
  statuts: Record<string, string>;
  canEdit: boolean;
}

export default function ChargesEdit({ charge, statuts, canEdit }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    status: charge.status,
    rejection_reason: charge.rejection_reason ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    put(`/charges/${charge.id}`);
  };

  return (
    <AppLayout>
      <Head title={`Modifier ${charge.reference}`} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/charges/${charge.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Modifier {charge.reference}</h1>
              <p className="text-muted-foreground">{charge.libelle ?? 'Charge'} - {charge.date ?? '-'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Statut de la charge</CardTitle>
              <CardDescription>
                Vous pouvez modifier uniquement le statut tant qu'il n'est pas accepte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-medium">Statut <span className="text-destructive">*</span></label>
                    <Select
                      value={data.status}
                      onValueChange={(value) => setData('status', value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger className="w-full">
                        {statuts[data.status]}
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statuts).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                    {!canEdit && (
                      <p className="text-xs text-muted-foreground">
                        Cette charge est deja acceptee. Le statut ne peut pas etre modifie.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Type</label>
                    <p className="text-sm text-muted-foreground">{charge.type_label ?? '-'}</p>
                  </div>
                </div>
                {data.status === 'rejected' && (
                  <div className="mt-4 space-y-2">
                    <label className="font-medium">Motif du refus <span className="text-destructive">*</span></label>
                    <Textarea
                      value={data.rejection_reason}
                      onChange={(e) => setData('rejection_reason', e.target.value)}
                      placeholder="Precisez la raison du refus"
                      disabled={!canEdit}
                    />
                    {errors.rejection_reason && <p className="text-sm text-destructive">{errors.rejection_reason}</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button asChild variant="outline">
              <Link href={`/charges/${charge.id}`}>Annuler</Link>
            </Button>
            <Button type="submit" disabled={processing || !canEdit}>
              <Save className="mr-2 h-4 w-4" /> Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
