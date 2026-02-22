<?php
namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Technicien;
use App\Models\ChantierTechnicien;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChantierTechnicienController extends Controller
{
    public function index($chantierId)
    {
        $chantier = Chantier::findOrFail($chantierId);
        $affectations = ChantierTechnicien::with('technicien')
            ->where('chantier_id', $chantierId)
            ->orderByDesc('actif')
            ->get();
        $techniciens = Technicien::all();
        return Inertia::render('chantier_technicien/index', [
            'chantier' => $chantier,
            'affectations' => $affectations,
            'techniciens' => $techniciens,
        ]);
    }

    public function store(Request $request, $chantierId)
    {
        $data = $request->validate([
            'technicien_id' => 'required|exists:techniciens,id',
            'date_affectation' => 'required|date',
        ]);
        ChantierTechnicien::create([
            'chantier_id' => $chantierId,
            'technicien_id' => $data['technicien_id'],
            'date_affectation' => $data['date_affectation'],
            'actif' => true,
        ]);
        return back()->with('success', 'Technicien affecté avec succès.');
    }

    public function finish($id)
    {
        $aff = ChantierTechnicien::findOrFail($id);
        $aff->update(['date_fin' => now(), 'actif' => false]);
        return back()->with('success', 'Affectation terminée.');
    }
}
