<?php
namespace App\Http\Controllers;

use App\Models\ChantierTechnicien;
use App\Models\Technicien;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PointageSimpleController extends Controller
{
    public function index(Request $request)
    {
        // Pour la démo, on prend tous les techniciens actifs du premier chantier trouvé
        $chantierId = $request->query('chantier_id') ?? 1;
        $techniciens = ChantierTechnicien::with('technicien')
            ->where('chantier_id', $chantierId)
            ->where('actif', true)
            ->get()
            ->map(function ($aff) use ($chantierId) {
                $last = Attendance::where('chantier_id', $chantierId)
                    ->where('technicien_id', $aff->technicien->id)
                    ->orderByDesc('date')
                    ->first();
                return [
                    'id' => $aff->technicien->id,
                    'nom' => $aff->technicien->nom,
                    'photo_url' => $aff->technicien->photo_url ?? null,
                    'last_action' => $last ? $last->action : null,
                    'is_in' => $last ? $last->is_in : 0,
                ];
            });
        return Inertia::render('pointage/index', [
            'techniciens' => $techniciens,
        ]);
    }
}
