import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface VenteItemForm {
  produit_id: number | '';
  produit_name: string;
  quantite: number;
  prix_vente: string;
}

interface VenteMultiStepConfirmationProps {
  data: {
    date: string;
    client_id: number | '';
    client_name: string;
    remise: string;
    tva_rate: string;
    notes: string;
    mode_paiement: string;
    montant_paye: string;
    items: VenteItemForm[];
  };
  errors: Record<string, string>;
  setData: (field: string, value: any) => void;
  totalHt: number;
  totalApresRemise: number;
  totalTva: number;
  totalTtc: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function VenteMultiStepConfirmation({ data, errors, setData, totalHt, totalApresRemise, totalTva, totalTtc, onConfirm, onCancel }: VenteMultiStepConfirmationProps) {
  const [step, setStep] = useState<number>(1);
  const [touched, setTouched] = useState<{ montant_paye: boolean; mode_paiement: boolean }>({ montant_paye: false, mode_paiement: false });
  // Cheque fields state (like achat)
  const [cheque, setCheque] = useState({ numero: '', banque: '', echeance: '', titulaire: '' });
  // Virement fields state
  const [virement, setVirement] = useState<{ reference?: string; transfer_date?: string; file?: File | null; note?: string }>({ reference: '', transfer_date: '', file: null, note: '' });

  const montantPayeNum = Number(data.montant_paye);
  const isMontantPayeValid =
    data.montant_paye !== '' &&
    !isNaN(montantPayeNum) &&
    montantPayeNum >= 0 &&
    montantPayeNum <= totalTtc;
  const isMontantDepasse = montantPayeNum > totalTtc;
  const isModePaiementValid = data.mode_paiement !== '';

  return (
    <div className="space-y-6">
      {/* Stepper indicator */}
      <div className="flex items-center justify-center mb-4" style={{ height: 56 }}>
        {/* Step 1 */}
        <div className="flex flex-col items-center z-10">
          <div className={`rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}>{step > 1 ? <span>&#10003;</span> : 1}</div>
          <span className={`mt-2 text-xs font-semibold ${step === 1 ? 'text-green-700' : 'text-gray-500'}`}>Vérification</span>
        </div>
        {/* Connecting line: only between circles */}
        <div className="relative flex-1 flex items-center" style={{ minWidth: 40 }}>
          <div
            className={`h-1 ${step > 1 ? 'bg-green-600' : 'bg-gray-300'}`}
            style={{
              marginLeft: -10,
              marginRight: -22,
              zIndex: 0,
              width: 358,
              marginTop: -20,
            }}
          />
        </div>
        {/* Step 2 */}
        <div className="flex flex-col items-center z-10">
          <div className={`rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg ${step === 2 ? 'bg-green-600' : 'bg-gray-300'}`}>{step === 2 ? 2 : 2}</div>
          <span className={`mt-2 text-xs font-semibold ${step === 2 ? 'text-green-700' : 'text-gray-500'}`}>Paiement</span>
        </div>
      </div>
      {step === 1 && (
        <>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1 text-sm text-muted-foreground">
            <p>Vérifiez les informations de la vente avant de continuer.</p>
            {/* Current elements (step 1) */}
            <div className="grid gap-4 rounded-lg border bg-muted/40 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide">Date</p>
                  <p className="font-medium text-foreground">{data.date || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide">Client</p>
                  <p className="font-medium text-foreground">{data.client_name || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide">Remise</p>
                  <p className="font-medium text-foreground">{data.remise || '-'} DH</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide">TVA</p>
                  <p className="font-medium text-foreground">{data.tva_rate || '-'} %</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide">Notes</p>
                <p className="font-medium text-foreground">{data.notes?.trim() || '-'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">Produits</p>
                <span className="text-xs">{data.items.length} ligne(s)</span>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground">
                  <span className="col-span-5">Produit</span>
                  <span className="col-span-2 text-right">Quantité</span>
                  <span className="col-span-2 text-right">Prix de vente</span>
                  <span className="col-span-3 text-right">Total</span>
                </div>
                <div className="divide-y">
                  {data.items.map((item: VenteItemForm, index: number) => {
                    const label = item.produit_name || 'Produit non choisi';
                    const prixVente = Number(item.prix_vente);
                    const lineTotal = prixVente * item.quantite;
                    return (
                      <div key={index} className="grid grid-cols-12 gap-2 px-3 py-3">
                        <div className="col-span-5 space-y-1">
                          <p className="font-medium text-foreground">{label}</p>
                        </div>
                        <div className="col-span-2 text-right font-medium text-foreground">{item.quantite}</div>
                        <div className="col-span-2 text-right font-medium text-foreground">{prixVente || '-'} DH</div>
                        <div className="col-span-3 text-right font-semibold text-foreground">{lineTotal || '-'} DH</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="grid gap-2 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <span>Montant payé</span>
                <span className="text-base font-semibold text-green-700">{data.montant_paye || '-'} DH</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Total HT</span>
                <span className="font-medium text-foreground">{totalHt || '-'} DH</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Total après remise</span>
                <span className="font-medium text-foreground">{totalApresRemise || '-'} DH</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>TVA</span>
                <span className="font-medium text-foreground">{totalTva || '-'} DH</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Total TTC</span>
                <span className="text-base font-semibold text-foreground">{totalTtc || '-'} DH</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onCancel}>Annuler</Button>
            <Button onClick={() => setStep(2)}>Suivant</Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1 text-sm text-muted-foreground">
            <p>Renseignez le montant payé et la méthode de paiement.</p>
            {/* Current elements (step 2) */}
            <div className="grid gap-4 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <span>Montant payé</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.montant_paye}
                  onFocus={e => {
                    if (e.target.value === '0' || e.target.value === '0.00') {
                      setData('montant_paye', '');
                    }
                  }}
                  onChange={e => {
                    setData('montant_paye', e.target.value);
                    setTouched(t => ({ ...t, montant_paye: true }));
                  }}
                  required
                  className={(!isMontantPayeValid && touched.montant_paye) ? 'border-red-500' : ''}
                />
                {(!isMontantPayeValid && touched.montant_paye) && (
                  <div className="text-red-600 text-xs mt-1">
                    {isMontantDepasse
                      ? 'Le montant payé ne peut pas dépasser le total.'
                      : 'Le montant payé est requis.'}
                  </div>
                )}
                {errors.montant_paye && <div className="text-red-600 text-xs mt-1">{errors.montant_paye}</div>}
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Méthode de paiement</span>
                <Select
                  value={data.mode_paiement}
                  onValueChange={v => {
                    setData('mode_paiement', v);
                    setTouched(t => ({ ...t, mode_paiement: true }));
                  }}
                  required
                >
                  <SelectTrigger className="border rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background">
                    <span className={data.mode_paiement ? 'text-foreground' : 'text-muted-foreground'}>
                      {data.mode_paiement
                        ? {
                            espece: 'Espèces',
                            cheque: 'Chèque',
                            virement: 'Virement',
                          }[data.mode_paiement] || data.mode_paiement
                        : 'Sélectionner le mode de paiement'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="espece">Espèces</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                  </SelectContent>
                </Select>
                {(!isModePaiementValid && touched.mode_paiement) && (
                  <div className="text-red-600 text-xs mt-1">La méthode de paiement est requise.</div>
                )}
                {errors.mode_paiement && <div className="text-red-600 text-xs mt-1">{errors.mode_paiement}</div>}
              </div>
              {/* Cheque fields if cheque is selected */}
              {data.mode_paiement === 'cheque' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Numéro du chèque</label>
                    <Input
                      value={cheque.numero}
                      onChange={e => {
                        setCheque(c => ({ ...c, numero: e.target.value }));
                        setData('cheque_numero', e.target.value);
                      }}
                      placeholder="Numéro du chèque"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Banque</label>
                    <Input
                      value={cheque.banque}
                      onChange={e => {
                        setCheque(c => ({ ...c, banque: e.target.value }));
                        setData('cheque_banque', e.target.value);
                      }}
                      placeholder="Nom de la banque"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Date d'échéance</label>
                    <Input
                      type="date"
                      value={cheque.echeance}
                      onChange={e => {
                        setCheque(c => ({ ...c, echeance: e.target.value }));
                        setData('cheque_echeance', e.target.value);
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Titulaire</label>
                    <Input
                      value={cheque.titulaire}
                      onChange={e => {
                        setCheque(c => ({ ...c, titulaire: e.target.value }));
                        setData('cheque_titulaire', e.target.value);
                      }}
                      placeholder="Titulaire du chèque"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1">Fichier du chèque</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        setData('cheque_file', file);
                      }}
                      className="block w-full border rounded-md px-3 py-2 text-sm bg-background mt-1"
                    />
                    {errors?.cheque_file && <div className="text-red-600 text-xs mt-1">{errors.cheque_file}</div>}
                  </div>
                </div>
              )}
              {data.mode_paiement === 'virement' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Référence du virement</label>
                    <Input
                      value={virement?.reference || ''}
                      onChange={e => {
                        const value = e.target.value;
                        setVirement(v => ({ ...v, reference: value }));
                        setData('virement_reference', value);
                      }}
                      placeholder="Référence bancaire"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Date du virement</label>
                    <Input
                      type="date"
                      value={virement?.transfer_date || ''}
                      onChange={e => {
                        const value = e.target.value;
                        setVirement(v => ({ ...v, transfer_date: value }));
                        setData('virement_transfer_date', value);
                      }}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1">Fichier du virement</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        setVirement(v => ({ ...v, file }));
                        setData('virement_file', file);
                      }}
                      className="block w-full border rounded-md px-3 py-2 text-sm bg-background mt-1"
                      required
                    />
                    {errors?.virement_file && <div className="text-red-600 text-xs mt-1">{errors.virement_file}</div>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1">Note</label>
                    <Input
                      value={virement?.note || ''}
                      onChange={e => {
                        const value = e.target.value;
                        setVirement(v => ({ ...v, note: value }));
                        setData('virement_note', value);
                      }}
                      placeholder="Note (optionnel)"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
            <Button
              onClick={() => {
                setTouched(t => ({ ...t, montant_paye: true, mode_paiement: true }));
                if (isMontantPayeValid && isModePaiementValid) onConfirm();
              }}
              disabled={!isMontantPayeValid || !isModePaiementValid}
            >
              Confirmer
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
