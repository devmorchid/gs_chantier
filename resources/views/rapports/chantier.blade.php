<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport Chantier</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 12px; color: #222; }
        .header { background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .title { font-size: 22px; font-weight: bold; color: #1a237e; margin-bottom: 4px; }
        .subtitle { font-size: 14px; color: #555; margin-bottom: 8px; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 16px; font-weight: bold; color: #1565c0; margin-bottom: 8px; border-bottom: 1px solid #e3e3e3; padding-bottom: 2px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th, td { border: 1px solid #e0e0e0; padding: 7px 10px; text-align: left; }
        th { background: #e3f2fd; color: #0d47a1; font-weight: bold; }
        tr:nth-child(even) { background: #f9f9f9; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; background: #e3f2fd; color: #1976d2; margin-right: 4px; }
        .total { font-weight: bold; color: #2e7d32; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Rapport du Chantier</div>
        <div class="subtitle">Référence: {{ $chantier->reference }} | Nom: {{ $chantier->nom }}</div>
        <div>Client: <b>{{ $chantier->client->nom ?? '-' }}</b> | Adresse: {{ $chantier->adresse ?? $chantier->localisation }}</div>
        <div>Date début: {{ $chantier->date_debut?->format('d/m/Y') }} | Statut: <span class="badge">{{ $chantier->statut_label }}</span></div>
    </div>

    <div class="section">
        <div class="section-title">Services</div>
        <table>
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Équipe</th>
                    <th>Prix</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
            @foreach($services as $service)
                <tr>
                    <td>{{ $service->name }}</td>
                    <td>{{ $service->type_label }}</td>
                    <td>{{ $service->equipe->name ?? '-' }}</td>
                    <td>{{ number_format($service->price, 2, ',', ' ') }} DH</td>
                    <td><span class="badge">{{ $service->status_label }}</span></td>
                </tr>
            @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Détails des Services</div>
        @foreach($services as $service)
            <div style="margin-bottom: 10px;">
                <b>{{ $service->name }} ({{ $service->type_label }})</b>
                <table>
                    <thead>
                        <tr>
                            <th>Unité</th>
                            <th>Numéro</th>
                            <th>Emplacement</th>
                            <th>Description</th>
                            <th>Quantité</th>
                            <th>Prix</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                    @foreach($service->details as $detail)
                        <tr>
                            <td>{{ $detail->unite_type }}</td>
                            <td>{{ $detail->unite_numero }}</td>
                            <td>{{ $detail->emplacement }}</td>
                            <td>{{ $detail->description }}</td>
                            <td>{{ $detail->quantite }}</td>
                            <td>{{ number_format($detail->prix_total, 2, ',', ' ') }} DH</td>
                            <td><span class="badge">{{ $detail->statut }}</span></td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            </div>
        @endforeach
    </div>

    <div class="section">
        <div class="section-title">Équipes & Techniciens</div>
        <table>
            <thead>
                <tr>
                    <th>Équipe</th>
                    <th>Techniciens</th>
                </tr>
            </thead>
            <tbody>
            @foreach($equipes as $equipe)
                <tr>
                    <td>{{ $equipe->name }}</td>
                    <td>
                        @foreach($equipe->techniciens as $tech)
                            <span class="badge">{{ $tech->nom_complet }}</span>
                        @endforeach
                    </td>
                </tr>
            @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Finances</div>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Numéro</th>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
            @foreach($devis as $devi)
                <tr>
                    <td>Devis</td>
                    <td>{{ $devi->numero }}</td>
                    <td>{{ $devi->date?->format('d/m/Y') }}</td>
                    <td>{{ number_format($devi->total_ttc, 2, ',', ' ') }} DH</td>
                    <td><span class="badge">{{ $devi->status }}</span></td>
                </tr>
            @endforeach
            @foreach($factures as $facture)
                <tr>
                    <td>Facture</td>
                    <td>{{ $facture->numero }}</td>
                    <td>{{ $facture->date?->format('d/m/Y') }}</td>
                    <td>{{ number_format($facture->total_ttc, 2, ',', ' ') }} DH</td>
                    <td><span class="badge">{{ $facture->status }}</span></td>
                </tr>
            @endforeach
            </tbody>
        </table>
    </div>
</body>
</html>
