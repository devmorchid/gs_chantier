<?php
namespace App\Http\Controllers;

use App\Models\Chantier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChantierListController extends Controller
{
    public function index(Request $request)
    {
        // Récupérer tous les chantiers (en cours + terminés)
        $chantiers = Chantier::orderByDesc('created_at')->get(['id', 'nom', 'reference', 'statut']);
        return response()->json($chantiers);
    }
}
