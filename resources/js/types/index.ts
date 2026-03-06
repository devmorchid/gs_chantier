
export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './stock_mouvement';
export type * from './produit';
export type * from './achat';
export type * from './charge';
export type * from './vente';

import type { Auth } from './auth';

export type Chantier = {
    id: number;
    nom: string;
};

export type Technicien = {
    id: number;
    nom: string;
    prenom: string;
};

export type SharedData = {
    name: string;
    auth: Auth;
    notificationCount?: number;
    sidebarOpen: boolean;
    chantiers?: Chantier[];
    techniciens?: Technicien[];
    [key: string]: unknown;
};
