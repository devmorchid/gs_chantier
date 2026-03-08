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
        $tomorrow = Carbon::tomorrow();
        $cheques = Cheque::where('status', 'en_attente')
            ->whereDate('due_date', $tomorrow)
            ->get();

        $cheques_a_encaisser = $cheques->where('direction', 'in');
        $cheques_a_payer = $cheques->where('direction', 'out');

        return Inertia::render('cheques/notifications', [
            'cheques_a_encaisser' => $cheques_a_encaisser,
            'cheques_a_payer' => $cheques_a_payer,
        ]);
    }
}
