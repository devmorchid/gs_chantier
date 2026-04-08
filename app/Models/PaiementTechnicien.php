<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaiementTechnicien extends Model
{
    protected $table = 'paiements_techniciens';

    protected $fillable = [
        'technicien_id', 'chantier_id', 'periode',
        'jours_travailles', 'salaire_journalier',
        'salaire_brut', 'total_avances', 'total_deductions', 'total_primes',
        'net_a_payer', 'montant_paye', 'reste_a_payer',
        'statut', 'mode_paiement', 'date_paiement', 'notes', 'created_by',
        // Chèque
        'cheque_numero', 'cheque_date_echeance', 'cheque_banque', 'cheque_image',
        // Virement
        'virement_reference', 'virement_banque',
        // Transfert mobile
        'transfert_numero', 'transfert_service',
    ];

    protected $casts = [
        'date_paiement'         => 'date',
        'cheque_date_echeance'  => 'date',
        'salaire_journalier'    => 'decimal:2',
        'salaire_brut'          => 'decimal:2',
        'total_avances'         => 'decimal:2',
        'total_deductions'      => 'decimal:2',
        'total_primes'          => 'decimal:2',
        'net_a_payer'           => 'decimal:2',
        'montant_paye'          => 'decimal:2',
        'reste_a_payer'         => 'decimal:2',
    ];

    public const STATUTS = [
        'non_paye'           => 'Non payé',
        'partiellement_paye' => 'Partiellement payé',
        'paye'               => 'Payé',
    ];

    public const MODES_PAIEMENT = [
        'especes'    => 'Espèces',
        'cheque'     => 'Chèque',
        'virement'   => 'Virement',
        'wafa_cash'  => 'Wafa Cash',
        'cash_plus'  => 'Cash Plus',
        'autre'      => 'Autre',
    ];

    public const TRANSFERT_SERVICES = [
        'wafa_cash'  => 'Wafa Cash',
        'cash_plus'  => 'Cash Plus',
    ];

    public function getStatutLabelAttribute(): string
    {
        return self::STATUTS[$this->statut] ?? $this->statut;
    }

    public function technicien()
    {
        return $this->belongsTo(Technicien::class);
    }

    public function chantier()
    {
        return $this->belongsTo(Chantier::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
