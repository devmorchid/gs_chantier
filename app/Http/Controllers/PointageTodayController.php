<?php
namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Technicien;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PointageTodayController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today()->toDateString();
        $attendances = Attendance::with('technicien')
            ->whereDate('date', $today)
            ->get();
        $techniciens = Technicien::all();

        $data = $techniciens->map(function ($tech) use ($attendances) {
            $pointage = $attendances->firstWhere('technicien_id', $tech->id);
            $status = 'absent';
            $check_in = null;
            $check_out = null;
            $photo = $tech->photo_reference;
            if ($pointage) {
                $check_in = $pointage->check_in;
                $check_out = $pointage->check_out;
                if ($check_in && $check_out) {
                    $status = 'present';
                } elseif ($check_in) {
                    $status = 'en_cours';
                }
            }
            return [
                'id' => $tech->id,
                'nom' => $tech->nom,
                'prenom' => $tech->prenom,
                'photo' => $photo,
                'check_in' => $check_in,
                'check_out' => $check_out,
                'status' => $status,
            ];
        });

        return Inertia::render('pointages/today', [
            'techniciens' => $data,
            'date' => $today,
        ]);
    }
}
