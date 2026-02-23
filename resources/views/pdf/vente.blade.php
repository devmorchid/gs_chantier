<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <title>Vente {{ $vente->reference }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #111827;
        }

        .header {
            margin-bottom: 20px;
        }

        .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 6px;
        }

        .meta {
            margin-bottom: 16px;
        }

        .meta p {
            margin: 4px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }

        th,
        td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
        }

        th {
            background: #f3f4f6;
        }

        .text-right {
            text-align: right;
        }

        .totals {
            width: 320px;
            margin-left: auto;
        }

        .totals td {
            border: none;
            padding: 4px 0;
        }

        .totals .grand-total {
            font-size: 15px;
            font-weight: bold;
            border-top: 1px solid #d1d5db;
            padding-top: 8px;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="title">Facture de vente</div>
        <div>Référence: {{ $vente->reference }}</div>
    </div>

    <div class="meta">
        <p><strong>Date:</strong> {{ $vente->date?->format('d/m/Y') ?? '-' }}</p>
        <p><strong>Client:</strong> {{ $vente->client?->nom ?? '-' }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Produit</th>
                <th class="text-right">Qté</th>
                <th class="text-right">Prix unitaire</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($vente->items as $item)
                <tr>
                    <td>{{ $item->produit?->name ?? '-' }}</td>
                    <td class="text-right">{{ number_format($item->quantite, 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($item->prix_vente, 2, ',', ' ') }} DH</td>
                    <td class="text-right">{{ number_format($item->quantite * $item->prix_vente, 2, ',', ' ') }} DH</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Sous-total HT</td>
            <td class="text-right">{{ number_format($vente->total_ht, 2, ',', ' ') }} DH</td>
        </tr>
        <tr>
            <td>Total TVA</td>
            <td class="text-right">{{ number_format($vente->total_tva, 2, ',', ' ') }} DH</td>
        </tr>
        <tr>
            <td class="grand-total">Total TTC</td>
            <td class="text-right grand-total">{{ number_format($vente->total_ttc, 2, ',', ' ') }} DH</td>
        </tr>
    </table>
</body>

</html>
