<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\Attendance;

class PointageApiController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'technicien_id' => 'required|integer',
            'chantier_id' => 'required|integer',
            'action' => 'required|in:in,out',
            'selfie' => 'required|string', // base64
        ]);

        // Save selfie image
        $image = $data['selfie'];
        $image = str_replace('data:image/jpeg;base64,', '', $image);
        $image = str_replace(' ', '+', $image);
        $imageName = 'selfies/' . uniqid('selfie_') . '.jpg';
        Storage::disk('public')->put($imageName, base64_decode($image));

        // Save attendance
        Attendance::create([
            'technicien_id' => $data['technicien_id'],
            'chantier_id' => $data['chantier_id'],
            'action' => $data['action'],
            'photo_path' => $imageName,
            'date' => now(),
            'is_in' => $data['action'] === 'in' ? 1 : 0,
        ]);

        return response()->json(['success' => true]);
    }
}
