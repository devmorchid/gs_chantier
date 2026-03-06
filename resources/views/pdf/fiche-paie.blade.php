<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Fiche de Paie</title>
    <style>
        @page {
            margin: 30px 40px 30px 40px;
            size: A4 portrait;
        }
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 0;
            color: #1a1a2e;
        }
        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
        }
        .company-info {
            font-size: 9px;
            color: #555;
            margin-top: 4px;
            line-height: 1.5;
        }
        .doc-title {
            text-align: right;
        }
        .doc-title h1 {
            font-size: 16px;
            margin: 0 0 4px 0;
            color: #1e3a8a;
            font-weight: bold;
        }
        .periode-badge {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
        }

        /* Section technicien */
        .tech-section {
            background: #f0f7ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 12px 16px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
        }
        .tech-name {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .tech-detail {
            font-size: 9px;
            color: #555;
            line-height: 1.6;
        }
        .tech-right {
            text-align: right;
        }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
        }
        .badge-blue { background: #dbeafe; color: #1d4ed8; }
        .badge-green { background: #dcfce7; color: #166534; }
        .badge-yellow { background: #fef9c3; color: #854d0e; }
        .badge-red { background: #fee2e2; color: #991b1b; }

        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }
        thead th {
            background: #1e3a8a;
            color: white;
            padding: 7px 10px;
            text-align: left;
            font-size: 10px;
        }
        thead th.text-right { text-align: right; }
        tbody td {
            padding: 6px 10px;
            font-size: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        tbody td.text-right { text-align: right; }
        tbody tr:nth-child(even) td { background: #f9fafb; }

        /* Calcul summary */
        .calcul-box {
            display: flex;
            gap: 16px;
            margin-bottom: 20px;
        }
        .calcul-card {
            flex: 1;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 10px 14px;
        }
        .calcul-card.blue-card {
            background: #eff6ff;
            border-color: #93c5fd;
        }
        .calcul-card.green-card {
            background: #f0fdf4;
            border-color: #86efac;
        }
        .calcul-title {
            font-size: 9px;
            font-weight: bold;
            color: #6b7280;
            margin-bottom: 6px;
            text-transform: uppercase;
        }
        .calcul-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            font-size: 10px;
        }
        .calcul-row.total {
            border-top: 1px solid #cbd5e1;
            margin-top: 6px;
            padding-top: 5px;
            font-weight: bold;
            font-size: 12px;
            color: #1d4ed8;
        }
        .text-red { color: #dc2626; }
        .text-green { color: #16a34a; }
        .text-blue { color: #2563eb; }
        .text-orange { color: #ea580c; }

        /* Signature block */
        .signature-block {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
        }
        .signature-box {
            text-align: center;
            width: 45%;
        }
        .signature-line {
            border-top: 1px solid #374151;
            margin: 40px 20px 6px;
        }
        .signature-label {
            font-size: 9px;
            color: #555;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: 10px;
            left: 40px;
            right: 40px;
            border-top: 1px solid #cbd5e1;
            padding-top: 6px;
            font-size: 8px;
            color: #9ca3af;
            text-align: center;
        }

        /* Section heading */
        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #1e3a8a;
            border-left: 3px solid #2563eb;
            padding-left: 8px;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>

<div class="footer">
    Document généré le {{ now()->format('d/m/Y à H:i') }} · Confidentiel
</div>

<!-- Header -->
<div class="header">
    <div>
        <div class="company-name">{{ $company?->name ?? 'GS Chantier' }}</div>
        <div class="company-info">
            {{ $company?->address ?? '' }}<br>
            {{ $company?->phone ?? '' }}
            @if($company?->email) · {{ $company->email }}@endif<br>
            @if($company?->rc) RC: {{ $company->rc }}@endif
            @if($company?->ice) &nbsp;|&nbsp; ICE: {{ $company->ice }}@endif
        </div>
    </div>
    <div class="doc-title">
        <h1>Fiche de Paie</h1>
        <span class="periode-badge">{{ $month_label }} {{ $year }}</span>
    </div>
</div>

<!-- Technicien -->
<div class="tech-section">
    <div>
        <div class="tech-name">{{ $technicien->nom }} {{ $technicien->prenom }}</div>
        <div class="tech-detail">
            Spécialité : {{ $technicien->specialite_label }}<br>
            Contrat : {{ $technicien->type_contrat_label }}<br>
            Salaire de base : {{ number_format($technicien->salaire_journalier, 2, '.', ' ') }} DH / jour
        </div>
    </div>
    <div class="tech-right">
        @php
            $statutClasses = [
                'paye' => 'badge-green',
                'partiellement_paye' => 'badge-yellow',
                'non_paye' => 'badge-red',
            ];
            $statutLabels = [
                'paye' => 'Payé',
                'partiellement_paye' => 'Partiel',
                'non_paye' => 'Non payé',
            ];
        @endphp
        <span class="badge {{ $statutClasses[$fiche['statut']] ?? 'badge-blue' }}">
            {{ $statutLabels[$fiche['statut']] ?? $fiche['statut'] }}
        </span>
        <div class="tech-detail" style="margin-top:8px;">
            Jours travaillés : <strong>{{ $fiche['jours_travailles'] }}j</strong><br>
            Total heures : <strong>{{ $fiche['total_heures'] }}h</strong>
        </div>
    </div>
</div>

<!-- Calcul -->
<div class="calcul-box">
    <div class="calcul-card blue-card">
        <div class="calcul-title">Détail du calcul</div>
        <div class="calcul-row">
            <span>Salaire brut ({{ $fiche['jours_travailles'] }}j × {{ number_format($fiche['salaire_journalier'], 2, '.', ' ') }} DH)</span>
            <span>{{ number_format($fiche['salaire_brut'], 2, '.', ' ') }} DH</span>
        </div>
        @if($fiche['total_primes'] > 0)
        <div class="calcul-row">
            <span class="text-green">+ Primes</span>
            <span class="text-green">{{ number_format($fiche['total_primes'], 2, '.', ' ') }} DH</span>
        </div>
        @endif
        @if($fiche['total_avances'] > 0)
        <div class="calcul-row">
            <span class="text-red">− Avances</span>
            <span class="text-red">{{ number_format($fiche['total_avances'], 2, '.', ' ') }} DH</span>
        </div>
        @endif
        @if($fiche['total_deductions'] > 0)
        <div class="calcul-row">
            <span class="text-red">− Déductions</span>
            <span class="text-red">{{ number_format($fiche['total_deductions'], 2, '.', ' ') }} DH</span>
        </div>
        @endif
        <div class="calcul-row total">
            <span>Net à payer</span>
            <span>{{ number_format($fiche['net_a_payer'], 2, '.', ' ') }} DH</span>
        </div>
    </div>
    <div class="calcul-card green-card">
        <div class="calcul-title">Statut du règlement</div>
        <div class="calcul-row">
            <span>Net à payer</span>
            <span class="text-blue">{{ number_format($fiche['net_a_payer'], 2, '.', ' ') }} DH</span>
        </div>
        <div class="calcul-row">
            <span class="text-green">Montant payé</span>
            <span class="text-green">{{ number_format($fiche['montant_paye'], 2, '.', ' ') }} DH</span>
        </div>
        <div class="calcul-row total">
            <span class="text-orange">Reste à payer</span>
            <span class="text-orange">{{ number_format($fiche['reste_a_payer'], 2, '.', ' ') }} DH</span>
        </div>
    </div>
</div>

<!-- Signatures -->
<div class="signature-block">
    <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Signature du responsable</div>
    </div>
    <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">Signature du technicien</div>
    </div>
</div>

</body>
</html>
