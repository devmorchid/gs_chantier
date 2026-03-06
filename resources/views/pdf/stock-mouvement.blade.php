
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 190px 60px 140px 60px; }
        body { font-family: 'Helvetica', Arial, sans-serif; font-size: 11px; margin: 0; padding: 0; color: #000; }
        .sidebar { position: fixed; left: -50px; top: 0; bottom: 0; width: 30px; z-index: 1000; }
        .sidebar-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); white-space: nowrap; font-size: 9px; font-weight: bold; color: #333; width: 700px; text-align: center; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; z-index: -1000; width: 450px; }
        .header-fixed { position: fixed; top: -165px; left: 0; right: 0; height: 150px; }
        .footer { position: fixed; bottom: -95px; left: 0; right: 0; height: 125px; border-top: 2px solid #f28c28; padding-top: 10px; text-align: center; }
        .footer-details { font-size: 10px; line-height: 1.5; color: #444; }
        .company-name-footer { color: #1e5eb6; font-weight: bold; font-size: 12px; margin-bottom: 3px; }
        .website-link { color: #1e5eb6; text-decoration: underline; font-weight: bold; font-size: 11px; margin-top: 5px; display: block; }
        .header-table { width: 100%; border-collapse: collapse; }
        .info-section { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-box { border: 1.5px solid #000; vertical-align: top; width: 48%; }
        .box-header { background: #f2f2f2; text-align: center; font-weight: bold; padding: 5px; border-bottom: 1.5px solid #000; }
        .box-content { padding: 8px; line-height: 1.5; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { border: 1.5px solid #000; padding: 8px; background: #f2f2f2; font-weight: bold; }
        .items-table td { border: 1.5px solid #000; padding: 6px; height: 25px; }
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
                    <div style="font-size: 20px; margin-top: 15px; font-weight: bold; text-decoration: underline;">MOUVEMENT DE STOCK</div>
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
                    <div class="box-header">INFOS MOUVEMENT</div>
                    <div class="box-content">
                        <strong>Référence :</strong> {{ $mouvement->reference ?? '#' . $mouvement->id }}<br>
                        <strong>Date :</strong> {{ $mouvement->date }}<br>
                        <strong>Type :</strong> {{ $mouvement->type }}<br>
                        <strong>Origine :</strong> {{ $mouvement->origine ?? '-' }}<br>
                        <strong>Destination :</strong> {{ $mouvement->destination }}
                    </div>
                </td>
            </tr>
        </table>
        @php $chunks = $items->chunk(12); @endphp
        @foreach($chunks as $chunkIndex => $chunk)
        <table class="items-table">
            <thead>
                <tr>
                    <th width="10%">Réf</th>
                    <th width="60%">PRODUIT</th>
                    <th width="30%">QUANTITÉ</th>
                </tr>
            </thead>
            <tbody>
                @foreach($chunk as $i => $item)
                @php $globalIndex = $chunkIndex * 12 + $loop->index; @endphp
                <tr>
                    <td class="text-center">{{ chr(65 + ($globalIndex % 26)) . ($globalIndex >= 26 ? (intdiv($globalIndex, 26)) : '') }}</td>
                    <td class="text-left" style="padding-left: 10px;">{{ $item->produit?->name ?? '-' }}</td>
                    <td class="text-center">{{ $item->quantite }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @if(!$loop->last)
            <div style="page-break-after: always;"></div>
        @endif
        @endforeach
    </div>
    <script type="text/php">
        if (isset($pdf)) {
            $PAGE_COUNT = $pdf->get_page_count();
            if ($PAGE_COUNT > 1) {
                $text = "Page {PAGE_NUM} / {PAGE_COUNT}";
                $font = $fontMetrics->get_font("helvetica", "bold");
                $size = 9;
                $color = array(0.2, 0.2, 0.2);
                $pdf->page_text(480, 815, $text, $font, $size, $color);
            }
        }
    </script>
</body>
</html>
