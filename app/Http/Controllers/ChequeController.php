<?php

namespace App\Http\Controllers;

use App\Models\Cheque;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChequeController extends Controller
{
    /**
     * Suivi des chèques (index page with table + filters)
     */
    public function index(Request $request)
    {
        $query = Cheque::query();

        // Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('cheque_number', 'like', "%{$search}%")
                    ->orWhere('bank_name', 'like', "%{$search}%")
                    ->orWhere('beneficiaire', 'like', "%{$search}%")
                    ->orWhere('titulaire', 'like', "%{$search}%");
            });
        }

        if ($request->filled('direction')) {
            $query->where('direction', $request->direction);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('source_type')) {
            $query->where('source_type', $request->source_type);
        }

        $cheques = $query->orderByDesc('created_at')->paginate(15);

        $cheques->getCollection()->transform(fn($cheque) => [
            'id' => $cheque->id,
            'cheque_number' => $cheque->cheque_number,
            'bank_name' => $cheque->bank_name,
            'amount' => $cheque->amount,
            'direction' => $cheque->direction,
            'type_label' => $cheque->type_label,
            'status' => $cheque->status,
            'status_label' => $cheque->status_label,
            'source_type' => $cheque->source_type,
            'source_label' => $cheque->source_label,
            'source_id' => $cheque->source_id,
            'beneficiaire' => $cheque->beneficiaire,
            'titulaire' => $cheque->titulaire,
            'motif' => $cheque->motif,
            'issue_date' => $cheque->issue_date?->format('d/m/Y'),
            'due_date' => $cheque->due_date?->format('d/m/Y'),
            'created_at' => $cheque->created_at->format('d/m/Y'),
        ]);

        return Inertia::render('cheques/index', [
            'cheques' => $cheques,
            'types' => Cheque::TYPES,
            'statuts' => Cheque::STATUS,
            'source_types' => Cheque::SOURCE_TYPES,
            'filters' => $request->only(['search', 'direction', 'status', 'source_type']),
            'alertes' => Cheque::where('status', 'en_attente')
                ->where('due_date', '<=', now()->addDays(7)->toDateString())
                ->count(),
        ]);
    }

    /**
     * Dashboard with statistics
     */
    public function dashboard()
    {
        $now = Carbon::now();

        $stats = [
            'a_encaisser' => Cheque::where('direction', 'encaissement')
                ->where('status', 'en_attente')->count(),
            'a_payer' => Cheque::where('direction', 'decaissement')
                ->where('status', 'en_attente')->count(),
            'en_attente' => Cheque::where('status', 'en_attente')->count(),
            'rejetes' => Cheque::where('status', 'rejete')->count(),
            'total_encaisse_mois' => Cheque::where('direction', 'encaissement')
                ->where('status', 'encaisse')
                ->whereMonth('due_date', $now->month)
                ->whereYear('due_date', $now->year)
                ->sum('amount'),
            'total_decaisse_mois' => Cheque::where('direction', 'decaissement')
                ->where('status', 'encaisse')
                ->whereMonth('due_date', $now->month)
                ->whereYear('due_date', $now->year)
                ->sum('amount'),
            'montant_en_attente_encaissement' => Cheque::where('direction', 'encaissement')
                ->where('status', 'en_attente')
                ->sum('amount'),
            'montant_en_attente_decaissement' => Cheque::where('direction', 'decaissement')
                ->where('status', 'en_attente')
                ->sum('amount'),
        ];

        // Chèques arrivant à échéance (7 prochains jours)
        $echeances = Cheque::where('status', 'en_attente')
            ->whereBetween('due_date', [$now->toDateString(), $now->copy()->addDays(7)->toDateString()])
            ->orderBy('due_date')
            ->get()
            ->map(fn($cheque) => [
                'id' => $cheque->id,
                'cheque_number' => $cheque->cheque_number,
                'bank_name' => $cheque->bank_name,
                'amount' => $cheque->amount,
                'direction' => $cheque->direction,
                'type_label' => $cheque->type_label,
                'status' => $cheque->status,
                'beneficiaire' => $cheque->beneficiaire,
                'due_date' => $cheque->due_date?->format('d/m/Y'),
                'jours_restants' => $now->diffInDays($cheque->due_date, false),
            ]);

        return Inertia::render('cheques/dashboard', [
            'stats' => $stats,
            'echeances' => $echeances,
        ]);
    }

    /**
     * Update cheque status
     */
    public function updateStatut(Request $request, Cheque $cheque)
    {
        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Cheque::STATUS)),
            'notes' => 'nullable|string|max:500',
        ]);

        $cheque->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $cheque->notes,
        ]);

        return back()->with('success', 'Statut du chèque mis à jour.');
    }

    /**
     * Delete cheque
     */
    public function destroy(Cheque $cheque)
    {
        $cheque->delete();

        return back()->with('success', 'Chèque supprimé.');
    }
}
