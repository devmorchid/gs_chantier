<?php
namespace App\Http\Controllers;

use App\Models\ChantierTechnicien;
use App\Models\Attendance;
use App\Models\Chantier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TechnicienPointageController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $technicienId = $user->technicien_id ?? null;
        if (!$technicienId) {
            abort(403, 'Aucun technicien lié à ce compte.');
        }
        $affectations = ChantierTechnicien::with('chantier')
            ->where('technicien_id', $technicienId)
            ->where('actif', true)
            ->get();
        return Inertia::render('technicien/pointage', [
            'affectations' => $affectations,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $technicienId = $user->technicien_id ?? null;
        if (!$technicienId) {
            abort(403, 'Aucun technicien lié à ce compte.');
        }
        $data = $request->validate([
            'chantier_id' => 'required|exists:chantiers,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo_path' => 'nullable|string',
            'check_in' => 'required|date_format:H:i',
        ]);
        Attendance::create([
            'chantier_id' => $data['chantier_id'],
            'technicien_id' => $technicienId,
            'date' => now()->toDateString(),
            'check_in' => $data['check_in'],
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'photo_path' => $data['photo_path'] ?? null,
            'status' => 'present',
        ]);
        return back()->with('success', 'Pointage enregistré.');
    }
}
