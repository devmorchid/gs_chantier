<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Pointages - {{ $technicien->prenom }} {{ $technicien->nom }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #333;
            padding: 20px;
        }

        /* ========== HEADER ========== */
        .header {
            display: table;
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
        }

        .header-left {
            display: table-cell;
            width: 55%;
            vertical-align: top;
        }

        .header-right {
            display: table-cell;
            width: 45%;
            vertical-align: top;
            text-align: right;
        }

        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 4px;
        }

        .company-info {
            font-size: 9px;
            color: #555;
            line-height: 1.6;
        }

        .document-title {
            font-size: 22px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 6px;
        }

        .document-subtitle {
            font-size: 11px;
            color: #666;
        }

        /* ========== TECHNICIEN INFO ========== */
        .tech-section {
            display: table;
            width: 100%;
            margin-bottom: 18px;
            background: #f0f4ff;
            border: 1px solid #c7d7f9;
            border-radius: 4px;
            padding: 12px;
        }

        .tech-section-left {
            display: table-cell;
            width: 60%;
            vertical-align: middle;
        }

        .tech-section-right {
            display: table-cell;
            width: 40%;
            vertical-align: middle;
            text-align: right;
        }

        .tech-name {
            font-size: 16px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 3px;
        }

        .tech-specialite {
            font-size: 11px;
            color: #2563eb;
            text-transform: capitalize;
        }

        .periode-label {
            font-size: 10px;
            color: #555;
        }

        .periode-value {
            font-size: 13px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: capitalize;
        }

        /* ========== STATS ========== */
        .stats-row {
            display: table;
            width: 100%;
            margin-bottom: 18px;
            border-collapse: separate;
            border-spacing: 8px 0;
        }

        .stat-box {
            display: table-cell;
            width: 33%;
            padding: 12px;
            text-align: center;
            border-radius: 4px;
            vertical-align: middle;
        }

        .stat-box-blue   { background: #1d4ed8; color: white; }
        .stat-box-green  { background: #16a34a; color: white; }
        .stat-box-orange { background: #d97706; color: white; }

        .stat-label {
            font-size: 9px;
            margin-bottom: 4px;
            opacity: 0.9;
        }

        .stat-value {
            font-size: 22px;
            font-weight: bold;
        }

        /* ========== TABLE ========== */
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #2563eb;
            margin: 0 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #2563eb;
        }

        .pointage-table {
            width: 100%;
            border-collapse: collapse;
        }

        .pointage-table thead th {
            background: #2563eb;
            color: white;
            padding: 8px 10px;
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .pointage-table thead th.center { text-align: center; }

        .pointage-table tbody td {
            padding: 7px 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
            vertical-align: middle;
        }

        .pointage-table tbody tr:nth-child(even) {
            background: #f8faff;
        }

        .pointage-table tbody td.center { text-align: center; }

        /* ========== STATUS BADGES ========== */
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .badge-present  { background: #dcfce7; color: #166534; }
        .badge-en_cours { background: #fef3c7; color: #92400e; }
        .badge-absent   { background: #fee2e2; color: #991b1b; }

        /* ========== FOOTER ========== */
        .footer {
            margin-top: 25px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            font-size: 8px;
            color: #999;
            text-align: center;
        }

        .empty-msg {
            text-align: center;
            padding: 20px;
            color: #888;
            font-style: italic;
        }
    </style>
</head>
<body>

    {{-- ======== HEADER ======== --}}
    <div class="header">
        <div class="header-left">
            @if($company && $company->name)
                <div class="company-name">{{ $company->name }}</div>
                <div class="company-info">
                    @if($company->address) {{ $company->address }}@if($company->city), {{ $company->city }}@endif<br>@endif
                    @if($company->phone) Tél : {{ $company->phone }}<br>@endif
                    @if($company->email) Email : {{ $company->email }}<br>@endif
                    @if($company->ice) ICE : {{ $company->ice }}@endif
                </div>
            @else
                <div class="company-name">Gestion Chantier</div>
            @endif
        </div>
        <div class="header-right">
            <div class="document-title">Rapport de Pointage</div>
            <div class="document-subtitle">Généré le {{ now()->format('d/m/Y à H:i') }}</div>
        </div>
    </div>

    {{-- ======== TECHNICIEN INFO ======== --}}
    <div class="tech-section">
        <div class="tech-section-left">
            <div class="tech-name">{{ strtoupper($technicien->nom) }} {{ $technicien->prenom }}</div>
            <div class="tech-specialite">{{ $technicien->specialite ?? 'Technicien' }}</div>
        </div>
        <div class="tech-section-right">
            <div class="periode-label">Période</div>
            <div class="periode-value">{{ $monthLabel }} {{ $year }}</div>
        </div>
    </div>

    {{-- ======== STATS ======== --}}
    <div class="stats-row">
        <div class="stat-box stat-box-blue">
            <div class="stat-label">Jours Travaillés</div>
            <div class="stat-value">{{ $stats['total_days'] }}</div>
        </div>
        <div class="stat-box stat-box-green">
            <div class="stat-label">Total Heures</div>
            <div class="stat-value">{{ number_format($stats['total_hours'], 1) }}h</div>
        </div>
        <div class="stat-box stat-box-orange">
            <div class="stat-label">Moy. / Jour</div>
            <div class="stat-value">
                {{ $stats['total_days'] > 0 ? number_format($stats['total_hours'] / $stats['total_days'], 1) : '0.0' }}h
            </div>
        </div>
    </div>

    {{-- ======== TABLE DES POINTAGES ======== --}}
    <div class="section-title">Détail des Pointages</div>

    @if(count($pointages) > 0)
        <table class="pointage-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Jour</th>
                    <th class="center">Check-in</th>
                    <th class="center">Check-out</th>
                    <th class="center">Durée (h)</th>
                    <th class="center">Statut</th>
                </tr>
            </thead>
            <tbody>
                @foreach($pointages as $p)
                <tr>
                    <td>{{ $p['date'] }}</td>
                    <td>{{ $p['day_name'] }}</td>
                    <td class="center">{{ $p['check_in'] ?? '-' }}</td>
                    <td class="center">{{ $p['check_out'] ?? '-' }}</td>
                    <td class="center">
                        {{ isset($p['duration']) && $p['duration'] !== null ? number_format($p['duration'], 1) : '-' }}
                    </td>
                    <td class="center">
                        @if($p['status'] === 'present')
                            <span class="badge badge-present">Présent</span>
                        @elseif($p['status'] === 'en_cours')
                            <span class="badge badge-en_cours">En cours</span>
                        @else
                            <span class="badge badge-absent">Absent</span>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty-msg">Aucun pointage enregistré pour cette période.</div>
    @endif

    {{-- ======== FOOTER ======== --}}
    <div class="footer">
        {{ $company->name ?? 'Gestion Chantier' }} &mdash; Rapport de pointage de {{ $technicien->prenom }} {{ $technicien->nom }} &mdash; {{ $monthLabel }} {{ $year }}
    </div>

</body>
</html>
