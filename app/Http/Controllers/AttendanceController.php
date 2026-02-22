<?php
namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Chantier;
use App\Models\Technicien;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function index($chantierId)
    {
        $chantier = Chantier::findOrFail($chantierId);
        $attendances = Attendance::with('technicien')
            ->where('chantier_id', $chantierId)
            ->where('date', now()->toDateString())
            ->get();
        return Inertia::render('attendances/index', [
            'chantier' => $chantier,
            'attendances' => $attendances,
        ]);
    }

    public function store(Request $request, $chantierId)
    {
        $data = $request->validate([
            'technicien_id' => 'required|exists:techniciens,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo_path' => 'nullable|string',
            'check_in' => 'required|date_format:H:i',
        ]);
        Attendance::create([
            'chantier_id' => $chantierId,
            'technicien_id' => $data['technicien_id'],
            'date' => now()->toDateString(),
            'check_in' => $data['check_in'],
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'photo_path' => $data['photo_path'] ?? null,
            'status' => 'present',
        ]);
        return back()->with('success', 'Pointage enregistré.');
    }

    public function checkout(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);
        $data = $request->validate([
            'check_out' => 'required|date_format:H:i',
        ]);
        $attendance->update(['check_out' => $data['check_out']]);
        return back()->with('success', 'Check-out enregistré.');
    }
}
