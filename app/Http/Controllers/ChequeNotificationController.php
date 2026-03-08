<?php
namespace App\Http\Controllers;

use App\Models\Cheque;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChequeNotificationController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $dans7jours = $now->copy()->addDays(7);

        // Chèques en attente arrivant à échéance (précédemment échus + 7 prochains jours)
        $cheques = Cheque::where('status', 'en_attente')
            ->where('due_date', '<=', $dans7jours->toDateString())
            ->orderBy('due_date')
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'cheque_number' => $c->cheque_number,
                'bank_name' => $c->bank_name,
                'amount' => $c->amount,
                'direction' => $c->direction,
                'type_label' => $c->type_label,
                'beneficiaire' => $c->beneficiaire,
                'motif' => $c->motif,
                'due_date' => $c->due_date?->format('d/m/Y'),
                'jours_restants' => (int) $now->diffInDays($c->due_date, false),
                'en_retard' => $c->due_date->isPast(),
            ]);

        $cheques_a_encaisser = $cheques->where('direction', 'encaissement')->values();
        $cheques_a_payer = $cheques->where('direction', 'decaissement')->values();

        return Inertia::render('cheques/notifications', [
            'cheques_a_encaisser' => $cheques_a_encaisser,
            'cheques_a_payer' => $cheques_a_payer,
            'total_alertes' => $cheques->count(),
        ]);
    }
}
