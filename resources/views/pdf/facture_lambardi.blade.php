@php
// Variables attendues : $facture, $client, $items, $total_ht, $tva, $total_ttc, $total_text, $date, $reference, $objet, $ville
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $reference }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 13px; margin: 0; padding: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e67e22; padding: 10px 0 5px 0; }
        .logo { width: 180px; }
        .qr { width: 70px; }
        .societe-info { font-size: 12px; line-height: 1.3; }
        .facture-title { text-align: center; font-size: 22px; font-weight: bold; margin: 10px 0 0 0; letter-spacing: 2px; }
        .facture-meta { margin: 10px 0 0 0; font-size: 13px; }
        .client-block { margin: 18px 0 10px 0; border: 1px solid #e0e0e0; padding: 10px; width: 350px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 18px; }
        .table th, .table td { border: 1px solid #bbb; padding: 6px 8px; text-align: left; }
        .table th { background: #f5f5f5; font-size: 13px; }
        .table td { font-size: 13px; }
        .totals { margin-top: 10px; width: 100%; }
        .totals td { padding: 4px 8px; font-size: 13px; }
        .totals .label { text-align: right; font-weight: bold; }
        .totals .value { text-align: right; }
        .total-letters { margin: 18px 0 0 0; font-style: italic; font-size: 13px; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; background: #e67e22; color: #fff; font-size: 12px; text-align: center; padding: 6px 0; }
        .signature { float: right; margin-top: 30px; text-align: right; }
        .stamp { margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('logo_lambardi.png') }}" class="logo" alt="Logo Lambardi Elec">
        <div class="societe-info">
            <strong>LAMBARDI ELEC S.A.R.L/AU</strong><br>
            Electricité de bâtiment & industrielle - travaux divers<br>
            IF: 34320047 - ICE: 001614572000074<br>
            CNSS: 34320047 - RC: 319563 - TP: 15220017<br>
            Tél: 0667 07 62 67 / 0668 14 86 10<br>
            Email: lambardielec@gmail.com
        </div>
        <img src="{{ public_path('qr_facture.png') }}" class="qr" alt="QR Code">
    </div>
    <div class="facture-title">FACTURE</div>
    <div class="facture-meta" style="text-align:center;">
        Facture N° {{ $reference }}<br>
        Date : {{ $date }}<br>
        Objet : {{ $objet }}
    </div>
    <div class="client-block">
        <strong>Client :</strong> {{ $client['nom'] }}<br>
        <strong>Ville :</strong> {{ $ville }}
    </div>
    <table class="table">
        <thead>
            <tr>
                <th style="width: 30px;">#</th>
                <th>Désignation</th>
                <th style="width: 80px; text-align:right;">PU HT</th>
                <th style="width: 60px; text-align:right;">Qté</th>
                <th style="width: 90px; text-align:right;">Montant</th>
            </tr>
        </thead>
        <tbody>
        @foreach($items as $i => $item)
            <tr>
                <td>{{ $i+1 }}</td>
                <td>{{ $item['designation'] }}</td>
                <td style="text-align:right;">{{ number_format($item['prix_unitaire'], 2, ',', ' ') }}</td>
                <td style="text-align:right;">{{ $item['quantite'] }}</td>
                <td style="text-align:right;">{{ number_format($item['montant'], 2, ',', ' ') }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
    <table class="totals">
        <tr>
            <td class="label">TOTAL H.T</td>
            <td class="value">{{ number_format($total_ht, 2, ',', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">TVA 20%</td>
            <td class="value">{{ number_format($tva, 2, ',', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">TOTAL T.T.C</td>
            <td class="value"><strong>{{ number_format($total_ttc, 2, ',', ' ') }}</strong></td>
        </tr>
    </table>
    <div class="total-letters">
        Arrêté la présente facture à la somme de :<br>
        <strong>{{ $total_text }}</strong>
    </div>
    <div class="signature">
        <div>LAMBARDI ELEC S.A.R.L/AU</div>
        <img src="{{ public_path('stamp_lambardi.png') }}" class="stamp" alt="Cachet" width="120">
    </div>
    <div class="footer">
        024, Avenue Mers Sultan, Appt. 3, 1er Étage - Casablanca
    </div>
</body>
</html>
