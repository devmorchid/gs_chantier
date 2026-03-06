import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    HardHat,
    Wrench,
    Package,
    Warehouse,
    UserCog,
    ClipboardCheck,
    Receipt,
    CreditCard,
    FileText,
    FileCheck,
    BarChart3,
    Settings,
    Camera,
    FileBarChart,
    Building2,
    Boxes,
    Bell,
    ShoppingCart,
    Wallet,
} from 'lucide-react';
import AppLogo from './app-logo';

// Navigation pour Admin
const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Pointage',
        icon: ClipboardCheck,
        children: [
            {
                title: 'Par Chantier',
                href: '/pointages',
            },
            {
                title: 'Dashboard Global',
                href: '/pointages/dashboard',
            },
            {
                title: 'Scanner QR',
                href: '/pointages/scanner',
            },
        ],
    },
    {
        title: 'Utilisateurs',
        href: '/utilisateurs',
        icon: Users,
    },
    {
        title: 'Clients',
        href: '/clients',
        icon: Building2,
    },
    {
        title: 'Chantiers',
        href: '/chantiers',
        icon: HardHat,
    },
    {
        title: 'Services',
        href: '/services',
        icon: Wrench,
    },
        {
            title: 'Catalogue des services',
            href: '/catalog-services',
            icon: ClipboardCheck,
        },
    {
        title: 'Équipes',
        href: '/equipes',
        icon: Boxes,
    },
    {
        title: 'Techniciens',
        href: '/techniciens',
        icon: UserCog,
    },
    {
        title: 'Produits',
        href: '/produits',
        icon: Package,
        children: [
            {
                title: 'Produits',
                href: '/produits',
            },
            {
                title: 'Catégories',
                href: '/product-categories',
            },
            {
                title: 'Fournisseurs',
                href: '/fournisseurs',
            },
        ],
    },
    {
        title: 'Achats & Ventes',
        href: '/achats',
        icon: ShoppingCart,
        children: [
            {
                title: 'Achats',
                href: '/achats',
            },
            {
                title: 'Ventes',
                href: '/ventes',
            },
        ],
    },
    {
        title: 'Mouvements de stock',
        href: '/stock-mouvements',
        icon: Warehouse,
    },
    {
        title: 'Charges',
        href: '/charges',
        icon: Receipt,
    },
    {
        title: 'Paie Techniciens',
        href: '/paiements',
        icon: Wallet,
    },
    {
        title: 'Devis',
        href: '/devis',
        icon: FileText,
    },
    {
        title: 'Factures',
        href: '/factures',
        icon: FileCheck,
    },
    {
        title: 'Statistiques',
        href: '/statistiques',
        icon: BarChart3,
    },
    {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
    },
    {
        title: 'Paramètres',
        href: '/parametres',
        icon: Settings,
    },
    {
        title: 'Chèques',
        href: '/cheques/dashboard',
        icon: CreditCard,
    },
];

// Navigation pour Chef de Chantier
const chefChantierNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Clients',
        href: '/clients',
        icon: Building2,
    },
    {
        title: 'Mes Chantiers',
        href: '/mes-chantiers',
        icon: HardHat,
    },
    {
        title: 'Services',
        href: '/services',
        icon: Wrench,
    },
    {
        title: 'Équipes',
        href: '/equipes',
        icon: Boxes,
    },
    {
        title: 'Techniciens',
        href: '/techniciens',
        icon: UserCog,
    },
    {
        title: 'Mouvements de stock',
        href: '/stock-mouvements',
        icon: Warehouse,
    },
    {
        title: 'Pointage',
        icon: ClipboardCheck,
        children: [
            {
                title: 'Mes Chantiers',
                href: '/pointages',
            },
            {
                title: 'Dashboard Global',
                href: '/pointages/dashboard',
            },
            {
                title: 'Statistiques',
                href: '/pointages/statistiques',
            },
            {
                title: 'Scanner QR',
                href: '/pointages/scanner',
            },
        ],
    },
    {
        title: 'Paie Techniciens',
        href: '/paiements',
        icon: Wallet,
    },
    {
        title: 'Charges',
        href: '/charges',
        icon: Receipt,
    },
    {
        title: 'Devis',
        href: '/devis',
        icon: FileText,
    },
    {
        title: 'Factures',
        href: '/factures',
        icon: FileCheck,
    },
    {
        title: 'Photos & Notes',
        href: '/photos-notes',
        icon: Camera,
    },
    {
        title: 'Rapports',
        href: '/rapports',
        icon: FileBarChart,
    },
    {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
    },
];

// Navigation pour Technicien (pointage uniquement)
const technicienNavItems: NavItem[] = [
    {
        title: 'Mon Pointage',
        href: '/mon-pointage',
        icon: ClipboardCheck,
    },
    {
        title: 'Scanner QR',
        href: '/pointages/scanner',
        icon: Camera,
    },
];

const footerNavItems: NavItem[] = [];

// Fonction pour obtenir les items de navigation selon le rôle
function getNavItemsByRole(roles: string[] = []): NavItem[] {
    if (roles.includes('admin')) {
        return adminNavItems;
    }
    if (roles.includes('chef_chantier')) {
        return chefChantierNavItems;
    }
    if (roles.includes('technicien')) {
        return technicienNavItems;
    }
    // Par défaut, retourner la navigation chef_chantier (moins de permissions)
    return chefChantierNavItems;
}

export function AppSidebar() {
    const { auth, notificationCount, chantiers = [], techniciens = [] } = usePage<SharedData>().props;
    const userRoles = auth.user?.roles || [];

    // Construire le menu Pointage dynamiquement
    const buildPointageMenu = (): NavItem => {
        const pointageMenuChildren: NavItem[] = [
            {
                title: 'Par Chantier',
                href: '/pointages',
            },
            {
                title: 'Par Technicien',
                href: '/pointages/techniciens',
            },
            {
                title: 'Dashboard Global',
                href: '/pointages/dashboard',
            },
            {
                title: 'Statistiques',
                href: '/pointages/statistiques',
            },
            {
                title: 'Scanner QR',
                href: '/pointages/scanner',
            },
        ];

        return {
            title: 'Pointage',
            icon: ClipboardCheck,
            children: pointageMenuChildren,
        };
    };

    // Mettre à jour adminNavItems avec le menu Pointage dynamique
    const adminNavItemsUpdated: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        buildPointageMenu(),
        {
            title: 'Utilisateurs',
            href: '/utilisateurs',
            icon: Users,
        },
        {
            title: 'Clients',
            href: '/clients',
            icon: Building2,
        },
        {
            title: 'Chantiers',
            href: '/chantiers',
            icon: HardHat,
        },
        {
            title: 'Services',
            href: '/services',
            icon: Wrench,
        },
        {
            title: 'Catalogue des services',
            href: '/catalog-services',
            icon: ClipboardCheck,
        },
        {
            title: 'Équipes',
            href: '/equipes',
            icon: Boxes,
        },
        {
            title: 'Techniciens',
            href: '/techniciens',
            icon: UserCog,
        },
        {
            title: 'Produits',
            href: '/produits',
            icon: Package,
            children: [
                {
                    title: 'Produits',
                    href: '/produits',
                },
                {
                    title: 'Catégories',
                    href: '/product-categories',
                },
                {
                    title: 'Fournisseurs',
                    href: '/fournisseurs',
                },
            ],
        },
        {
            title: 'Achats',
            href: '/achats',
            icon: ShoppingCart,
        },
        {
            title: 'Mouvements de stock',
            href: '/stock-mouvements',
            icon: Warehouse,
        },
        {
            title: 'Charges',
            href: '/charges',
            icon: Receipt,
        },
        {
            title: 'Paie Techniciens',
            href: '/paiements',
            icon: Wallet,
        },
        {
            title: 'Devis',
            href: '/devis',
            icon: FileText,
        },
        {
            title: 'Factures',
            href: '/factures',
            icon: FileCheck,
        },
        {
            title: 'Statistiques',
            href: '/statistiques',
            icon: BarChart3,
        },
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
        },
        {
            title: 'Paramètres',
            href: '/parametres',
            icon: Settings,
        },
        {
            title: 'Chèques',
            href: '/cheques/dashboard',
            icon: CreditCard,
        },
    ];

    // Même chose pour chefChantierNavItems
    const chefChantierNavItemsUpdated: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        buildPointageMenu(),
        {
            title: 'Clients',
            href: '/clients',
            icon: Building2,
        },
        {
            title: 'Mes Chantiers',
            href: '/mes-chantiers',
            icon: HardHat,
        },
        {
            title: 'Services',
            href: '/services',
            icon: Wrench,
        },
        {
            title: 'Équipes',
            href: '/equipes',
            icon: Boxes,
        },
        {
            title: 'Techniciens',
            href: '/techniciens',
            icon: UserCog,
        },
        {
            title: 'Mouvements de stock',
            href: '/stock-mouvements',
            icon: Warehouse,
        },
        {
            title: 'Devis',
            href: '/devis',
            icon: FileText,
        },
        {
            title: 'Factures',
            href: '/factures',
            icon: FileCheck,
        },
        {
            title: 'Photos & Notes',
            href: '/photos-notes',
            icon: Camera,
        },
        {
            title: 'Rapports',
            href: '/rapports',
            icon: FileBarChart,
        },
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
        },
    ];

    // Fonction pour obtenir les items selon le rôle
    const getNavItemsByRole = (): NavItem[] => {
        if (userRoles.includes('admin')) {
            return adminNavItemsUpdated;
        }
        if (userRoles.includes('chef_chantier')) {
            return chefChantierNavItemsUpdated;
        }
        if (userRoles.includes('technicien')) {
            return technicienNavItems;
        }
        return chefChantierNavItemsUpdated;
    };

    const mainNavItems = getNavItemsByRole().map((item) => {
        if (item.title !== 'Notifications') {
            return item;
        }

        const badge = notificationCount && notificationCount > 0 ? notificationCount : undefined;
        return { ...item, badge };
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
