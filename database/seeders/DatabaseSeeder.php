<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Créer les permissions
        $permissions = [
            // Utilisateurs
            'users.view', 'users.create', 'users.edit', 'users.delete',
            // Chantiers
            'chantiers.view', 'chantiers.create', 'chantiers.edit', 'chantiers.delete',
            // Services
            'services.view', 'services.create', 'services.edit', 'services.delete',
            // Produits
            'produits.view', 'produits.create', 'produits.edit', 'produits.delete',
            // Stock
            'stock.view', 'stock.create', 'stock.edit', 'stock.delete',
            // Techniciens
            'techniciens.view', 'techniciens.create', 'techniciens.edit', 'techniciens.delete',
            // Pointage
            'pointage.view', 'pointage.create', 'pointage.edit', 'pointage.delete',
            // Charges
            'charges.view', 'charges.create', 'charges.edit', 'charges.delete',
            // Paiements
            'paiements.view', 'paiements.create', 'paiements.edit', 'paiements.delete',
            // Devis
            'devis.view', 'devis.create', 'devis.edit', 'devis.delete',
            // Factures
            'factures.view', 'factures.create', 'factures.edit', 'factures.delete',
            // Statistiques
            'statistiques.view',
            // Paramètres
            'parametres.view', 'parametres.edit',
            // Photos & Notes
            'photos.view', 'photos.create', 'photos.edit', 'photos.delete',
            // Rapports
            'rapports.view', 'rapports.create',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Créer les rôles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $chefChantierRole = Role::firstOrCreate(['name' => 'chef_chantier']);
        $technicienRole = Role::firstOrCreate(['name' => 'technicien']);

        // Assigner toutes les permissions à l'admin
        $adminRole->syncPermissions(Permission::all());

        // Permissions pour Chef de Chantier
        $chefChantierRole->syncPermissions([
            'chantiers.view',
            'services.view',
            'techniciens.view', 'techniciens.create', 'techniciens.edit',
            'pointage.view', 'pointage.create', 'pointage.edit',
            'photos.view', 'photos.create', 'photos.edit', 'photos.delete',
            'rapports.view', 'rapports.create',
        ]);

        // Permissions pour Technicien
        $technicienRole->syncPermissions([
            'pointage.view', 'pointage.create',
            'photos.view', 'photos.create',
        ]);

        // Créer l'utilisateur Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('12345678'),
                'phone' => '0600000000',
                'status' => 'active',
            ]
        );
        $admin->assignRole($adminRole);

        // Créer l'utilisateur Chef de Chantier
        $chef = User::firstOrCreate(
            ['email' => 'chef@chef.com'],
            [
                'name' => 'Chef de Chantier',
                'password' => bcrypt('12345678'),
                'phone' => '0611111111',
                'status' => 'active',
            ]
        );
        $chef->assignRole($chefChantierRole);

        // Créer un utilisateur Technicien
        $technicien = User::firstOrCreate(
            ['email' => 'tech@tech.com'],
            [
                'name' => 'Technicien Test',
                'password' => bcrypt('12345678'),
                'phone' => '0622222222',
                'status' => 'active',
            ]
        );
        $technicien->assignRole($technicienRole);
    }
}
