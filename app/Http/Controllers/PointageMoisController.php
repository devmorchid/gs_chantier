<?php
namespace App\Http\Controllers;

use App\Models\Technicien;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PointageMoisController extends Controller
{
    public function index(Request $request)
    {
        $mois = $request->query('mois', date('m'));
        $annee = $request->query('annee', date('Y'));
        $daysInMonth = Carbon::create($annee, $mois, 1)->daysInMonth;
        $start = Carbon::create($annee, $mois, 1)->startOfDay();
        $end = Carbon::create($annee, $mois, $daysInMonth)->endOfDay();

        $techniciens = Technicien::orderBy('nom')->get();
        $attendances = Attendance::whereBetween('date', [$start, $end])->get();

        $data = $techniciens->map(function ($tech) use ($attendances, $daysInMonth, $mois, $annee) {
            $presence = [];
            $daysPresent = 0;
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $date = sprintf('%04d-%02d-%02d', $annee, $mois, $d);
                $att = $attendances->first(function ($a) use ($tech, $date) {
                    return $a->technicien_id == $tech->id && $a->date == $date && $a->is_in;
                });
                $presence[$d] = $att ? true : false;
                if ($att) $daysPresent++;
            }
            return [
                'id' => $tech->id,
                'nom' => $tech->nom,
                'prenom' => $tech->prenom,
                'salaire_journalier' => $tech->salaire_journalier,
                'presence' => $presence,
                'days_present' => $daysPresent,
                'total' => $daysPresent * $tech->salaire_journalier,
            ];
        });

        return Inertia::render('pointages/mois', [
            'mois' => $mois,
            'annee' => $annee,
            'daysInMonth' => $daysInMonth,
            'techniciens' => $data,
        ]);
    }
}
