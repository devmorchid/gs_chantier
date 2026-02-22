<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Mouvement de stock</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #333; font-size: 10px; line-height: 1.4; }
        .header { display: table; width: 100%; margin-bottom: 16px; border-bottom: 3px solid #2563eb; padding-bottom: 12px; }
        .header-left { display: table-cell; width: 70%; vertical-align: top; }
        .header-right { display: table-cell; width: 30%; text-align: right; vertical-align: top; }
        .document-title { font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 4px; }
        .company-name { font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 4px; }
        .company-slogan { font-size: 10px; color: #666; margin-bottom: 6px; }
        .company-info { font-size: 9px; color: #555; line-height: 1.5; }
        .document-subtitle { font-size: 10px; color: #666; }
        .box { border: 1px solid #dee2e6; padding: 10px; border-radius: 6px; margin-bottom: 10px; background: #f8f9fa; }
        .box strong { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border-bottom: 1px solid #dee2e6; padding: 6px; text-align: left; }
        th { background: #2563eb; color: #fff; font-size: 9px; text-transform: uppercase; }
        .right { text-align: right; }
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
            <div class="document-title">Mouvement de stock</div>
            <div class="document-subtitle">Référence: {{ $mouvement->reference ?? '#' . $mouvement->id }}</div>
            <div class="document-subtitle">Date: {{ $mouvement->date }}</div>
        </div>
    </div>

    <div class="box">
        <div><strong>Référence:</strong> {{ $mouvement->reference ?? '-' }}</div>
        <div><strong>Type:</strong> {{ $mouvement->type }}</div>
        <div><strong>Origine:</strong> {{ $mouvement->origine ?? '-' }}</div>
        <div><strong>Destination:</strong> {{ $mouvement->destination }}</div>
    </div>

    <div class="box">
        <strong>Produits</strong>
        <table>
            <thead>
                <tr>
                    <th>Produit</th>
                    <th class="right">Quantité</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($items as $item)
                    <tr>
                        <td>{{ $item->produit?->name ?? '-' }}</td>
                        <td class="right">{{ $item->quantite }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>
</html>
