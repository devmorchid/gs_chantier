<?php

namespace App\Http\Controllers;

use App\Models\Chantier;
use App\Models\Charge;
use App\Models\CompanySetting;
use App\Models\User;
use App\Notifications\ChargeDecisionNotification;
use App\Notifications\ChargeSubmittedNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ChargeController extends Controller
{
    protected function ensureChargeAccess(Request $request, Charge $charge): void
    {
        $user = $request->user();

        if ($user->hasRole('chef_chantier')) {
            $charge->loadMissing('chantier');
            if (!$charge->chantier || $charge->chantier->user_id !== $user->id) {
                abort(403, 'Acces non autorise a cette charge.');
            }
        }
    }

    protected function ensureChefCanEditRejectedCharge(Request $request, Charge $charge): void
    {
        $user = $request->user();
        if (!$user->hasRole('chef_chantier')) {
            abort(403, 'Acces non autorise.');
        }

        $this->ensureChargeAccess($request, $charge);

        if ($charge->status !== 'rejected') {
            abort(403, 'Seules les charges refusees peuvent etre modifiees.');
        }

        if ($charge->created_by_id && $charge->created_by_id !== $user->id) {
            abort(403, 'Acces non autorise a cette charge.');
        }
    }

    protected function notifyAdminsForCharge(Charge $charge, string $chefName, bool $isResubmission = false): void
    {
        $admins = User::query()
            ->role('admin')
            ->where('status', 'active')
            ->get();

        if ($admins->isNotEmpty()) {
            Notification::send($admins, new ChargeSubmittedNotification($charge, $chefName, $isResubmission));
        }
    }

    protected function notifyChefDecision(Charge $charge, string $adminName): void
    {
        $chef = $charge->createdBy;

        if (!$chef && $charge->chantier?->user_id) {
            $chef = User::find($charge->chantier->user_id);
        }

        if ($chef) {
            $chef->notify(new ChargeDecisionNotification($charge, $adminName));
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->hasRole('admin');
        $filters = $request->only(['type', 'status', 'date_from', 'date_to', 'chantier_id']);

        $query = Charge::query()
            ->with(['chantier:id,nom,reference,user_id'])
            ->when($user->hasRole('chef_chantier'), function ($q) use ($user) {
                $q->whereHas('chantier', fn ($sub) => $sub->where('user_id', $user->id));
            })
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->where('type', 'like', '%' . $type . '%'))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['date_from'] ?? null, fn ($q, $from) => $q->whereDate('date', '>=', $from))
            ->when($filters['date_to'] ?? null, fn ($q, $to) => $q->whereDate('date', '<=', $to))
            ->when($filters['chantier_id'] ?? null, fn ($q, $chantierId) => $q->where('chantier_id', $chantierId))
            ->orderByDesc('date');

        $charges = $query->paginate(20)->withQueryString();
        $charges->getCollection()->transform(fn (Charge $charge) => [
            'id' => $charge->id,
            'reference' => $charge->reference,
            'libelle' => $charge->libelle,
            'type' => $charge->type,
            'type_label' => $charge->type_label,
            'montant' => (float) $charge->montant,
            'date' => $charge->date?->format('d/m/Y'),
            'status' => $charge->status,
            'status_label' => $charge->status_label,
            'rejection_reason' => $charge->rejection_reason,
            'payment_method' => $charge->payment_method,
            'can_edit' => $isAdmin
                ? $charge->status !== 'accepted'
                : $charge->status === 'rejected',
            'chantier' => $charge->chantier ? [
                'id' => $charge->chantier->id,
                'reference' => $charge->chantier->reference,
                'nom' => $charge->chantier->nom,
            ] : null,
        ]);

        $chantierOptions = Chantier::query()
            ->when($user->hasRole('chef_chantier'), fn ($q) => $q->where('user_id', $user->id))
            ->orderBy('nom')
            ->get(['id', 'reference', 'nom']);

        return Inertia::render('charges/index', [
            'charges' => $charges,
            'filters' => $filters,
            'statuts' => Charge::STATUTS,
            'types' => Charge::TYPES,
            'chantiers' => $chantierOptions,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        $requiresChantier = $user->hasRole('chef_chantier');
        $isAdmin = $user->hasRole('admin');

        $chantiers = Chantier::query()
            ->when($requiresChantier, fn ($q) => $q->where('user_id', $user->id))
            ->orderBy('nom')
            ->get(['id', 'reference', 'nom']);

        return Inertia::render('charges/create', [
            'statuts' => Charge::STATUTS,
            'types' => Charge::TYPES,
            'chantiers' => $chantiers,
            'requiresChantier' => $requiresChantier,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $rules = [
            'libelle' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'chantier_id' => 'nullable|exists:chantiers,id',
            'montant' => 'required|numeric|min:0',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'payment_method' => 'nullable|string|max:255',
            'status' => 'required|in:' . implode(',', array_keys(Charge::STATUTS)),
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:pdf,jpg,jpeg,png|max:5120',
        ];

        $rules['type'] = 'required|in:' . implode(',', array_keys(Charge::TYPES));

        if ($user->hasRole('chef_chantier')) {
            $rules['chantier_id'] = 'required|exists:chantiers,id';
        }

        $validated = $request->validate($rules);

        if ($user->hasRole('chef_chantier')) {
            $validated['type'] = 'entreprise';
        }

        if ($user->hasRole('chef_chantier')) {
            $validated['status'] = 'pending';
        }

        $validated['created_by_id'] = $user->id;

        if ($user->hasRole('chef_chantier')) {
            $ownsChantier = Chantier::where('id', $validated['chantier_id'])
                ->where('user_id', $user->id)
                ->exists();

            if (!$ownsChantier) {
                abort(403, 'Acces non autorise a ce chantier.');
            }
        }

        $charge = Charge::create($validated);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('charges', 'public');
                $charge->attachments()->create([
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType() ?? '',
                    'size' => $file->getSize(),
                ]);
            }
        }

        if ($user->hasRole('chef_chantier')) {
            $this->notifyAdminsForCharge($charge, $user->name, false);
        }

        return redirect()->route('charges.index')
            ->with('success', 'Charge enregistree avec succes.');
    }

    public function show(Request $request, Charge $charge)
    {
        $this->ensureChargeAccess($request, $charge);
        $charge->load(['chantier:id,nom,reference', 'attachments']);
        $user = $request->user();
        $isAdmin = $user->hasRole('admin');
        $canEdit = $isAdmin
            ? $charge->status !== 'accepted'
            : ($user->hasRole('chef_chantier') && $charge->status === 'rejected');

        return Inertia::render('charges/show', [
            'charge' => [
                'id' => $charge->id,
                'reference' => $charge->reference,
                'libelle' => $charge->libelle,
                'type' => $charge->type,
                'type_label' => $charge->type_label,
                'montant' => (float) $charge->montant,
                'date' => $charge->date?->format('d/m/Y'),
                'status' => $charge->status,
                'status_label' => $charge->status_label,
                'rejection_reason' => $charge->rejection_reason,
                'payment_method' => $charge->payment_method,
                'description' => $charge->description,
                'chantier' => $charge->chantier ? [
                    'id' => $charge->chantier->id,
                    'reference' => $charge->chantier->reference,
                    'nom' => $charge->chantier->nom,
                ] : null,
                'attachments' => $charge->attachments->map(fn ($file) => [
                    'id' => $file->id,
                    'name' => $file->original_name,
                    'mime_type' => $file->mime_type,
                    'size' => $file->size,
                    'url' => Storage::disk('public')->url($file->path),
                ]),
            ],
            'canEdit' => $canEdit,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function edit(Request $request, Charge $charge)
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            return Inertia::render('charges/edit', [
                'charge' => [
                    'id' => $charge->id,
                    'reference' => $charge->reference,
                    'libelle' => $charge->libelle,
                    'status' => $charge->status,
                    'status_label' => $charge->status_label,
                    'rejection_reason' => $charge->rejection_reason,
                    'date' => $charge->date?->format('d/m/Y'),
                    'type_label' => $charge->type_label,
                ],
                'statuts' => Charge::STATUTS,
                'canEdit' => $charge->status !== 'accepted',
            ]);
        }

        $this->ensureChefCanEditRejectedCharge($request, $charge);
        $charge->load(['chantier:id,nom,reference,user_id', 'attachments']);

        $chantiers = Chantier::query()
            ->where('user_id', $user->id)
            ->orderBy('nom')
            ->get(['id', 'reference', 'nom']);

        return Inertia::render('charges/edit-chef', [
            'charge' => [
                'id' => $charge->id,
                'reference' => $charge->reference,
                'libelle' => $charge->libelle,
                'type' => $charge->type,
                'chantier_id' => $charge->chantier_id,
                'montant' => (float) $charge->montant,
                'date' => $charge->date?->format('Y-m-d'),
                'description' => $charge->description,
                'payment_method' => $charge->payment_method,
                'status' => $charge->status,
                'status_label' => $charge->status_label,
                'rejection_reason' => $charge->rejection_reason,
                'attachments' => $charge->attachments->map(fn ($file) => [
                    'id' => $file->id,
                    'name' => $file->original_name,
                    'mime_type' => $file->mime_type,
                    'size' => $file->size,
                    'url' => Storage::disk('public')->url($file->path),
                ]),
            ],
            'chantiers' => $chantiers,
        ]);
    }

    public function update(Request $request, Charge $charge)
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            if ($charge->status === 'accepted') {
                abort(403, 'Cette charge est deja acceptee.');
            }

            $validated = $request->validate([
                'status' => 'required|in:' . implode(',', array_keys(Charge::STATUTS)),
                'rejection_reason' => 'nullable|string|max:2000',
            ]);

            if ($validated['status'] === 'rejected' && empty(trim((string) ($validated['rejection_reason'] ?? '')))) {
                return back()->withErrors([
                    'rejection_reason' => 'Le motif de refus est obligatoire quand la charge est refusee.',
                ]);
            }

            $charge->update([
                'status' => $validated['status'],
                'rejection_reason' => $validated['status'] === 'rejected'
                    ? trim((string) $validated['rejection_reason'])
                    : null,
            ]);

            if (in_array($charge->status, ['accepted', 'rejected'], true)) {
                $this->notifyChefDecision($charge, $user->name);
            }

            return redirect()->route('charges.show', $charge)
                ->with('success', 'Statut mis a jour avec succes.');
        }

        $this->ensureChefCanEditRejectedCharge($request, $charge);

        $validated = $request->validate([
            'libelle' => 'required|string|max:255',
            'chantier_id' => 'required|exists:chantiers,id',
            'montant' => 'required|numeric|min:0',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'payment_method' => 'nullable|string|max:255',
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:pdf,jpg,jpeg,png|max:5120',
            'delete_attachment_ids' => 'nullable|array',
            'delete_attachment_ids.*' => [
                'integer',
                Rule::exists('charge_attachments', 'id')->where(fn ($q) => $q->where('charge_id', $charge->id)),
            ],
        ]);

        $ownsChantier = Chantier::query()
            ->where('id', $validated['chantier_id'])
            ->where('user_id', $user->id)
            ->exists();

        if (!$ownsChantier) {
            abort(403, 'Acces non autorise a ce chantier.');
        }

        $charge->update([
            'libelle' => $validated['libelle'],
            'type' => 'entreprise',
            'chantier_id' => $validated['chantier_id'],
            'montant' => $validated['montant'],
            'date' => $validated['date'],
            'description' => $validated['description'] ?? null,
            'payment_method' => $validated['payment_method'] ?? null,
            'status' => 'pending',
            'rejection_reason' => null,
        ]);

        if (!empty($validated['delete_attachment_ids'])) {
            $attachmentsToDelete = $charge->attachments()
                ->whereIn('id', $validated['delete_attachment_ids'])
                ->get();

            foreach ($attachmentsToDelete as $attachment) {
                Storage::disk('public')->delete($attachment->path);
                $attachment->delete();
            }
        }

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('charges', 'public');
                $charge->attachments()->create([
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType() ?? '',
                    'size' => $file->getSize(),
                ]);
            }
        }

        $this->notifyAdminsForCharge($charge, $user->name, true);

        return redirect()->route('charges.show', $charge)
            ->with('success', 'Charge refusee modifiee et renvoyee a l\'administrateur.');
    }

    public function pdf(Request $request, Charge $charge)
    {
        $this->ensureChargeAccess($request, $charge);
        $charge->load(['chantier', 'attachments']);
        $company = CompanySetting::getSettings();

        $pdf = Pdf::loadView('pdf.charge', [
            'charge' => $charge,
            'company' => $company,
        ]);

        $pdf->getDomPDF()->set_option('isPhpEnabled', true);

        $fileRef = $charge->reference ?: (string) $charge->id;
        $fileName = 'Charge_' . $fileRef . '.pdf';

        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $fileName . '"');
    }
}
