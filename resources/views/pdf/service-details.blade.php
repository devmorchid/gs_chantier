<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Détails Service - {{ $service->name }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #333;
            padding: 20px;
        }
        
        .header {
            display: table;
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
        }
        
        .header-left {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        
        .header-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            text-align: right;
        }
        
        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        
        .company-slogan {
            font-size: 10px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .company-info {
            font-size: 9px;
            color: #555;
            line-height: 1.5;
        }
        
        .document-title {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        
        .document-subtitle {
            font-size: 12px;
            color: #666;
        }
        
        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .info-box {
            display: table-cell;
            width: 32%;
            padding: 12px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            vertical-align: top;
        }
        
        .info-box-middle {
            margin: 0 2%;
        }
        
        .info-title {
            font-size: 11px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 8px;
            text-transform: uppercase;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
        }
        
        .info-row {
            margin-bottom: 4px;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
        }
        
        .info-value {
            color: #333;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #2563eb;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #2563eb;
        }
        
        .unite-header {
            background: #e0e7ff;
            padding: 8px 12px;
            margin: 15px 0 10px 0;
            font-weight: bold;
            font-size: 11px;
            color: #1e40af;
            border-left: 4px solid #2563eb;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .items-table thead th {
            background: #2563eb;
            color: white;
            padding: 8px 6px;
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
        }
        
        .items-table thead th.text-right {
            text-align: right;
        }
        
        .items-table thead th.text-center {
            text-align: center;
        }
        
        .items-table tbody td {
            padding: 8px 6px;
            border-bottom: 1px solid #dee2e6;
            vertical-align: top;
            font-size: 9px;
        }
        
        .items-table tbody tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .items-table .text-right {
            text-align: right;
        }
        
        .items-table .text-center {
            text-align: center;
        }
        
        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-en_attente { background: #e5e7eb; color: #374151; }
        .status-en_cours { background: #dbeafe; color: #1d4ed8; }
        .status-termine { background: #dcfce7; color: #166534; }
        .status-valide { background: #d1fae5; color: #065f46; }
        .status-annule { background: #fee2e2; color: #dc2626; }
        
        .phase-badge {
            display: inline-block;
            padding: 2px 5px;
            background: #fef3c7;
            color: #92400e;
            border-radius: 3px;
            font-size: 8px;
        }
        
        .subtotal-row {
            background: #e0e7ff !important;
        }
        
        .subtotal-row td {
            font-weight: bold;
            color: #1e40af;
        }
        
        .totals-section {
            margin-top: 20px;
            width: 50%;
            margin-left: 50%;
        }
        
        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .totals-table td {
            padding: 8px 12px;
            border: 1px solid #dee2e6;
        }
        
        .totals-table .label {
            background: #f8f9fa;
            font-weight: bold;
            width: 50%;
        }
        
        .totals-table .value {
            text-align: right;
            font-weight: bold;
        }
        
        .totals-table .grand-total {
            background: #2563eb;
            color: white;
            font-size: 12px;
        }
        
        .totals-table .grand-total .value {
            font-size: 14px;
        }
        
        .progress-section {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
        }
        
        .progress-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #2563eb;
        }
        
        .progress-bar-container {
            background: #e5e7eb;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            background: #2563eb;
            text-align: center;
            color: white;
            font-size: 10px;
            line-height: 20px;
            font-weight: bold;
        }
        
        .progress-stats {
            margin-top: 10px;
            display: table;
            width: 100%;
        }
        
        .progress-stat {
            display: table-cell;
            text-align: center;
            padding: 5px;
        }
        
        .progress-stat-value {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
        }
        
        .progress-stat-label {
            font-size: 9px;
            color: #666;
        }
        
        .footer {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 8px;
            color: #666;
            border-top: 1px solid #dee2e6;
            padding-top: 10px;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .notes-box {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            padding: 8px;
            margin-top: 5px;
            font-style: italic;
            font-size: 8px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="header-left">
            @if($company)
                @if($company->logo)
                    <img src="{{ public_path('storage/' . $company->logo) }}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;">
                @endif
                <div class="company-name">{{ $company->name ?: 'VOTRE ENTREPRISE' }}</div>
                @if($company->legal_form)
                    <div class="company-slogan">{{ $company->legal_form_label }}</div>
                @endif
                <div class="company-info">
                    @if($company->address){{ $company->address }}<br>@endif
                    @if($company->postal_code || $company->city){{ $company->postal_code }} {{ $company->city }}@endif
                    @if($company->country) {{ $company->country }}@endif
                    @if($company->phone)<br>Tél: {{ $company->phone }}@endif
                    @if($company->email) | {{ $company->email }}@endif
                    @if($company->ice)<br>ICE: {{ $company->ice }}@endif
                    @if($company->if) | IF: {{ $company->if }}@endif
                    @if($company->rc) | RC: {{ $company->rc }}@endif
                    @if($company->cnss) | CNSS: {{ $company->cnss }}@endif
                    @if($company->patent) | TP: {{ $company->patent }}@endif
                </div>
            @else
                <div class="company-name">Gestion Chantier</div>
            @endif
        </div>
        <div class="header-right">
            <div class="document-title">FICHE DÉTAILS</div>
            <div class="document-subtitle">
                Service: {{ $service->name }}<br>
                Généré le: {{ now()->format('d/m/Y à H:i') }}
            </div>
        </div>
    </div>
    
    <!-- Info Section: Client, Chantier, Service -->
    <div class="info-section">
        <!-- Client -->
        <div class="info-box">
            <div class="info-title">👤 Client</div>
            @if($chantier && $chantier->client)
                <div class="info-row">
                    <span class="info-label">Nom:</span>
                    <span class="info-value">{{ $chantier->client->nom }}</span>
                </div>
                @if($chantier->client->telephone)
                <div class="info-row">
                    <span class="info-label">Tél:</span>
                    <span class="info-value">{{ $chantier->client->telephone }}</span>
                </div>
                @endif
                @if($chantier->client->email)
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ $chantier->client->email }}</span>
                </div>
                @endif
                @if($chantier->client->adresse)
                <div class="info-row">
                    <span class="info-label">Adresse:</span>
                    <span class="info-value">{{ $chantier->client->adresse }}</span>
                </div>
                @endif
            @else
                <div class="info-row">Non spécifié</div>
            @endif
        </div>
        
        <!-- Chantier -->
        <div class="info-box info-box-middle" style="margin-left: 2%; margin-right: 2%;">
            <div class="info-title">🏗️ Chantier</div>
            @if($chantier)
                <div class="info-row">
                    <span class="info-label">Référence:</span>
                    <span class="info-value">{{ $chantier->reference }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Nom:</span>
                    <span class="info-value">{{ $chantier->nom }}</span>
                </div>
                @if($chantier->localisation)
                <div class="info-row">
                    <span class="info-label">Localisation:</span>
                    <span class="info-value">{{ $chantier->localisation }}</span>
                </div>
                @endif
                <div class="info-row">
                    <span class="info-label">Statut:</span>
                    <span class="info-value">{{ $chantier->statut_label }}</span>
                </div>
            @else
                <div class="info-row">Non spécifié</div>
            @endif
        </div>
        
        <!-- Service -->
        <div class="info-box">
            <div class="info-title">🔧 Service</div>
            <div class="info-row">
                <span class="info-label">Nom:</span>
                <span class="info-value">{{ $service->name }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="info-value">{{ $service->type_label }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Statut:</span>
                <span class="info-value">{{ $service->status_label }}</span>
            </div>
            @if($service->equipe)
            <div class="info-row">
                <span class="info-label">Équipe:</span>
                <span class="info-value">{{ $service->equipe->name }}</span>
            </div>
            @endif
        </div>
    </div>
    
    <!-- Progress Section -->
    <div class="progress-section">
        <div class="progress-title">📊 Progression globale</div>
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: {{ $progressPercentage }}%">
                {{ $progressPercentage }}%
            </div>
        </div>
        <div class="progress-stats">
            <div class="progress-stat">
                <div class="progress-stat-value">{{ $totalDetails }}</div>
                <div class="progress-stat-label">Total travaux</div>
            </div>
            <div class="progress-stat">
                <div class="progress-stat-value">{{ $completedDetails }}</div>
                <div class="progress-stat-label">Terminés</div>
            </div>
            <div class="progress-stat">
                <div class="progress-stat-value">{{ $inProgressDetails }}</div>
                <div class="progress-stat-label">En cours</div>
            </div>
            <div class="progress-stat">
                <div class="progress-stat-value">{{ $pendingDetails }}</div>
                <div class="progress-stat-label">En attente</div>
            </div>
        </div>
    </div>
    
    <!-- Details Section -->
    <div class="section-title">📋 Liste des travaux détaillés</div>
    
    @php
        $detailsByUnite = $details->groupBy(function($detail) {
            $type = $detail->unite_type_label ?? 'Autre';
            $numero = $detail->unite_numero ?? '';
            return $type . ($numero ? ' ' . $numero : '');
        });
        $grandTotal = 0;
    @endphp
    
    @foreach($detailsByUnite as $uniteKey => $uniteDetails)
        @php
            $uniteTotal = $uniteDetails->sum('prix_total');
            $grandTotal += $uniteTotal;
            $uniteCompleted = $uniteDetails->whereIn('statut', ['termine', 'valide'])->count();
            $uniteProgress = $uniteDetails->count() > 0 ? round(($uniteCompleted / $uniteDetails->count()) * 100) : 0;
        @endphp
        
        <div class="unite-header">
            🏠 {{ $uniteKey }} — {{ $uniteDetails->count() }} travaux — {{ $uniteProgress }}% terminé — Total: {{ number_format($uniteTotal, 2, ',', ' ') }} DH
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 5%">#</th>
                    <th style="width: 25%">Description</th>
                    <th style="width: 12%">Emplacement</th>
                    <th style="width: 10%">Phase</th>
                    <th style="width: 10%">Équipe/Tech</th>
                    <th class="text-center" style="width: 8%">Qté</th>
                    <th class="text-right" style="width: 10%">P.U.</th>
                    <th class="text-right" style="width: 10%">Total</th>
                    <th class="text-center" style="width: 10%">Statut</th>
                </tr>
            </thead>
            <tbody>
                @foreach($uniteDetails as $index => $detail)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                        {{ $detail->description }}
                        @if($detail->notes)
                            <div class="notes-box">💬 {{ $detail->notes }}</div>
                        @endif
                    </td>
                    <td>{{ $detail->emplacement }}</td>
                    <td>
                        @if($detail->phase)
                            <span class="phase-badge">{{ $detail->phase_label }}</span>
                        @else
                            -
                        @endif
                    </td>
                    <td>
                        @if($detail->equipe)
                            {{ $detail->equipe->name }}
                        @endif
                        @if($detail->technicien)
                            <br><small>{{ $detail->technicien->prenom }} {{ $detail->technicien->nom }}</small>
                        @endif
                        @if(!$detail->equipe && !$detail->technicien)
                            -
                        @endif
                    </td>
                    <td class="text-center">{{ number_format($detail->quantite, 2, ',', ' ') }} {{ $detail->unite_label }}</td>
                    <td class="text-right">{{ number_format($detail->prix_unitaire, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($detail->prix_total, 2, ',', ' ') }}</td>
                    <td class="text-center">
                        <span class="status-badge status-{{ $detail->statut }}">{{ $detail->statut_label }}</span>
                    </td>
                </tr>
                @endforeach
                <tr class="subtotal-row">
                    <td colspan="7" style="text-align: right;">Sous-total {{ $uniteKey }}:</td>
                    <td class="text-right">{{ number_format($uniteTotal, 2, ',', ' ') }} DH</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    @endforeach
    
    <!-- Totals -->
    <div class="totals-section">
        <table class="totals-table">
            <tr>
                <td class="label">Nombre de travaux</td>
                <td class="value">{{ $totalDetails }}</td>
            </tr>
            <tr>
                <td class="label">Travaux terminés</td>
                <td class="value">{{ $completedDetails }} ({{ $progressPercentage }}%)</td>
            </tr>
            <tr class="grand-total">
                <td class="label grand-total">TOTAL GÉNÉRAL</td>
                <td class="value grand-total">{{ number_format($grandTotal, 2, ',', ' ') }} DH</td>
            </tr>
        </table>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        Document généré le {{ now()->format('d/m/Y à H:i') }} | {{ $service->name }} - {{ $chantier ? $chantier->reference : '' }}
    </div>
</body>
</html>
