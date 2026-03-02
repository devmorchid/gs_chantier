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
                                Gestion Chantier<br>
                                Achat
                            </div>
                            <div style="font-size: 20px; margin-top: 15px; font-weight: bold; text-decoration: underline;">ACHAT</div>
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
                            <div class="box-header">INFOS ACHAT</div>
                            <div class="box-content">
                                <strong>Référence :</strong> {{ $achat->reference ?? '#' . $achat->id }}<br>
                                <strong>Date :</strong> {{ $achat->date }}<br>
                                <strong>Fournisseur :</strong> {{ $achat->fournisseur?->name ?? '-' }}<br>
                                <strong>Statut :</strong> {{ $achat->status_label }}
                            </div>
                        </td>
                    </tr>
                </table>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th width="40%">Produit</th>
                            <th width="20%">Quantité</th>
                            <th width="20%">Prix unitaire</th>
                            <th width="20%">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($items as $i => $item)
                        <tr>
                            <td class="text-left" style="padding-left: 10px;">{{ $item->produit?->name ?? '-' }}</td>
                            <td class="text-center">{{ $item->quantite }}</td>
                            <td class="text-right">{{ number_format($item->prix_unitaire, 2, ',', ' ') }}</td>
                            <td class="text-right">{{ number_format($item->total, 2, ',', ' ') }}</td>
                        </tr>
                        @endforeach
                        @for ($i = count($items); $i < 12; $i++)
                        <tr>
                            <td class="text-left">-</td>
                            <td class="text-center">0</td>
                            <td class="text-right">0,00</td>
                            <td class="text-right">0,00</td>
                        </tr>
                        @endfor
                    </tbody>
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
