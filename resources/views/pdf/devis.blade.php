<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        /* 1. Setup A4 & Margins */
        @page { 
            margin: 190px 60px 120px 60px; /* Zt chwiya f l-fo9 bach l-logo l-kbir yakhod ra7tu */
        }

        body {
            font-family: 'Helvetica', Arial, sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 0;
            color: #000;
        }

        /* 2. SIDEBAR (L-barre l-li3sar) */
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

        /* 3. WATERMARK (Logo wast l-werqa) */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.04;
            z-index: -1000;
            width: 450px;
        }

        /* 4. HEADER FIXED (M3a l-logo l-kbir) */
        .header-fixed {
            position: fixed;
            top: -165px; /* Ajusté bach l-logo yban mzyan */
            left: 0;
            right: 0;
            height: 150px;
        }

        /* 5. FOOTER FIXED (Contact & Page Numbering) */
        .footer {
            position: fixed;
            bottom: -80px;
            left: 0;
            right: 0;
            height: 100px;
            border-top: 2px solid #f28c28;
            padding-top: 10px;
            text-align: center;
        }
        .footer-details {
            font-size: 10px;
            line-height: 1.6;
            color: #444;
        }
        .company-name-footer {
            color: #1e5eb6;
            font-weight: bold;
            font-size: 12px;
        }

        /* Table Styles */
        .header-table { width: 100%; border-collapse: collapse; }
        .info-section { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-box { border: 1.5px solid #000; vertical-align: top; width: 48%; }
        .box-header { background: #f2f2f2; text-align: center; font-weight: bold; padding: 5px; border-bottom: 1.5px solid #000; }
        .box-content { padding: 8px; }

        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { border: 1px solid #000; padding: 8px; background: #f2f2f2; font-weight: bold; }
        .items-table td { border: 1px solid #000; padding: 6px; height: 25px; }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
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
                    <div style="font-size: 18px; margin-top: 15px; font-weight: bold; text-decoration: underline;">DEVIS</div>
                </td>
                <td width="35%" class="text-right">
                    <img src="{{ public_path('storage/code_qr.svg') }}" height="95">
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <div class="company-name-footer">{{ $company->name }}</div>
        <div class="footer-details">
            {{ $company->address }} — {{ $company->city }}<br>
            Tél: {{ $company->phone }} — Email: {{ $company->email }}
        </div>
    </div>

    <div class="container">
        <table class="info-section">
            <tr>
                <td class="info-box">
                    <div class="box-header">CLIENT</div>
                    <div class="box-content">
                        <strong>Nom :</strong> {{ $devis->client->nom }}<br>
                        <strong>Ville :</strong> {{ $devis->client->ville }}
                    </div>
                </td>
                <td width="4%"></td>
                <td class="info-box">
                    <div class="box-header">DEVIS N° {{ $devis->numero }}</div>
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
                    <th width="10%">Réf</th>
                    <th width="50%">DESIGNATION</th>
                    <th width="15%">PRIX.U HT</th>
                    <th width="10%">QTÉ</th>
                    <th width="15%">MONTANT</th>
                </tr>
            </thead>
            <tbody>
                @foreach($devis->items as $i => $item)
                <tr>
                    <td class="text-center">{{ chr(65+$i) }}</td>
                    <td>{{ $item->designation }}</td>
                    <td class="text-right">{{ number_format($item->prix_unitaire, 2, ',', ' ') }}</td>
                    <td class="text-center">{{ $item->quantite }}</td>
                    <td class="text-right">{{ number_format($item->total_ligne, 2, ',', ' ') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <table align="right" style="width: 35%; border-collapse: collapse;">
                <tr>
                    <td style="border: 1px solid #000; padding: 7px;"><strong>TOTAL H.T</strong></td>
                    <td class="text-right" style="border: 1px solid #000; padding: 7px;">{{ number_format($devis->total_ht, 2, ',', ' ') }}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 7px;"><strong>TVA 20%</strong></td>
                    <td class="text-right" style="border: 1px solid #000; padding: 7px;">{{ number_format($devis->total_tva, 2, ',', ' ') }}</td>
                </tr>
                <tr style="background: #f2f2f2;">
                    <td style="border: 1px solid #000; padding: 7px;"><strong>TOTAL TTC</strong></td>
                    <td class="text-right" style="border: 1px solid #000; padding: 7px;">{{ number_format($devis->total_ttc, 2, ',', ' ') }}</td>
                </tr>
            </table>
            <div style="clear: both; padding-top: 20px;">
                ARRETE LE PRESENT DEVIS A LA SOMME DE :<br>
                <strong style="text-transform: uppercase;">{{ $montantEnLettres }} DIRHAMS</strong>
            </div>
        </div>
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