<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Achat {{ $achat->reference }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; line-height: 1.4; color: #333; padding: 20px; }
        .header { display: table; width: 100%; margin-bottom: 16px; border-bottom: 3px solid #2563eb; padding-bottom: 12px; }
        .header-left { display: table-cell; width: 70%; vertical-align: top; }
        .header-right { display: table-cell; width: 30%; vertical-align: top; text-align: right; }
        .document-title { font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 4px; }
        .company-name { font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 4px; }
        .company-slogan { font-size: 10px; color: #666; margin-bottom: 6px; }
        .company-info { font-size: 9px; color: #555; line-height: 1.5; }
        .document-subtitle { font-size: 10px; color: #666; }
        .info-section { display: table; width: 100%; margin-bottom: 16px; }
        .info-box { display: table-cell; width: 32%; padding: 10px; background: #f8f9fa; border: 1px solid #dee2e6; vertical-align: top; }
        .info-box-middle { margin: 0 2%; }
        .info-title { font-size: 11px; font-weight: bold; color: #2563eb; margin-bottom: 6px; text-transform: uppercase; border-bottom: 2px solid #2563eb; padding-bottom: 4px; }
        .info-row { margin-bottom: 4px; }
        .info-label { font-weight: bold; color: #555; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .items-table thead th { background: #2563eb; color: #fff; padding: 6px; text-align: left; font-size: 9px; text-transform: uppercase; }
        .items-table tbody td { padding: 6px; border-bottom: 1px solid #dee2e6; font-size: 9px; }
        .items-table tbody tr:nth-child(even) { background: #f8f9fa; }
        .text-right { text-align: right; }
        .totals { margin-top: 16px; width: 45%; margin-left: 55%; }
        .totals table { width: 100%; border-collapse: collapse; }
        .totals td { padding: 6px 8px; border: 1px solid #dee2e6; }
        .totals .label { background: #f8f9fa; font-weight: bold; }
        .totals .value { text-align: right; font-weight: bold; }
        .totals .grand { background: #2563eb; color: #fff; }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            @if($company)
                @if($company->logo)
                    <img src="{{ public_path('storage/' . $company->logo) }}" alt="Logo" style="max-height: 50px; margin-bottom: 8px;">
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
            <div class="document-title">Achat {{ $achat->reference }}</div>
            <div class="document-subtitle">Responsable: {{ $achat->user?->name ?? '-' }}</div>
            <div class="document-subtitle">Date: {{ $achat->date }}</div>
        </div>
    </div>

    <div class="info-section">
        <div class="info-box">
            <div class="info-title">Fournisseur</div>
            <div class="info-row"><span class="info-label">Nom:</span> {{ $achat->fournisseur?->name ?? '-' }}</div>
        </div>
        <div class="info-box info-box-middle">
            <div class="info-title">Référence</div>
            <div class="info-row"><span class="info-label">Réf:</span> {{ $achat->reference }}</div>
            <div class="info-row"><span class="info-label">TVA:</span> {{ number_format((float) $achat->tva_rate, 2) }} %</div>
        </div>
        <div class="info-box">
            <div class="info-title">Totaux</div>
            <div class="info-row"><span class="info-label">Remise:</span> {{ number_format((float) $achat->remise, 2) }} DH</div>
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Produit</th>
                <th class="text-right">Quantité</th>
                <th class="text-right">Prix d'achat</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($achat->items as $item)
                <tr>
                    <td>{{ $item->produit?->name ?? '-' }}</td>
                    <td class="text-right">{{ $item->quantite }}</td>
                    <td class="text-right">{{ number_format((float) $item->prix_achat, 2) }}</td>
                    <td class="text-right">{{ number_format((float) ($item->prix_achat * $item->quantite), 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td class="label">Total HT</td>
                <td class="value">{{ number_format((float) $achat->total_ht, 2) }} DH</td>
            </tr>
            <tr>
                <td class="label">Total TVA</td>
                <td class="value">{{ number_format((float) $achat->total_tva, 2) }} DH</td>
            </tr>
            <tr class="grand">
                <td class="label">Total TTC</td>
                <td class="value">{{ number_format((float) $achat->total_ttc, 2) }} DH</td>
            </tr>
        </table>
    </div>
</body>
</html>
