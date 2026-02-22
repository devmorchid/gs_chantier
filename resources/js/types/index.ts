
export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './stock_mouvement';
export type * from './produit';
export type * from './achat';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    notificationCount?: number;
    sidebarOpen: boolean;
    [key: string]: unknown;
};
