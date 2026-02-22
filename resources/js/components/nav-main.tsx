import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
        return items.reduce<Record<string, boolean>>((acc, item) => {
            if (item.children?.some((child) => isCurrentUrl(child.href))) {
                acc[item.title] = true;
            }
            return acc;
        }, {});
    });

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.children && item.children.length > 0 ? (
                            <SidebarMenuButton
                                onClick={() =>
                                    setExpanded((prev) => ({
                                        ...prev,
                                        [item.title]: !prev[item.title],
                                    }))
                                }
                                isActive={isCurrentUrl(item.href) || item.children.some((child) => isCurrentUrl(child.href))}
                                tooltip={{ children: item.title }}
                            >
                                {item.icon && (
                                    <span className="relative">
                                        <item.icon />
                                        {item.badge && item.badge > 0 && (
                                            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive" />
                                        )}
                                    </span>
                                )}
                                <span className="flex-1 text-left">{item.title}</span>
                                {item.badge && item.badge > 0 && (
                                    <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground">
                                        {item.badge}
                                    </span>
                                )}
                                <ChevronDown
                                    className={
                                        expanded[item.title]
                                            ? 'h-4 w-4 transition-transform duration-200 rotate-180'
                                            : 'h-4 w-4 transition-transform duration-200'
                                    }
                                />
                            </SidebarMenuButton>
                        ) : (
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && (
                                        <span className="relative">
                                            <item.icon />
                                            {item.badge && item.badge > 0 && (
                                                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive" />
                                            )}
                                        </span>
                                    )}
                                    <span>{item.title}</span>
                                    {item.badge && item.badge > 0 && (
                                        <span className="ml-auto rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        )}
                        {item.children && item.children.length > 0 && expanded[item.title] && (
                            <SidebarMenuSub className="animate-in slide-in-from-top-1 duration-200">
                                {item.children.map((child) => (
                                    <SidebarMenuSubItem key={child.title}>
                                        <SidebarMenuSubButton asChild isActive={isCurrentUrl(child.href)}>
                                            <Link href={child.href} prefetch>
                                                <span>{child.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
