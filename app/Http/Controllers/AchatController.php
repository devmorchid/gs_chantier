<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\AchatItem;
use App\Models\CompanySetting;
use App\Models\Fournisseur;
use App\Models\Produit;
use App\Models\ProductCategory;
use App\Models\Stock;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AchatController extends Controller
{
	public function index(Request $request)
	{
		$filters = $request->only(['reference', 'fournisseur', 'date_from', 'date_to', 'statut']);

		$query = Achat::query()
			->with(['fournisseur:id,name', 'user:id,name'])
			->when($filters['reference'] ?? null, function ($q, $reference) {
				$q->where('reference', 'like', '%' . $reference . '%');
			})
			->when($filters['fournisseur'] ?? null, function ($q, $fournisseur) {
				$q->whereHas('fournisseur', function ($sub) use ($fournisseur) {
					$sub->where('name', 'like', '%' . $fournisseur . '%');
				});
			})
			->when($filters['date_from'] ?? null, function ($q, $from) {
				$q->whereDate('date', '>=', $from);
			})
			->when($filters['date_to'] ?? null, function ($q, $to) {
				$q->whereDate('date', '<=', $to);
			})
			->when($filters['statut'] ?? null, function ($q, $statut) {
				$q->where('statut', $statut);
			})
			->orderByDesc('date');

		$achats = $query->paginate(20)->withQueryString();
		$achats->getCollection()->transform(fn (Achat $achat) => [
			'id' => $achat->id,
			'reference' => $achat->reference,
			'date' => $achat->date?->format('d/m/Y'),
			'fournisseur' => $achat->fournisseur?->name,
			'user' => $achat->user?->name,
			'total_ttc' => (float) $achat->total_ttc,
			'statut' => $achat->statut,
		]);

		$fournisseurOptions = Fournisseur::orderBy('name')->pluck('name');

		return Inertia::render('achats/index', [
			'achats' => $achats,
			'filters' => $filters,
			'fournisseurOptions' => $fournisseurOptions,
			'statuts' => \App\Models\Achat::STATUTS,
		]);
	}

	public function create()
	{
		$stockByProduit = Stock::query()
			->where('location_type', 'depot')
			->whereNull('chantier_id')
			->pluck('quantite', 'produit_id');

		$produits = Produit::orderBy('name')
			->get(['id', 'name', 'prix_achat', 'prix_vente', 'code_barre'])
			->map(function ($produit) use ($stockByProduit) {
				return [
					'id' => $produit->id,
					'name' => $produit->name,
					'prix_achat' => $produit->prix_achat,
					'prix_vente' => $produit->prix_vente,
					'code_barre' => $produit->code_barre,
					'quantite' => (int) ($stockByProduit[$produit->id] ?? 0),
					'stock' => (int) ($stockByProduit[$produit->id] ?? 0),
				];
			});
		$categories = ProductCategory::orderBy('name')->get(['id', 'name']);
		$fournisseurs = Fournisseur::orderBy('name')->get(['id', 'name']);

		return Inertia::render('achats/create', [
			'produits' => $produits,
			'categories' => $categories,
			'fournisseurs' => $fournisseurs,
		]);
	}

	public function store(Request $request)
	{
		$validated = $request->validate([
			'date' => 'required|date',
			'fournisseur_id' => 'nullable|exists:fournisseurs,id',
			'remise' => 'nullable|numeric|min:0',
			'tva_rate' => 'nullable|numeric|min:0',
			'notes' => 'nullable|string',
			'montant_paye' => 'required|numeric|min:0',
			'mode_paiement' => 'required|string',
			'cheque_numero' => 'nullable|string',
			'cheque_banque' => 'nullable|string',
			'cheque_echeance' => 'nullable|date',
			'cheque_titulaire' => 'nullable|string',
			'cheque_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif,webp',
			// Virement fields
			'virement_reference' => 'nullable|string',
			'virement_transfer_date' => 'nullable|date',
			'virement_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif,webp',
			'virement_note' => 'nullable|string',
			'items' => 'required|array|min:1',
			'items.*.mode' => 'required|in:existing,new',
			'items.*.produit_id' => 'nullable|exists:produits,id',
			'items.*.quantite' => 'required|integer|min:1',
			'items.*.prix_achat' => 'required|numeric|min:0',
		]);

		$items = collect($validated['items'])->map(function ($item, int $index) use ($request) {
			$item['new_produit'] = $request->input("items.$index.new_produit", []);
			return $item;
		});
		$preparedItems = [];

		foreach ($items as $index => $item) {
			if ($item['mode'] === 'existing') {
				if (empty($item['produit_id'])) {
					throw ValidationException::withMessages([
						"items.$index.produit_id" => 'Produit requis.',
					]);
				}
				$produit = Produit::find($item['produit_id']);
				if ($produit && (float) $item['prix_achat'] > (float) $produit->prix_vente) {
					throw ValidationException::withMessages([
						"items.$index.prix_achat" => 'Le prix d\'achat ne peut pas dépasser le prix de vente du produit.',
					]);
				}
				if ($produit) {
					$produit->update([
						'prix_achat' => $item['prix_achat'],
						'fournisseur_id' => $validated['fournisseur_id'] ?? $produit->fournisseur_id,
					]);
				}
			} else {
				$new = $item['new_produit'] ?? [];
				$missing = [];
				if (empty($new['name'])) {
					$missing["items.$index.new_produit.name"] = 'Nom requis.';
				}
				if (empty($new['code_barre'])) {
					$missing["items.$index.new_produit.code_barre"] = 'Code barre requis.';
				}
				if (!isset($new['prix_vente']) || $new['prix_vente'] === '') {
					$missing["items.$index.new_produit.prix_vente"] = 'Prix de vente requis.';
				}
				if (!empty($new['prix_vente']) && (float) $item['prix_achat'] > (float) $new['prix_vente']) {
					$missing["items.$index.prix_achat"] = 'Le prix d\'achat ne peut pas dépasser le prix de vente.';
				}
				if (!empty($missing)) {
					throw ValidationException::withMessages($missing);
				}

				$produit = Produit::create([
					'code_barre' => $new['code_barre'],
					'name' => $new['name'],
					'category_id' => $new['category_id'] ?? null,
					'prix_achat' => $item['prix_achat'],
					'prix_vente' => $new['prix_vente'],
					'fournisseur_id' => $new['fournisseur_id'] ?? ($validated['fournisseur_id'] ?? null),
					'image' => null,
				]);
			}

			$preparedItems[] = [
				'produit_id' => $produit->id,
				'quantite' => (int) $item['quantite'],
				'prix_achat' => (float) $item['prix_achat'],
			];
		}

		$totalHt = collect($preparedItems)->sum(fn ($item) => $item['prix_achat'] * $item['quantite']);
		$remise = (float) ($validated['remise'] ?? 0);
		$tvaRate = (float) ($validated['tva_rate'] ?? 0);
		$baseTva = max($totalHt - $remise, 0);
		$totalTva = $baseTva * ($tvaRate / 100);
		$totalTtc = $baseTva + $totalTva;

		DB::transaction(function () use ($request, $validated, $preparedItems, $totalHt, $remise, $tvaRate, $totalTva, $totalTtc) {
			$achat = Achat::create([
				'user_id' => $request->user()->id,
				'fournisseur_id' => $validated['fournisseur_id'] ?? null,
				'date' => $validated['date'],
				'remise' => $remise,
				'tva_rate' => $tvaRate,
				'total_ht' => $totalHt,
				'total_tva' => $totalTva,
				'total_ttc' => $totalTtc,
				'notes' => $validated['notes'] ?? null,
				'mode_paiement' => $validated['mode_paiement'] ?? null,
			]);

			// Save initial payment in suivie_achat
			if ($validated['montant_paye'] > 0) {
				$filePath = null;
				$folder = 'paiements_achats';
				$storage = \Storage::disk('public');
				if (!$storage->exists($folder)) {
					$storage->makeDirectory($folder);
				}
				// Handle cheque file
				if ($request->hasFile('cheque_file')) {
					$filePath = $request->file('cheque_file')->store($folder, 'public');
				}
				// Handle virement file (overrides cheque file if both present, but UI only allows one)
				if ($request->hasFile('virement_file')) {
					$filePath = $request->file('virement_file')->store($folder, 'public');
				}
				$achat->suivieAchats()->create([
					'user_id' => $request->user()->id,
					'montant' => $validated['montant_paye'],
					'mode_paiement' => $validated['mode_paiement'] ?? 'initial',
					'date_paiement' => now(),
					'file' => $filePath,
				]);
				// Insert cheque info if mode_paiement is cheque
				if (($validated['mode_paiement'] ?? '') === 'cheque') {
					\App\Models\Cheque::create([
						'direction' => 'out',
						'source_type' => 'achat',
						'source_id' => $achat->fournisseur_id,
						'bank_name' => $validated['cheque_banque'] ?? '',
						'cheque_number' => $validated['cheque_numero'] ?? '',
						'amount' => $validated['montant_paye'],
						'issue_date' => now()->toDateString(),
						'due_date' => $validated['cheque_echeance'] ?? now()->toDateString(),
						'status' => 'en_attente',
					]);
				}
				// Insert virement info if mode_paiement is virement
				if (($validated['mode_paiement'] ?? '') === 'virement') {
					\App\Models\Virement::create([
						'direction' => 'out',
						'source_type' => 'achat',
						'source_id' => $achat->id,
						'reference' => $validated['virement_reference'] ?? '',
						'amount' => $validated['montant_paye'],
						'transfer_date' => $validated['virement_transfer_date'] ?? now()->toDateString(),
						'status' => 'en_attente',
						'note' => $validated['virement_note'] ?? '',
					]);
				}
			}

			$achat->items()->createMany($preparedItems);

			foreach ($preparedItems as $item) {
				$stock = Stock::firstOrCreate(
					[
						'produit_id' => $item['produit_id'],
						'location_type' => 'depot',
						'chantier_id' => null,
					],
					['quantite' => 0]
				);

				$stock->quantite += $item['quantite'];
				$stock->save();
			}
		});

		return redirect()->route('achats.index')->with('success', 'Achat enregistré avec succès.');
	}

	public function show(Achat $achat)
	{
		$achat->load(['fournisseur:id,name', 'user:id,name', 'items.produit:id,name']);

		return Inertia::render('achats/show', [
			'achat' => [
				       'id' => $achat->id,
				       'reference' => $achat->reference,
				       'date' => $achat->date?->format('d/m/Y'),
				       'fournisseur' => $achat->fournisseur?->name,
				       'user' => $achat->user?->name,
				       'remise' => (float) $achat->remise,
				       'tva_rate' => (float) $achat->tva_rate,
				       'total_ht' => (float) $achat->total_ht,
				       'total_tva' => (float) $achat->total_tva,
				       'total_ttc' => (float) $achat->total_ttc,
				       // Calculate montant_paye and reste_a_payer from suivieAchats
				       'montant_paye' => (float) $achat->suivieAchats->sum('montant'),
				       'reste_a_payer' => max((float) $achat->total_ttc - (float) $achat->suivieAchats->sum('montant'), 0),
				       'notes' => $achat->notes,
				       'items' => $achat->items->map(fn (AchatItem $item) => [
					       'id' => $item->id,
					       'produit' => $item->produit?->name,
					       'quantite' => $item->quantite,
					       'prix_achat' => (float) $item->prix_achat,
				       ]),
				       // Pass paiements for frontend table
				       'paiements' => $achat->suivieAchats->map(fn ($p) => [
					   'id' => $p->id,
					   'montant' => (float) $p->montant,
					   'mode_paiement' => $p->mode_paiement,
					   'date_paiement' => $p->date_paiement ? date('d/m/Y', strtotime($p->date_paiement)) : null,
					   'user' => $p->user?->name,
					   'file' => $p->file,
				       ]),
			],
		]);

	}

	public function paiement(Request $request, Achat $achat)
	{
		$validated = $request->validate([
			'montant' => 'required|numeric|min:0.01',
			'mode_paiement' => 'required|string',
			   'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif,webp',
			   // Chèque fields
			   'cheque_numero' => 'nullable|string',
			   'cheque_banque' => 'nullable|string',
			   'cheque_echeance' => 'nullable|date',
			   'cheque_titulaire' => 'nullable|string',
			   // Virement fields
			   'reference' => 'nullable|string',
			   'virement_transfer_date' => 'nullable|date',
			   'virement_note' => 'nullable|string',
		]);
		$montant = (float) $validated['montant'];
		$filePath = null;
		if ($request->hasFile('file')) {
			$filePath = $request->file('file')->store('paiements_achats', 'public');
		}
		$suivieAchat = $achat->suivieAchats()->create([
			'user_id' => $request->user()->id,
			'montant' => $montant,
			'mode_paiement' => $validated['mode_paiement'] ?? 'autre',
			'date_paiement' => now(),
			'file' => $filePath,
		]);

		// Mettre à jour le statut de l'achat selon le reste à payer
		$achat->refresh();
		$totalPaye = $achat->suivieAchats->sum('montant');
		$reste = max((float)$achat->total_ttc - $totalPaye, 0);
		if ($reste == 0) {
			$achat->statut = 'paye';
		} elseif ($totalPaye > 0) {
			$achat->statut = 'partiel';
		} else {
			$achat->statut = 'en_attente';
		}
		$achat->save();

			   // Si mode_paiement = cheque, enregistrer dans cheques (aligné avec store)
			   if ($validated['mode_paiement'] === 'cheque') {
				   \App\Models\Cheque::create([
					   'direction' => 'out', // achat = paiement fournisseur
					   'source_type' => 'achat',
					   'source_id' => $achat->fournisseur_id, // aligné avec store()
					   'bank_name' => $validated['cheque_banque'] ?? '',
					   'cheque_number' => $validated['cheque_numero'] ?? '',
					   'amount' => $montant,
					   'issue_date' => now()->toDateString(),
					   'due_date' => $validated['cheque_echeance'] ?? now()->toDateString(),
					   'status' => 'en_attente',
					   'titulaire' => $validated['cheque_titulaire'] ?? null,
				   ]);
			   }

			   // Si mode_paiement = virement, enregistrer dans virements (aligné avec store)
			   if ($validated['mode_paiement'] === 'virement') {
				   \App\Models\Virement::create([
					   'direction' => 'out',
					   'source_type' => 'achat',
					   'source_id' => $achat->id,
					   'reference' => $validated['reference'] ?? '',
					   'amount' => $montant,
					   'transfer_date' => $validated['virement_transfer_date'] ?? now()->toDateString(),
					   'status' => 'en_attente',
					   'note' => $validated['virement_note'] ?? '',
				   ]);
			   }
		return redirect()->route('achats.show', $achat->id)->with('success', 'Paiement enregistré.');
	}

	public function pdf(Achat $achat)
	{
		$achat->load(['fournisseur', 'user', 'items.produit']);
		$company = CompanySetting::getSettings();

		$pdf = Pdf::loadView('pdf.achat', [
			'achat' => $achat,
			'company' => $company,
		]);

		$fileName = 'achat-' . $achat->reference . '.pdf';

		return response($pdf->output(), 200)
			->header('Content-Type', 'application/pdf')
			->header('Content-Disposition', 'inline; filename="' . $fileName . '"');
	}
}
