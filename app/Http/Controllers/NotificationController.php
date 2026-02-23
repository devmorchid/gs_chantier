<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Stock;
use App\Models\StockMouvement;
use App\Models\StockTransferRequest;
use App\Notifications\ChargeDecisionNotification;
use App\Notifications\ChargeSubmittedNotification;
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
        $tab = $request->string('tab')->toString();
        if (!in_array($tab, ['all', 'incoming', 'outgoing', 'charge'], true)) {
            $tab = 'all';
        }

        $incomingRequestedLimit = max(3, min((int) $request->integer('incoming_limit', 12), 5000));
        $outgoingRequestedLimit = max(3, min((int) $request->integer('outgoing_limit', 12), 5000));
        $chargeRequestedLimit = max(3, min((int) $request->integer('charge_limit', 20), 5000));

        $incomingLimit = in_array($tab, ['all', 'incoming'], true) ? $incomingRequestedLimit : 3;
        $outgoingLimit = in_array($tab, ['all', 'outgoing'], true) ? $outgoingRequestedLimit : 3;
        $chargeLimit = in_array($tab, ['all', 'charge'], true) ? $chargeRequestedLimit : 3;

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

        $incomingTotal = 0;
        $incomingRequests = collect();
        if ($destinationChantierIds->isNotEmpty()) {
            $incomingTotal = (clone $baseQuery)
                ->where('status', 'pending')
                ->whereIn('destination_chantier_id', $destinationChantierIds)
                ->orderByDesc('created_at')
                ->count();

            $incomingRequests = (clone $baseQuery)
                ->where('status', 'pending')
                ->whereIn('destination_chantier_id', $destinationChantierIds)
                ->orderByDesc('created_at')
                ->limit($incomingLimit)
                ->get();
        }

        $outgoingTotal = (clone $baseQuery)
            ->where('requester_id', $user->id)
            ->orderByDesc('created_at')
            ->count();

        $outgoingRequests = (clone $baseQuery)
            ->where('requester_id', $user->id)
            ->orderByDesc('created_at')
            ->limit($outgoingLimit)
            ->get();

        if ($outgoingTotal > 0) {
            StockTransferRequest::query()
                ->where('requester_id', $user->id)
                ->whereIn('status', ['approved', 'rejected'])
                ->whereNull('requester_read_at')
                ->update(['requester_read_at' => now()]);
        }

        $chargeQuery = $user->notifications()
            ->whereIn('type', [
                ChargeSubmittedNotification::class,
                ChargeDecisionNotification::class,
            ]);

        $chargeTotal = (clone $chargeQuery)->count();

        $chargeNotifications = (clone $chargeQuery)
            ->latest()
            ->limit($chargeLimit)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'type' => $notification->type,
                'is_read' => $notification->read_at !== null,
                'created_at' => $notification->created_at?->format('d/m/Y H:i'),
                'title' => data_get($notification->data, 'title', 'Notification charge'),
                'message' => data_get($notification->data, 'message', ''),
                'status' => data_get($notification->data, 'status'),
                'rejection_reason' => data_get($notification->data, 'rejection_reason'),
                'is_resubmission' => (bool) data_get($notification->data, 'is_resubmission', false),
                'charge_reference' => data_get($notification->data, 'charge_reference'),
                'url' => data_get($notification->data, 'url'),
            ]);

        $user->unreadNotifications()
            ->whereIn('type', [
                ChargeSubmittedNotification::class,
                ChargeDecisionNotification::class,
            ])
            ->update(['read_at' => now()]);

        return Inertia::render('notifications/index', [
            'incomingRequests' => $incomingRequests,
            'outgoingRequests' => $outgoingRequests,
            'chargeNotifications' => $chargeNotifications,
            'activeTab' => $tab,
            'meta' => [
                'incoming' => [
                    'shown' => $incomingRequests->count(),
                    'total' => $incomingTotal,
                    'limit' => $incomingLimit,
                    'has_more' => $incomingTotal > $incomingRequests->count(),
                ],
                'outgoing' => [
                    'shown' => $outgoingRequests->count(),
                    'total' => $outgoingTotal,
                    'limit' => $outgoingLimit,
                    'has_more' => $outgoingTotal > $outgoingRequests->count(),
                ],
                'charge' => [
                    'shown' => $chargeNotifications->count(),
                    'total' => $chargeTotal,
                    'limit' => $chargeLimit,
                    'has_more' => $chargeTotal > $chargeNotifications->count(),
                ],
            ],
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
