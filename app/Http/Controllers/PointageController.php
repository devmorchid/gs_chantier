<?php

namespace App\Http\Controllers;

use App\Models\Technicien;
use App\Models\Pointage;
use App\Models\Chantier;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;

class PointageController extends Controller
{
    /**
     * Render scanner page with chantier selection
     */
    public function scanner(Request $request)
    {
        $user = auth()->user();
        
        // Get chantiers based on role
        $query = Chantier::whereIn('statut', ['en_cours', 'en_attente']);
        
        if ($user->hasRole('chef_chantier')) {
            $query->where('user_id', $user->id);
        }
        
        $chantiers = $query->orderBy('nom')->get(['id', 'nom', 'reference']);
        
        return Inertia::render('pointages/scanner', [
            'csrf_token' => $request->session()->token(),
            'chantiers' => $chantiers,
        ]);
    }

    /**
     * API: /api/pointage/scan
     * 
     * POST {
     *   "qr_code": "TECH-0001",
     *   "chantier_id": 1 (optional),
     *   "latitude": 33.5731 (optional - pour geofencing),
     *   "longitude": -7.5898 (optional - pour geofencing),
     *   "photo_base64": "data:image/jpeg;base64,..." (optional)
     * }
     */
    public function scan(Request $request)
    {
        $request->validate([
            'qr_code' => 'nullable|string',
            'qr_token' => 'nullable|string',
            'chantier_id' => 'nullable|exists:chantiers,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'photo_base64' => 'nullable|string',
        ]);

        // Support both qr_code and qr_token
        $qrValue = trim($request->qr_code ?? $request->qr_token ?? '');
        
        // Log what was scanned for debugging
        \Log::info('QR Scan attempt', ['qr_value' => $qrValue]);
        
        if (!$qrValue) {
            return response()->json(['status' => 'error', 'message' => 'QR code requis'], 400);
        }

        // Try multiple matching strategies
        $technicien = null;
        
        // 1. Exact match on qr_code
        $technicien = Technicien::where('qr_code', $qrValue)->first();
        
        // 2. Case-insensitive match
        if (!$technicien) {
            $technicien = Technicien::whereRaw('LOWER(qr_code) = ?', [strtolower($qrValue)])->first();
        }
        
        // 3. Match by ID if format is TECH-XXXX
        if (!$technicien && preg_match('/^TECH-?(\d+)$/i', $qrValue, $matches)) {
            $technicien = Technicien::find((int) $matches[1]);
        }
        
        // 4. Match if it's just a number
        if (!$technicien && is_numeric($qrValue)) {
            $technicien = Technicien::find((int) $qrValue);
        }

        if (!$technicien) {
            \Log::warning('QR code not found', ['qr_value' => $qrValue]);
            return response()->json(['status' => 'error', 'message' => "QR code non valide: {$qrValue}"], 404);
        }

        // If chantier_id provided, verify it exists
        $chantier = null;
        if ($request->chantier_id) {
            $chantier = Chantier::find($request->chantier_id);
            if (!$chantier) {
                return response()->json(['status' => 'error', 'message' => 'Chantier non trouvé'], 404);
            }

            // 🔒 Geofencing: Vérifier que le technicien est dans le rayon du chantier
            if ($chantier->hasGpsCoordinates()) {
                // Si le chantier a des coordonnées GPS, on exige que le technicien envoie sa position
                if (!$request->latitude || !$request->longitude) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Position GPS requise pour ce chantier. Veuillez activer la localisation.',
                        'require_gps' => true,
                    ], 400);
                }

                // Vérifier si le technicien est dans le rayon autorisé
                $distance = $chantier->getDistanceFrom($request->latitude, $request->longitude);
                
                if (!$chantier->isWithinRadius($request->latitude, $request->longitude)) {
                    // Formater la distance pour affichage clair
                    $distanceKm = $distance >= 1000 
                        ? number_format($distance / 1000, 1) . ' km' 
                        : round($distance) . ' m';
                    
                    return response()->json([
                        'status' => 'error',
                        'message' => "⚠️ Vous n'êtes pas sur le chantier ! Vous êtes à {$distanceKm} du site. Rapprochez-vous du chantier pour pointer.",
                        'distance' => round($distance),
                        'rayon_autorise' => $chantier->radius ?? 100,
                        'hors_zone' => true,
                    ], 403);
                }
                
                \Log::info('GPS Geofencing OK', [
                    'technicien_id' => $technicien->id,
                    'chantier_id' => $chantier->id,
                    'distance' => round($distance) . 'm',
                    'rayon' => $chantier->radius . 'm',
                ]);
            }
        }

        $today = today()->toDateString();
        $photoPath = null;

        // حفظ الصورة (Selfie)
        if ($request->photo_base64) {
            $photoPath = $this->saveSelfie($request->photo_base64, $technicien->id, 'checkin');
        }

        // البحث عن pointage مفتوح اليوم (check_in موجود و check_out فارغ)
        $pointageQuery = Pointage::where('technicien_id', $technicien->id)
            ->whereDate('date', $today)
            ->whereNull('check_out');  // فقط pointages مفتوحة
            
        if ($request->chantier_id) {
            $pointageQuery = $pointageQuery->where('chantier_id', $request->chantier_id);
        }
        
        $pointage = $pointageQuery->first();

        if (!$pointage) {
            // Check if already has a completed pointage today (technicien can only do ONE pointage per day)
            $completedTodayQuery = Pointage::where('technicien_id', $technicien->id)
                ->whereDate('date', $today)
                ->whereNotNull('check_out');  // Already checked out
                
            if ($request->chantier_id) {
                $completedTodayQuery = $completedTodayQuery->where('chantier_id', $request->chantier_id);
            }
            
            if ($completedTodayQuery->exists()) {
                return response()->json([
                    'status' => 'already_completed',
                    'message' => 'Vous avez déjà terminé votre journée. Un seul pointage par jour autorisé.',
                ], 422);
            }
            
            // Nouveau check-in (دخول جديد)
            $pointage = Pointage::create([
                'technicien_id' => $technicien->id,
                'chantier_id' => $request->chantier_id,
                'date' => $today,
                'check_in' => now(),
                'photo_checkin' => $photoPath,
                'token_verification' => $qrValue,
            ]);

            return response()->json([
                'status' => 'check_in',
                'message' => 'Bienvenue ' . $technicien->nom,
                'technicien' => [
                    'id' => $technicien->id,
                    'nom' => $technicien->nom,
                    'prenom' => $technicien->prenom,
                    'specialite_label' => $technicien->specialite_label,
                    'qr_code' => $technicien->qr_code,
                    'photo_reference' => $technicien->photo_reference,
                ],
                'time' => $pointage->check_in->format('H:i:s'),
            ]);
        } else {
            // Vérifier qu'au moins 1 heure s'est écoulée depuis le check-in
            $checkInTime = $pointage->check_in;
            $now = now();
            
            // Utiliser Carbon pour un calcul précis
            $minutesSinceCheckIn = abs($checkInTime->diffInMinutes($now));
            
            \Log::info('Check-out time validation', [
                'check_in' => $checkInTime->toDateTimeString(),
                'now' => $now->toDateTimeString(),
                'minutes_since_checkin' => $minutesSinceCheckIn,
                'timezone' => config('app.timezone'),
            ]);
            
            if ($minutesSinceCheckIn < 60) {
                $minutesRestantes = round(60 - $minutesSinceCheckIn);
                return response()->json([
                    'status' => 'error',
                    'message' => "Vous devez attendre au moins 1 heure avant de pointer la sortie. Il reste {$minutesRestantes} minutes.",
                    'technicien' => [
                        'id' => $technicien->id,
                        'nom' => $technicien->nom,
                        'prenom' => $technicien->prenom,
                        'specialite_label' => $technicien->specialite_label,
                        'qr_code' => $technicien->qr_code,
                        'photo_reference' => $technicien->photo_reference,
                    ],
                    'check_in_time' => $checkInTime->format('H:i:s'),
                    'minutes_restantes' => $minutesRestantes,
                ], 400);
            }

            // check-out (خروج)
            $pointage->update([
                'check_out' => now(),
                'photo_checkout' => $photoPath,
            ]);

            // Refresh to get the updated check_out value
            $pointage->refresh();

            $heures = $this->calculateHeures($pointage->check_in, $pointage->check_out);

            return response()->json([
                'status' => 'check_out',
                'message' => 'À bientôt ' . $technicien->nom,
                'technicien' => [
                    'id' => $technicien->id,
                    'nom' => $technicien->nom,
                    'prenom' => $technicien->prenom,
                    'specialite_label' => $technicien->specialite_label,
                    'qr_code' => $technicien->qr_code,
                    'photo_reference' => $technicien->photo_reference,
                ],
                'time' => $pointage->check_out->format('H:i:s'),
                'heures_travaillees' => $heures,
            ]);
        }
    }

    /**
     * حفظ صورة الـ Selfie
     */
    private function saveSelfie($base64, $technicienId, $type = 'checkin')
    {
        // إزالة رؤوس data URL
        $image_data = preg_replace('#^data:image/\w+;base64,#i', '', $base64);
        $image_data = base64_decode($image_data);

        // إنشاء اسم فريد
        $filename = sprintf(
            'selfie_%d_%s_%s.jpg',
            $technicienId,
            $type,
            now()->format('YmdHis')
        );

        $path = 'pointages/' . date('Y/m/d') . '/' . $filename;
        \Storage::disk('public')->put($path, $image_data);

        return '/storage/' . $path;
    }

    /**
     * حساب عدد الساعات
     */
    private function calculateHeures($checkin, $checkout)
    {
        // Si ce sont déjà des objets Carbon (grâce au cast), on les utilise directement
        if ($checkin instanceof \Carbon\Carbon && $checkout instanceof \Carbon\Carbon) {
            return round($checkout->diffInSeconds($checkin) / 3600, 2);
        }
        
        // Sinon, on essaie de parser comme string
        $start = Carbon::parse($checkin);
        $end = Carbon::parse($checkout);

        return round($end->diffInSeconds($start) / 3600, 2);
    }
}
