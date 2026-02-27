<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(Request $request, Facture $facture)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'reference' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'cheque_number' => 'nullable|string',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif,webp|max:4096',
        ]);

        DB::transaction(function () use ($facture, $data, $request) {
            $paymentData = array_merge($data, [
                'facture_id' => $facture->id,
                'user_id' => $request->user()->id,
            ]);
            if ($request->hasFile('file')) {
                $path = $request->file('file')->store('paiements', 'public');
                $paymentData['file'] = $path;
            }
            $payment = Payment::create($paymentData);

            // Si payment_method = cheque, enregistrer dans cheques
            if ($data['payment_method'] === 'cheque') {
                \App\Models\Cheque::create([
                    'direction' => 'in',
                    'source_type' => 'facture',
                    'source_id' => $facture->id,
                    'bank_name' => $data['bank_name'] ?? '',
                    'cheque_number' => $data['cheque_number'] ?? '',
                    'amount' => $data['amount'],
                    'issue_date' => $data['payment_date'],
                    'due_date' => $data['payment_date'],
                    'status' => 'en_attente',
                ]);
            }

            // Recalculer les montants
            $totalPaid = $facture->payments()->sum('amount') + $data['amount'];
            $facture->paid_amount = $totalPaid;
            $facture->total_amount = $facture->total_ttc;
            $facture->remaining_amount = max(0, $facture->total_ttc - $totalPaid);
            if ($facture->remaining_amount <= 0) {
                $facture->status = 'paid';
            } elseif ($facture->paid_amount > 0) {
                $facture->status = 'partial';
            } else {
                $facture->status = 'unpaid';
            }
            $facture->save();
        });

        return back()->with('success', 'Paiement enregistré avec succès.');
    }
}
