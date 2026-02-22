<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        /* 1. Setup A4 & Margins */
        @page { 
            margin: 190px 60px 140px 60px; /* Blast l-header w l-footer fixed */
        }

        body {
            font-family: 'Helvetica', Arial, sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 0;
            color: #000;
        }

        /* 2. SIDEBAR (L-barre l-li3sar - Fixed f ga3 l-pages) */
        .sidebar {
            position: fixed;
            left: -50px;
            top: 0;
            bottom: 0;
            width: 30px;
            z-index: 1000;
        }
        .sidebar-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-90deg);
            white-space: nowrap;
            font-size: 9px;
            font-weight: bold;
            color: #333;
            width: 700px;
            text-align: center;
        }

        /* 3. WATERMARK (Logo f l-khalfia) */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.04;
            z-index: -1000;
            width: 450px;
        }

        /* 4. HEADER FIXED */
        .header-fixed {
            position: fixed;
            top: -165px;
            left: 0;
            right: 0;
            height: 150px;
        }

        /* 5. FOOTER FIXED (Contact, Website & Page Numbering) */
        .footer {
            position: fixed;
            bottom: -95px;
            left: 0;
            right: 0;
            height: 125px;
            border-top: 2px solid #f28c28; /* Khit orange Lambardi */
            padding-top: 10px;
            text-align: center;
        }
        .footer-details {
            font-size: 10px;
            line-height: 1.5;
            color: #444;
        }
        .company-name-footer {
            color: #1e5eb6;
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 3px;
        }
        .website-link {
            color: #1e5eb6;
            text-decoration: underline;
            font-weight: bold;
            font-size: 11px;
            margin-top: 5px;
            display: block;
        }

        /* Styles des tableaux */
        .header-table { width: 100%; border-collapse: collapse; }
        .info-section { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-box { border: 1.5px solid #000; vertical-align: top; width: 48%; }
        .box-header { background: #f2f2f2; text-align: center; font-weight: bold; padding: 5px; border-bottom: 1.5px solid #000; }
        .box-content { padding: 8px; line-height: 1.5; }

        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { border: 1.5px solid #000; padding: 8px; background: #f2f2f2; font-weight: bold; }
        .items-table td { border: 1.5px solid #000; padding: 6px; height: 25px; text-align: center; }
        
        .signature-table { width: 100%; margin-top: 40px; border-collapse: collapse; }
        .signature-table td { padding: 0px; vertical-align: top; }

        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
    </style>
</head>
<body>

    <div class="sidebar">
        <div class="sidebar-text">
            TP : {{ $company->patent }} — RC : {{ $company->rc }} — CNSS : {{ $company->cnss }} — IF : {{ $company->if }} — ICE : {{ $company->ice }}
        </div>
    </div>

    <div class="watermark">
        @if($company->logo)
            <img src="{{ public_path('storage/'.$company->logo) }}" width="100%">
        @endif
    </div>

    <div class="header-fixed">
        <table class="header-table">
            <tr>
                <td width="35%">
                    @if($company->logo)
                        <img src="{{ public_path('storage/'.$company->logo) }}" height="115">
                    @endif
                </td>
                <td width="30%" class="text-center">
                    <div style="font-weight: bold; font-size: 12px; line-height: 1.4;">
                        Electricité de bâtiment<br>
                        & industrielle - travaux divers
                    </div>
                    <div style="font-size: 16px; margin-top: 15px; font-weight: bold; text-decoration: underline;">BON DE COMMANDE</div>
                    <div style="font-size: 10px; font-weight: normal; margin-top: 5px;">Réf. Devis : {{ $devis->numero }}</div>
                </td>
                <td width="35%" class="text-right">
                    <img src="{{ public_path('storage/code_qr.svg') }}" height="90">
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <div class="company-name-footer">{{ $company->name }}</div>
        <div class="footer-details">
            {{ $company->legal_form_label }}<br>
            {{ $company->address }} — {{ $company->city }} {{ $company->postal_code }}<br>
            Tél: {{ $company->phone }} @if($company->fax) - {{ $company->fax }} @endif — Email: {{ $company->email }}
        </div>
        @if($company->website)
            <div class="website-link">
                <a href="{{ str_starts_with($company->website, 'http') ? $company->website : 'https://'.$company->website }}" style="color: #1e5eb6;">
                    {{ $company->website }}
                </a>
            </div>
        @endif
    </div>

    <div class="container">
        <table class="info-section">
            <tr>
                <td class="info-box">
                    <div class="box-header">CLIENT</div>
                    <div class="box-content">
                        <strong>Nom :</strong> {{ $devis->client->nom ?? $devis->chantier->client->nom ?? '' }}<br>
                        <strong>Ville :</strong> {{ $devis->client->ville ?? $devis->chantier->client->ville ?? '' }}
                    </div>
                </td>
                <td width="4%"></td>
                <td class="info-box">
                    <div class="box-header">BON DE COMMANDE</div>
                    <div class="box-content">
                        <strong>Date :</strong> {{ $devis->date->format('d/m/Y') }}<br>
                        <strong>ICE :</strong> {{ $company->ice }}<br>
                        <strong>Objet :</strong> {{ $devis->objet }}
                    </div>
                </td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th width="50%">DÉSIGNATION</th>
                    <th width="15%">QUANTITÉ</th>
                    <th width="35%">DESCRIPTION</th>
                </tr>
            </thead>
            <tbody>
                @foreach($devis->items as $i => $item)
                <tr>
                    <td class="text-left" style="padding-left: 10px;">{{ $item->designation }}</td>
                    <td>{{ $item->quantite }}</td>
                    <td class="text-left" style="padding-left: 10px;">{{ $item->description }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <table class="signature-table">
            <tr>
                <td width="48%">
                    <div style="border: 1px solid #000; padding: 10px; height: 130px; margin-top: 20px;">
                        <strong>Signature Client</strong><br>
                        <span style="font-size: 9px;">(Nom, Cachet & Date)</span>
                        <br><br><br>
                        <div style="text-align: center; font-size: 10px; margin-top: 40px;">Lu et approuvé</div>
                    </div>
                </td>
                <td width="4%"></td>
                <td width="48%">
                    <div style="border: 1px solid #000; padding: 10px; height: 130px; margin-top: 20px;">
                        <strong>Signature Société</strong><br>
                        <br><br><br>
                        <div style="text-align: center; font-size: 10px; margin-top: 55px;">Cachet & Signature</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <script type="text/php">
        if (isset($pdf)) {
            $text = "Page {PAGE_NUM} / {PAGE_COUNT}";
            $font = $fontMetrics->get_font("helvetica", "bold");
            $size = 9;
            $color = array(0.2, 0.2, 0.2);
            $pdf->page_text(480, 815, $text, $font, $size, $color);
        }
    </script>

</body>
</html>