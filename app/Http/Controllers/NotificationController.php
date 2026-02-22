<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Stock;
use App\Models\StockMouvement;
use App\Models\StockTransferRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $destinationChantierIds = Chantier::where('user_id', $user->id)->pluck('id');

        $baseQuery = StockTransferRequest::query()
            ->with([
                'requester:id,name',
                'approver:id,name',
                'produit:id,name',
                'items.produit:id,name',
                'destinationChantier:id,nom,user_id',
                'destinationChantier.responsable:id,name',
                'origineChantier:id,nom',
            ]);

        $incomingRequests = collect();
        if ($destinationChantierIds->isNotEmpty()) {
            $incomingRequests = (clone $baseQuery)
                ->where('status', 'pending')
                ->whereIn('destination_chantier_id', $destinationChantierIds)
                ->orderByDesc('created_at')
                ->get();
        }

        $outgoingRequests = (clone $baseQuery)
            ->where('requester_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        if ($outgoingRequests->isNotEmpty()) {
            StockTransferRequest::query()
                ->where('requester_id', $user->id)
                ->whereIn('status', ['approved', 'rejected'])
                ->whereNull('requester_read_at')
                ->update(['requester_read_at' => now()]);
        }

        return Inertia::render('notifications/index', [
            'incomingRequests' => $incomingRequests,
            'outgoingRequests' => $outgoingRequests,
        ]);
    }

    public function approve(Request $request, StockTransferRequest $transfer)
    {
        $user = $request->user();
        $isChef = $user?->hasRole('chef_chantier');
        if ($isChef) {
            $chefChantierIds = Chantier::where('user_id', $user->id)->pluck('id');
            if (!$chefChantierIds->contains($transfer->destination_chantier_id)) {
                abort(403, 'Accès non autorisé.');
            }
        }

        if ($transfer->status !== 'pending') {
            return back();
        }

        $origine = $this->resolveLocation($transfer->origine_label, $transfer->origine_chantier_id);
        $destination = $this->resolveLocation($transfer->destination_label, $transfer->destination_chantier_id);

        $items = $transfer->items()->with('produit')->get();
        $itemsData = $items->map(fn ($item) => [
            'produit_id' => $item->produit_id,
            'quantite' => $item->quantite,
        ]);
        if ($itemsData->isEmpty()) {
            $itemsData = collect([
                [
                    'produit_id' => $transfer->produit_id,
                    'quantite' => $transfer->quantite,
                ],
            ]);
        }

        DB::transaction(function () use ($transfer, $origine, $destination, $user, $itemsData) {
            foreach ($itemsData as $item) {
                if ($origine) {
                    $this->ensureAvailable($item['produit_id'], $origine, $item['quantite']);
                    $this->adjustStock($item['produit_id'], $origine, -$item['quantite']);
                }
                $this->adjustStock($item['produit_id'], $destination, $item['quantite']);
            }

            $mouvement = StockMouvement::create([
                'produit_id' => $itemsData->first()['produit_id'],
                'type' => 'transfert',
                'origine' => $transfer->origine_label,
                'destination' => $transfer->destination_label,
                'quantite' => $itemsData->first()['quantite'],
                'date' => $transfer->date,
            ]);

            $mouvement->items()->createMany($itemsData->all());

            $transfer->update([
                'status' => 'approved',
                'approved_by_id' => $user?->id,
                'approved_at' => now(),
                'requester_read_at' => null,
            ]);
        });

        return back()->with('success', 'Transfert approuvé.');
    }

    public function reject(Request $request, StockTransferRequest $transfer)
    {
        $user = $request->user();
        $isChef = $user?->hasRole('chef_chantier');
        if ($isChef) {
            $chefChantierIds = Chantier::where('user_id', $user->id)->pluck('id');
            if (!$chefChantierIds->contains($transfer->destination_chantier_id)) {
                abort(403, 'Accès non autorisé.');
            }
        }

        if ($transfer->status !== 'pending') {
            return back();
        }

        $transfer->update([
            'status' => 'rejected',
            'approved_by_id' => $user?->id,
            'rejected_at' => now(),
            'requester_read_at' => null,
        ]);

        return back()->with('success', 'Transfert رفضé.');
    }

    private function ensureAvailable(int $produitId, array $location, int $quantite): void
    {
        $stock = Stock::firstOrCreate(
            [
                'produit_id' => $produitId,
                'location_type' => $location['type'],
                'chantier_id' => $location['chantier_id'],
            ],
            ['quantite' => 0]
        );

        if ($stock->quantite < $quantite) {
            throw ValidationException::withMessages([
                'quantite' => "Stock insuffisant pour {$location['label']}",
            ]);
        }
    }

    private function adjustStock(int $produitId, array $location, int $delta): void
    {
        $stock = Stock::firstOrCreate(
            [
                'produit_id' => $produitId,
                'location_type' => $location['type'],
                'chantier_id' => $location['chantier_id'],
            ],
            ['quantite' => 0]
        );

        $stock->quantite += $delta;
        $stock->save();
    }

    private function resolveLocation(?string $label, ?int $chantierId): ?array
    {
        if ($label === null || trim($label) === '') {
            return null;
        }

        $normalized = mb_strtolower(trim($label));
        if ($normalized === 'depot' || $normalized === 'dépôt') {
            return [
                'type' => 'depot',
                'chantier_id' => null,
                'label' => 'Depot',
            ];
        }

        $chantier = $chantierId
            ? Chantier::find($chantierId)
            : Chantier::where('nom', $label)->first();

        if (!$chantier) {
            throw ValidationException::withMessages([
                'destination' => 'Chantier introuvable: ' . $label,
            ]);
        }

        return [
            'type' => 'chantier',
            'chantier_id' => $chantier->id,
            'label' => $label,
        ];
    }
}
