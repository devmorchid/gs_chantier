<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use Inertia\Inertia;

class CompanyController extends Controller
{
    /**
     * Afficher le formulaire des paramètres de l'entreprise
     */
    public function edit()
    {
        $settings = CompanySetting::getSettings();

        return Inertia::render('settings/company', [
            'settings' => [
                'name' => $settings->name,
                'legal_form' => $settings->legal_form,
                'ice' => $settings->ice,
                'if' => $settings->if,
                'rc' => $settings->rc,
                'cnss' => $settings->cnss,
                'patent' => $settings->patent,
                'address' => $settings->address,
                'city' => $settings->city,
                'postal_code' => $settings->postal_code,
                'country' => $settings->country,
                'phone' => $settings->phone,
                'fax' => $settings->fax,
                'email' => $settings->email,
                'website' => $settings->website,
                'bank_name' => $settings->bank_name,
                'bank_rib' => $settings->bank_rib,
                'bank_iban' => $settings->bank_iban,
                'bank_swift' => $settings->bank_swift,
                'logo' => $settings->logo,
            ],
            'legalForms' => CompanySetting::LEGAL_FORMS,
        ]);
    }

    /**
     * Mettre à jour les paramètres de l'entreprise
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            // Informations de base
            'name' => 'nullable|string|max:255',
            'legal_form' => 'nullable|string|in:' . implode(',', array_keys(CompanySetting::LEGAL_FORMS)),
            
            // Identifiants fiscaux
            'ice' => 'nullable|string|size:15',
            'if' => 'nullable|string|max:50',
            'rc' => 'nullable|string|max:50',
            'cnss' => 'nullable|string|max:50',
            'patent' => 'nullable|string|max:50',
            
            // Coordonnées
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'country' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'fax' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            
            // Informations bancaires
            'bank_name' => 'nullable|string|max:255',
            'bank_rib' => 'nullable|string|max:30',
            'bank_iban' => 'nullable|string|max:34',
            'bank_swift' => 'nullable|string|max:11',
        ]);

        $settings = CompanySetting::getSettings();
        $settings->update($validated);

        // Générer le QR code avec les infos
        $qrData = [
            'Nom' => $settings->name,
            'ICE' => $settings->ice,
            'RC' => $settings->rc,
            'IF' => $settings->if,
            'CNSS' => $settings->cnss,
            'Patente' => $settings->patent,
            'Adresse' => $settings->address,
            'Ville' => $settings->city,
            'Code postal' => $settings->postal_code,
            'Pays' => $settings->country,
            'Téléphone' => $settings->phone,
            'Fax' => $settings->fax,
            'Email' => $settings->email,
            'Site' => $settings->website,
            'Banque' => $settings->bank_name,
            'RIB' => $settings->bank_rib,
            'IBAN' => $settings->bank_iban,
            'SWIFT' => $settings->bank_swift,
        ];
        $qrText = collect($qrData)
            ->filter(fn($v) => !empty($v))
            ->map(fn($v, $k) => $k . ': ' . $v)
            ->implode("\n");

        try {
            // Supprimer l'ancien SVG QR code
            Storage::disk('public')->delete('code_qr.svg');
            // Générer SVG QR code
            $svgRenderer = new \BaconQrCode\Renderer\Image\SvgImageBackEnd();
            $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                new \BaconQrCode\Renderer\RendererStyle\RendererStyle(400),
                $svgRenderer
            );
            $writer = new \BaconQrCode\Writer($renderer);
            $svg = $writer->writeString($qrText);
            Storage::disk('public')->put('code_qr.svg', $svg);
            // Convertir SVG → PNG avec Intervention Image
            $image = Image::load($svg)->encode('png');
            Storage::disk('public')->put('code_qr.png', $image);
        } catch (\Throwable $e) {
            // Ignore QR errors
        }

        return back()->with('success', 'Paramètres de l\'entreprise mis à jour avec succès.');
    }

    /**
     * Upload du logo
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ], [
            'logo.required' => 'Veuillez sélectionner un fichier.',
            'logo.image' => 'Le fichier doit être une image.',
            'logo.mimes' => 'Format accepté: JPG, PNG, GIF, SVG, WEBP.',
            'logo.max' => 'Taille maximum: 5 MB.',
        ]);

        $settings = CompanySetting::getSettings();

        // Supprimer l'ancien logo
        if ($settings->logo && Storage::disk('public')->exists($settings->logo)) {
            Storage::disk('public')->delete($settings->logo);
        }

        $file = $request->file('logo');
        $extension = $file->getClientOriginalExtension();
        $filename = 'logo_' . time() . '.' . $extension;
        
        // Pour les SVG, on les stocke directement
        if (strtolower($extension) === 'svg') {
            $path = $file->storeAs('company', $filename, 'public');
        } else {
            // Redimensionner l'image pour optimiser la taille (max 300px)
            $image = Image::read($file);
            $image->scaleDown(width: 300, height: 300);
            
            // Stocker l'image redimensionnée
            $path = 'company/' . $filename;
            Storage::disk('public')->put($path, $image->toJpeg(80));
        }
        
        $settings->update(['logo' => $path]);

        return back()->with('success', 'Logo mis à jour avec succès.');
    }

    /**
     * Supprimer le logo
     */
    public function deleteLogo()
    {
        $settings = CompanySetting::getSettings();

        if ($settings->logo && Storage::disk('public')->exists($settings->logo)) {
            Storage::disk('public')->delete($settings->logo);
        }

        $settings->update(['logo' => null]);

        return back()->with('success', 'Logo supprimé avec succès.');
    }
}
