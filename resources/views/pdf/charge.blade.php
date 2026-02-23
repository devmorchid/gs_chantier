<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Charge {{ $charge->reference ?? ('#' . $charge->id) }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; line-height: 1.4; color: #333; padding: 20px; }
        .header { display: table; width: 100%; margin-bottom: 16px; border-bottom: 3px solid #2563eb; padding-bottom: 12px; }
        .header-left { display: table-cell; width: 70%; vertical-align: top; }
        .header-right { display: table-cell; width: 30%; vertical-align: top; text-align: right; }
        .document-title { font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 4px; }
        .company-name { font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 4px; }
        .company-info { font-size: 9px; color: #555; line-height: 1.5; }
        .info-section { display: table; width: 100%; margin-bottom: 16px; }
        .info-box { display: table-cell; width: 32%; padding: 10px; background: #f8f9fa; border: 1px solid #dee2e6; vertical-align: top; }
        .info-box-middle { margin: 0 2%; }
        .info-title { font-size: 11px; font-weight: bold; color: #2563eb; margin-bottom: 6px; text-transform: uppercase; border-bottom: 2px solid #2563eb; padding-bottom: 4px; }
        .info-row { margin-bottom: 4px; }
        .info-label { font-weight: bold; color: #555; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 999px; font-size: 9px; background: #e5e7eb; }
        .attachments { margin-top: 12px; }
        .attachments table { width: 100%; border-collapse: collapse; }
        .attachments th, .attachments td { padding: 6px; border: 1px solid #dee2e6; font-size: 9px; }
        .attachments th { background: #2563eb; color: #fff; text-align: left; }
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
                <div class="company-info">
                    @if($company->address){{ $company->address }}<br>@endif
                    @if($company->postal_code || $company->city){{ $company->postal_code }} {{ $company->city }}@endif
                    @if($company->country) {{ $company->country }}@endif
                    @if($company->phone)<br>Tél: {{ $company->phone }}@endif
                    @if($company->email) | {{ $company->email }}@endif
                </div>
            @else
                <div class="company-name">Gestion Chantier</div>
            @endif
        </div>
        <div class="header-right">
            <div class="document-title">Charge {{ $charge->reference ?? ('#' . $charge->id) }}</div>
            <div class="document-subtitle">Date: {{ $charge->date?->format('d/m/Y') }}</div>
        </div>
    </div>

    <div class="info-section">
        <div class="info-box">
            <div class="info-title">Chantier</div>
            <div class="info-row"><span class="info-label">Nom:</span> {{ $charge->chantier?->nom ?? '-' }}</div>
            <div class="info-row"><span class="info-label">Réf:</span> {{ $charge->chantier?->reference ?? '-' }}</div>
        </div>
        <div class="info-box info-box-middle">
            <div class="info-title">Montant</div>
            <div class="info-row"><span class="info-label">Montant:</span> {{ number_format((float) $charge->montant, 2) }} DH</div>
            <div class="info-row"><span class="info-label">Statut:</span> {{ $charge->status_label }}</div>
        </div>
        <div class="info-box">
            <div class="info-title">Paiement</div>
            <div class="info-row"><span class="info-label">Methode:</span> {{ $charge->payment_method ?? '-' }}</div>
        </div>
        <div class="info-box" style="display: block; width: 100%; margin-top: 8px;">
            <div class="info-title">Type</div>
            <div class="info-row">{{ $charge->type_label ?? $charge->type }}</div>
        </div>
        <div class="info-box" style="display: block; width: 100%; margin-top: 8px;">
            <div class="info-title">Libelle</div>
            <div class="info-row">{{ $charge->libelle ?? '-' }}</div>
        </div>
    </div>

    @if($charge->description)
        <div class="info-box" style="width: 100%; display: block; margin-bottom: 12px;">
            <div class="info-title">Description</div>
            <div class="info-row">{{ $charge->description }}</div>
        </div>
    @endif

    <div class="attachments">
        <div class="info-title">Justificatifs</div>
        <table>
            <thead>
                <tr>
                    <th>Fichier</th>
                    <th>Type</th>
                    <th>Taille</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($charge->attachments as $file)
                    <tr>
                        <td>{{ $file->original_name }}</td>
                        <td>{{ $file->mime_type }}</td>
                        <td>{{ number_format($file->size / 1024, 1) }} Ko</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="3">Aucun fichier joint</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</body>
</html>
