# Copilot Instructions - Gestion Chantier

## Project Overview
Construction site ("chantier") management ERP. **French language UI** - all labels, messages, status values in French.
- **Stack**: Laravel 12 + Inertia.js v2 + React 19 + TypeScript + Tailwind v4 + shadcn/ui
- **Auth**: Fortify (2FA support) + Spatie Permission (3 roles)
- **Build**: `composer dev` runs Laravel server + Vite + Queue concurrently

## Domain Model - Chantier is Central
Everything links to `Chantier` (construction site) via `chantier_id`:
- **Client** → owns the chantier | **User** (chef_chantier) → manages it
- **Service** → work task assigned to **Equipe** (team of **Techniciens**)
- **Devis** → quote | **Facture** → invoice (can be created from accepted Devis)

Reference patterns: `CH-YYYY-####`, `DV-YYYY-####`, `FA-YYYY-####` (see `generateReference()` methods)

Status flows:
- Chantier: `en_attente` → `en_cours` → `termine` / `annule`
- Service: `draft` → `en_cours` → `termine`
- Devis: `brouillon` → `envoye` → `accepte` / `refuse` / `expire`

## Role-Based Access (Spatie Permission)
| Role | Scope | Middleware |
|------|-------|------------|
| `admin` | Full access to all resources | `role:admin` |
| `chef_chantier` | Only their own chantiers + related data | `role:admin\|chef_chantier` |
| `technicien` | View assigned services only | `role:admin\|chef_chantier\|technicien` |

**Critical**: Always scope queries for chef_chantier:
```php
if ($user->hasRole('chef_chantier')) {
    $query->where('user_id', $user->id);  // Direct ownership
    // OR via chantier relationship:
    $query->whereHas('chantier', fn($q) => $q->where('user_id', $user->id));
}
```

## Development Commands
```bash
composer dev              # Starts server, queue, vite (use this for dev)
php artisan migrate --seed # Seeds roles + 3 test users (admin@admin.com, chef@chef.com, tech@tech.com) - password: 12345678
composer test             # Pint + Pest tests
npm run types             # TypeScript check
```

## Controller → Inertia Pattern
Transform paginated data before rendering. Always pass `filters` to preserve search/filter state:
```php
$query = Model::with(['relationship']);
// Apply role scoping (see above)
// Apply search filters
$items = $query->paginate(10);
$items->getCollection()->transform(fn($item) => [
    'id' => $item->id,
    'status_label' => $item->status_label,  // Use accessor, not raw value
    'date' => $item->date->format('d/m/Y'), // French date format
]);
return Inertia::render('module/index', [
    'items' => $items,
    'statuts' => Model::STATUTS,  // Pass const for dropdowns
    'filters' => $request->only(['search', 'status']),
]);
```

## React Page Structure
```tsx
// resources/js/pages/{module}/index.tsx
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

interface Props {
    items: PaginatedItems;
    statuts: Record<string, string>;
    filters: { search?: string };
}
export default function Index({ items, statuts, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Module', href: '/module' },
    ];
    // Use router.get with preserveState for filters
    router.get('/module', { search }, { preserveState: true });
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Module" />
            {/* content */}
        </AppLayout>
    );
}
```

## Model Constants Pattern
Define status/type lookups as const arrays with French labels and accessors:
```php
public const STATUTS = [
    'draft' => 'Brouillon',
    'en_cours' => 'En cours',
    'termine' => 'Terminé',
];
public function getStatusLabelAttribute(): string {
    return self::STATUTS[$this->status] ?? $this->status;
}
```

## Key Directories
```
app/Http/Controllers/        # Inertia controllers (transform data, scope by role)
app/Models/                  # Eloquent: Chantier, Service, Equipe, Technicien, Devis, Facture...
resources/js/pages/          # React pages (lowercase: chantiers/index.tsx, devis/show.tsx)
resources/js/components/ui/  # shadcn/ui (new-york style)
resources/js/types/          # SharedData, Auth, BreadcrumbItem, AppLayoutProps
resources/js/routes/         # Wayfinder-generated type-safe routes (import { logout } from '@/routes')
```

## UI Conventions
- Import components: `@/components/ui/*` (shadcn/ui)
- Conditional classes: `cn()` from `@/lib/utils`
- Wrap pages in `<AppLayout breadcrumbs={[...]}>`
- Icons: `lucide-react`

## Adding New Chantier-Related Module
1. **Migration**: `chantier_id` FK with `cascadeOnDelete()`
2. **Model**: `belongsTo(Chantier::class)`, const STATUTS with French labels, label accessor
3. **Controller**: Scope by role, transform dates to `d/m/Y`, pass `filters`
4. **Route**: Add to `routes/web.php` with role middleware
5. **Page**: Create `resources/js/pages/{module}/index.tsx` with typed Props

## Service Types (work categories)
`electricien`, `plombier`, `macon`, `peintre`, `menuisier`, `carreleur`, `climatisation`, `soudeur`, `manoeuvre`, `autre`
