<?php
namespace App\Helpers;

use Intervention\Image\ImageManager;
use BaconQrCode\Writer;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;

class QrHelper
{
    public static function devisInfoQr($devis, $company)
    {
        // Générer le contenu QR code avec toutes les infos importantes
        $chantier = $devis->chantier ?? null;
        $client = $chantier && isset($chantier->client) ? $chantier->client : null;

        $qrContent = [
            'Société' => $company->name ?? '',
            'Forme juridique' => $company->legal_form ?? '',
            'ICE' => $company->ice ?? '',
            'IF' => $company->if ?? '',
            'RC' => $company->rc ?? '',
            'CNSS' => $company->cnss ?? '',
            'TP' => $company->patent ?? '',
            'Adresse' => $company->address ?? '',
            'Téléphone' => $company->phone ?? '',
            'Email' => $company->email ?? '',
            'Devis' => $devis->numero ?? '',
            'Date' => $devis->date ? $devis->date->format('d/m/Y') : '',
            'Client' => $client->nom ?? '',
            'Chantier' => $chantier->nom ?? '',
            'Montant TTC' => $devis->total_ttc ?? '',
        ];
        $qrText = '';
        foreach ($qrContent as $k => $v) {
            if ($v) $qrText .= $k . ': ' . $v . "\n";
        }

        $fileNameSvg = 'qr_devis_' . ($devis->id ?? uniqid()) . '.svg';
        $filePathSvg = storage_path('app/public/' . $fileNameSvg);

        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $qrSvg = $writer->writeString($qrText);
        file_put_contents($filePathSvg, $qrSvg);

        // Convertir SVG en PNG pour DomPDF
        $fileNamePng = str_replace('.svg', '.png', $fileNameSvg);
        $filePathPng = storage_path('app/public/' . $fileNamePng);
        $manager = new ImageManager(['driver' => 'gd']);
        $image = $manager->make($filePathSvg);
        $image->save($filePathPng);

        return $fileNamePng;
    }
}
