<?php
namespace App\Http\Controllers;

use App\Models\Technicien;
use App\Models\Chantier;
use App\Models\Pointage;
use App\Models\AvanceTechnicien;
use App\Models\Deduction;
use App\Models\Prime;
use App\Models\PaiementTechnicien;
use App\Models\ChantierTechnicien;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class PaiementTechnicienController extends Controller
{
    // ─── helpers ────────────────────────────────────────────────────────────────

    private function scopeChantierIds($user)
    {
        $q = Chantier::query();
        if ($user->hasRole('chef_chantier')) {
            $q->where('user_id', $user->id);
        }
        return $q->pluck('id');
    }

    private function getSalaireJournalier(Technicien $t, $chantierId): float
    {
        if ($chantierId) {
            $pivot = ChantierTechnicien::where('technicien_id', $t->id)
                ->where('chantier_id', $chantierId)
                ->first();
            if ($pivot && $pivot->salaire_journalier) {
                return (float) $pivot->salaire_journalier;
            }
        }
        return (float) ($t->salaire_journalier ?? 0);
    }

    private function calcFichePaie(Technicien $t, int $month, int $year, $chantierId = null): array
    {
        $user = auth()->user();
        $chantierScope = $chantierId
            ? collect([$chantierId])
            : $this->scopeChantierIds($user);

        $pointages = Pointage::where('technicien_id', $t->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->whereIn('chantier_id', $chantierScope)
            ->get();

        $joursDistincts = $pointages->pluck('date')->map(fn($d) => $d->format('Y-m-d'))->unique()->count();
        $totalHeures    = $pointages->sum(fn($p) => round(abs($p->check_out->diffInMinutes($p->check_in)) / 60, 2));

        $salaire_j = $this->getSalaireJournalier($t, $chantierId);
        $salaireBrut = $salaire_j * $joursDistincts;

        $avancesQ = AvanceTechnicien::where('technicien_id', $t->id)
            ->whereMonth('date', $month)->whereYear('date', $year)
            ->where('statut', 'approuve');
        if ($chantierId) $avancesQ->where('chantier_id', $chantierId);
        $totalAvances = (float) $avancesQ->sum('montant');

        $deductionsQ = Deduction::where('technicien_id', $t->id)
            ->whereMonth('date', $month)->whereYear('date', $year);
        if ($chantierId) $deductionsQ->where('chantier_id', $chantierId);
        $totalDeductions = (float) $deductionsQ->sum('montant');

        $primesQ = Prime::where('technicien_id', $t->id)
            ->whereMonth('date', $month)->whereYear('date', $year);
        if ($chantierId) $primesQ->where('chantier_id', $chantierId);
        $totalPrimes = (float) $primesQ->sum('montant');

        $netAPayer = $salaireBrut + $totalPrimes - $totalAvances - $totalDeductions;

        $paiement = PaiementTechnicien::where('technicien_id', $t->id)
            ->where('periode', sprintf('%04d-%02d', $year, $month))
            ->when($chantierId, fn($q) => $q->where('chantier_id', $chantierId))
            ->first();

        $montantPaye   = $paiement ? (float) $paiement->montant_paye : 0;
        $resteAPayer   = $paiement ? (float) $paiement->reste_a_payer : $netAPayer;
        $statut        = $paiement ? $paiement->statut : 'non_paye';

        return [
            'jours_travailles'  => $joursDistincts,
            'total_heures'      => round($totalHeures, 1),
            'salaire_journalier'=> $salaire_j,
            'salaire_brut'      => round($salaireBrut, 2),
            'total_avances'     => round($totalAvances, 2),
            'total_deductions'  => round($totalDeductions, 2),
            'total_primes'      => round($totalPrimes, 2),
            'net_a_payer'       => round($netAPayer, 2),
            'montant_paye'      => round($montantPaye, 2),
            'reste_a_payer'     => round($resteAPayer, 2),
            'statut'            => $statut,
            'paiement_id'       => $paiement?->id,
            'mode_paiement'     => $paiement?->mode_paiement,
            'mode_paiement_label' => $paiement ? (PaiementTechnicien::MODES_PAIEMENT[$paiement->mode_paiement] ?? $paiement->mode_paiement) : null,
            // Chèque
            'cheque_numero'        => $paiement?->cheque_numero,
            'cheque_date_echeance' => $paiement?->cheque_date_echeance?->format('d/m/Y'),
            'cheque_banque'        => $paiement?->cheque_banque,
            'cheque_image'         => $paiement?->cheque_image,
            // Virement
            'virement_reference'   => $paiement?->virement_reference,
            'virement_banque'      => $paiement?->virement_banque,
            // Transfert mobile
            'transfert_numero'     => $paiement?->transfert_numero,
            'transfert_service'    => $paiement?->transfert_service,
        ];
    }

    // ─── INDEX : tableau résumé tous les techniciens ────────────────────────────

    public function index(Request $request)
    {
        $user       = auth()->user();
        $month      = (int) $request->query('month', now()->month);
        $year       = (int) $request->query('year',  now()->year);
        $chantierId = $request->query('chantier_id');
        $search     = trim((string) $request->query('search', ''));

        $chantierIds = $this->scopeChantierIds($user);

        // Techniciens concernés
        $techQuery = Technicien::orderBy('nom');
        if ($chantierId) {
            $techQuery->whereHas('chantiers', fn($q) => $q->where('chantier_id', $chantierId));
        } elseif ($user->hasRole('chef_chantier')) {
            $techQuery->whereIn('id',
                Pointage::whereIn('chantier_id', $chantierIds)->distinct()->pluck('technicien_id')
            );
        }
        if ($search !== '') {
            $techQuery->where(fn($q) => $q->where('nom', 'like', "%{$search}%")
                                          ->orWhere('prenom', 'like', "%{$search}%"));
        }

        $techniciens = $techQuery->get()->map(function ($t) use ($month, $year, $chantierId) {
            $fiche = $this->calcFichePaie($t, $month, $year, $chantierId);
            return [
                'id'                 => $t->id,
                'nom'                => $t->nom,
                'prenom'             => $t->prenom,
                'photo'              => $t->photo_reference,
                'specialite_label'   => $t->specialite_label,
                'type_contrat'       => $t->type_contrat,
                'type_contrat_label' => $t->type_contrat_label,
                ...$fiche,
            ];
        });

        // Stats globales
        $globalStats = [
            'total_techniciens' => $techniciens->count(),
            'total_brut'        => round($techniciens->sum('salaire_brut'), 2),
            'total_avances'     => round($techniciens->sum('total_avances'), 2),
            'total_net'         => round($techniciens->sum('net_a_payer'), 2),
            'total_paye'        => round($techniciens->sum('montant_paye'), 2),
            'total_reste'       => round($techniciens->sum('reste_a_payer'), 2),
            'payes'             => $techniciens->where('statut', 'paye')->count(),
            'partiels'          => $techniciens->where('statut', 'partiellement_paye')->count(),
            'non_payes'         => $techniciens->where('statut', 'non_paye')->count(),
        ];

        $chantiers = Chantier::whereIn('id', $chantierIds)
            ->orderBy('nom')
            ->get(['id', 'nom', 'reference']);

        return Inertia::render('paiements/index', [
            'techniciens'  => $techniciens->values(),
            'stats'        => $globalStats,
            'chantiers'    => $chantiers,
            'month'        => $month,
            'year'         => $year,
            'chantier_id'  => $chantierId,
            'filters'      => ['search' => $search, 'chantier_id' => $chantierId],
            'statuts'      => PaiementTechnicien::STATUTS,
        ]);
    }

    // ─── SHOW : fiche de paie détaillée d'un technicien ────────────────────────

    public function show(Request $request, Technicien $technicien)
    {
        $user       = auth()->user();
        $month      = (int) $request->query('month', now()->month);
        $year       = (int) $request->query('year',  now()->year);
        $chantierId = $request->query('chantier_id');

        if ($user->hasRole('chef_chantier')) {
            $chantierIds = $this->scopeChantierIds($user);
            $hasAccess = Pointage::where('technicien_id', $technicien->id)
                ->whereIn('chantier_id', $chantierIds)->exists();
            if (!$hasAccess) abort(403);
        }

        $fiche = $this->calcFichePaie($technicien, $month, $year, $chantierId);

        $chantierScope = $chantierId
            ? collect([$chantierId])
            : $this->scopeChantierIds($user);

        // Détail pointages du mois
        $pointages = Pointage::where('technicien_id', $technicien->id)
            ->whereMonth('date', $month)->whereYear('date', $year)
            ->whereIn('chantier_id', $chantierScope)
            ->orderBy('date')->get()
            ->map(fn($p) => [
                'date'     => $p->date->format('d/m/Y'),
                'day'      => $p->date->locale('fr')->dayName,
                'check_in' => $p->check_in?->format('H:i'),
                'check_out'=> $p->check_out?->format('H:i'),
                'heures'   => ($p->check_in && $p->check_out)
                    ? round(abs($p->check_out->diffInMinutes($p->check_in)) / 60, 2) : 0,
                'statut'   => $p->check_out ? 'present' : ($p->check_in ? 'en_cours' : 'absent'),
            ]);

        $avances = AvanceTechnicien::where('technicien_id', $technicien->id)
            ->whereMonth('date', $month)->whereYear('date', $year)
            ->when($chantierId, fn($q) => $q->where('chantier_id', $chantierId))
            ->get()->map(fn($a) => [
                'id' => $a->id, 'montant' => $a->montant,
                'date' => $a->date->format('d/m/Y'), 'notes' => $a->notes, 'statut' => $a->statut,
            ]);

        $deductions = Deduction::where('technicien_id', $technicien->id)
            ->whereMonth('date', $month)->whereYear('date', $year)
            ->when($chantierId, fn($q) => $q->where('chantier_id', $chantierId))
            ->get()->map(fn($d) => [
                'id' => $d->id, 'montant' => $d->montant,
                'date' => $d->date->format('d/m/Y'), 'type' => $d->type_label, 'raison' => $d->raison,
            ]);

        $primes = Prime::where('technicien_id', $technicien->id)
            ->whereMonth('date', $month)->whereYear('date', $year)
            ->when($chantierId, fn($q) => $q->where('chantier_id', $chantierId))
            ->get()->map(fn($p) => [
                'id' => $p->id, 'montant' => $p->montant,
                'date' => $p->date->format('d/m/Y'), 'type' => $p->type_label, 'raison' => $p->raison,
            ]);

        $historiquePaiements = PaiementTechnicien::where('technicien_id', $technicien->id)
            ->orderByDesc('periode')->take(12)->get()
            ->map(fn($p) => [
                'id' => $p->id, 'periode' => $p->periode,
                'net_a_payer' => $p->net_a_payer, 'montant_paye' => $p->montant_paye,
                'statut' => $p->statut_label, 'statut_key' => $p->statut,
                'date_paiement' => $p->date_paiement?->format('d/m/Y'),
            ]);

        $chantiers = Chantier::whereIn('id', $this->scopeChantierIds($user))
            ->get(['id', 'nom', 'reference']);

        return Inertia::render('paiements/show', [
            'technicien'          => [
                'id'                => $technicien->id,
                'nom'               => $technicien->nom,
                'prenom'            => $technicien->prenom,
                'photo'             => $technicien->photo_reference,
                'specialite_label'  => $technicien->specialite_label,
                'type_contrat_label'=> $technicien->type_contrat_label,
                'salaire_journalier'=> $technicien->salaire_journalier,
            ],
            'fiche'               => $fiche,
            'pointages'           => $pointages,
            'avances'             => $avances,
            'deductions'          => $deductions,
            'primes'              => $primes,
            'historique_paiements'=> $historiquePaiements,
            'chantiers'           => $chantiers,
            'month'               => $month,
            'year'                => $year,
            'chantier_id'         => $chantierId,
            'types_deduction'     => Deduction::TYPES,
            'types_prime'         => Prime::TYPES,
            'modes_paiement'      => PaiementTechnicien::MODES_PAIEMENT,
        ]);
    }

    // ─── STORE AVANCE ───────────────────────────────────────────────────────────

    public function storeAvance(Request $request, Technicien $technicien)
    {
        $data = $request->validate([
            'montant'     => 'required|numeric|min:1',
            'date'        => 'required|date',
            'notes'       => 'nullable|string|max:255',
            'chantier_id' => 'nullable|exists:chantiers,id',
        ]);
        AvanceTechnicien::create([...$data, 'technicien_id' => $technicien->id,
            'statut' => 'approuve', 'created_by' => auth()->id()]);
        return back()->with('success', 'Avance enregistrée');
    }

    // ─── STORE DEDUCTION ────────────────────────────────────────────────────────

    public function storeDeduction(Request $request, Technicien $technicien)
    {
        $data = $request->validate([
            'montant'     => 'required|numeric|min:1',
            'date'        => 'required|date',
            'type'        => 'required|in:absence,retard,materiel,autre',
            'raison'      => 'nullable|string|max:255',
            'chantier_id' => 'nullable|exists:chantiers,id',
        ]);
        Deduction::create([...$data, 'technicien_id' => $technicien->id, 'created_by' => auth()->id()]);
        return back()->with('success', 'Déduction enregistrée');
    }

    // ─── STORE PRIME ────────────────────────────────────────────────────────────

    public function storePrime(Request $request, Technicien $technicien)
    {
        $data = $request->validate([
            'montant'     => 'required|numeric|min:1',
            'date'        => 'required|date',
            'type'        => 'required|in:performance,extra,anciennete,autre',
            'raison'      => 'nullable|string|max:255',
            'chantier_id' => 'nullable|exists:chantiers,id',
        ]);
        Prime::create([...$data, 'technicien_id' => $technicien->id, 'created_by' => auth()->id()]);
        return back()->with('success', 'Prime enregistrée');
    }

    // ─── PAYER (créer / mettre à jour paiement) ─────────────────────────────────

    public function payer(Request $request, Technicien $technicien)
    {
        $data = $request->validate([
            'month'           => 'required|integer|min:1|max:12',
            'year'            => 'required|integer|min:2020',
            'montant_paye'    => 'required|numeric|min:0',
            'mode_paiement'   => 'required|in:especes,virement,cheque,wafa_cash,cash_plus,autre',
            'date_paiement'   => 'required|date',
            'chantier_id'     => 'nullable|exists:chantiers,id',
            'notes'           => 'nullable|string|max:500',
            // Chèque
            'cheque_numero'        => 'nullable|required_if:mode_paiement,cheque|string|max:50',
            'cheque_date_echeance' => 'nullable|required_if:mode_paiement,cheque|date',
            'cheque_banque'        => 'nullable|string|max:100',
            'cheque_image'         => 'nullable|image|max:5120',
            // Virement
            'virement_reference'   => 'nullable|required_if:mode_paiement,virement|string|max:100',
            'virement_banque'      => 'nullable|string|max:100',
            // Transfert mobile (Wafa Cash / Cash Plus)
            'transfert_numero'     => 'nullable|required_if:mode_paiement,wafa_cash,cash_plus|string|max:50',
        ]);

        $fiche   = $this->calcFichePaie($technicien, $data['month'], $data['year'], $data['chantier_id'] ?? null);
        $periode = sprintf('%04d-%02d', $data['year'], $data['month']);

        $paiement = PaiementTechnicien::firstOrNew([
            'technicien_id' => $technicien->id,
            'periode'       => $periode,
            'chantier_id'   => $data['chantier_id'] ?? null,
        ]);

        $totalPaye = ($paiement->exists ? (float) $paiement->montant_paye : 0) + (float) $data['montant_paye'];
        $net       = $fiche['net_a_payer'];
        $reste     = max(0, $net - $totalPaye);
        $statut    = $reste <= 0 ? 'paye' : ($totalPaye > 0 ? 'partiellement_paye' : 'non_paye');

        // Handle cheque image upload
        $chequeImagePath = $paiement->cheque_image;
        if ($request->hasFile('cheque_image')) {
            $chequeImagePath = $request->file('cheque_image')->store('cheques', 'public');
        }

        // Set transfert_service based on mode
        $transfertService = null;
        if (in_array($data['mode_paiement'], ['wafa_cash', 'cash_plus'])) {
            $transfertService = $data['mode_paiement'];
        }

        $paiement->fill([
            'jours_travailles'   => $fiche['jours_travailles'],
            'salaire_journalier' => $fiche['salaire_journalier'],
            'salaire_brut'       => $fiche['salaire_brut'],
            'total_avances'      => $fiche['total_avances'],
            'total_deductions'   => $fiche['total_deductions'],
            'total_primes'       => $fiche['total_primes'],
            'net_a_payer'        => $net,
            'montant_paye'       => $totalPaye,
            'reste_a_payer'      => $reste,
            'statut'             => $statut,
            'mode_paiement'      => $data['mode_paiement'],
            'date_paiement'      => $data['date_paiement'],
            'notes'              => $data['notes'] ?? null,
            'created_by'         => auth()->id(),
            // Chèque
            'cheque_numero'        => $data['cheque_numero'] ?? null,
            'cheque_date_echeance' => $data['cheque_date_echeance'] ?? null,
            'cheque_banque'        => $data['cheque_banque'] ?? null,
            'cheque_image'         => $chequeImagePath,
            // Virement
            'virement_reference'   => $data['virement_reference'] ?? null,
            'virement_banque'      => $data['virement_banque'] ?? null,
            // Transfert mobile
            'transfert_numero'     => $data['transfert_numero'] ?? null,
            'transfert_service'    => $transfertService,
        ])->save();

        // Auto-create cheque record if payment by cheque
        if ($data['mode_paiement'] === 'cheque') {
            \App\Models\Cheque::create([
                'direction' => 'decaissement',
                'source_type' => 'paiement_technicien',
                'source_id' => $paiement->id,
                'bank_name' => $data['cheque_banque'] ?? '',
                'cheque_number' => $data['cheque_numero'] ?? '',
                'amount' => $data['montant_paye'],
                'issue_date' => $data['date_paiement'],
                'due_date' => $data['cheque_date_echeance'] ?? $data['date_paiement'],
                'status' => 'en_attente',
                'beneficiaire' => $technicien->nom . ' ' . $technicien->prenom,
                'motif' => 'Paie ' . $technicien->nom . ' - ' . $periode,
            ]);
        }

        return back()->with('success', 'Paiement enregistré avec succès');
    }

    // ─── PDF FICHE DE PAIE ──────────────────────────────────────────────────────

    public function pdf(Request $request, Technicien $technicien)
    {
        $month      = (int) $request->query('month', now()->month);
        $year       = (int) $request->query('year',  now()->year);
        $chantierId = $request->query('chantier_id');

        $fiche = $this->calcFichePaie($technicien, $month, $year, $chantierId);

        $monthLabels = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril',
            5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Août',
            9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre',
        ];

        $company = \App\Models\CompanySetting::first();

        $pdf = Pdf::loadView('pdf.fiche-paie', [
            'technicien'  => $technicien,
            'fiche'       => $fiche,
            'month_label' => $monthLabels[$month],
            'year'        => $year,
            'company'     => $company,
        ])->setPaper('a4', 'portrait');

        $filename = "fiche-paie-{$technicien->nom}-{$year}-{$month}.pdf";
        return $pdf->stream($filename);
    }
}
