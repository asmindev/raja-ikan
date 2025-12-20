import type { SVGProps } from 'react';

import {
    ChevronRight,
    GalleryVerticalEnd,
    LayoutDashboard,
    MessageCircle,
    Package,
    Settings,
    Truck,
    Users,
} from 'lucide-react';

import { NavUser } from '@/components/nav-user';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';

// Type for breadcrumb item
export interface BreadcrumbItemType {
    label: string;
    url: string;
}

type NavItem = {
    label: string;
    href?: string;
    icon?: React.FC<SVGProps<SVGSVGElement>>;
    children?: NavItem[];
    submenu?: NavItem[];
};

const navigation: NavItem[] = [
    {
        label: 'Main',
        children: [
            {
                label: 'Dashboard',
                href: '/admin/dashboard',
                icon: LayoutDashboard,
            },
            { label: 'Users', href: '/admin/users', icon: Users },
            {
                label: 'Orders',
                href: '#',
                icon: Truck,
                submenu: [
                    { label: 'All Orders', href: '/admin/orders' },
                    {
                        label: 'Need Confirmation',
                        href: '/admin/orders?needs_confirmation=1',
                    },
                    {
                        label: 'Pending Orders',
                        href: '/admin/orders?status=pending',
                    },
                    {
                        label: 'Delivering',
                        href: '/admin/orders?status=delivering',
                    },
                ],
            },
            { label: 'Products', href: '/admin/products', icon: Package },
            { label: 'Messages', href: '/admin/messages', icon: MessageCircle },
        ],
    },
    {
        label: 'System',
        children: [
            { label: 'Settings', href: '/admin/settings', icon: Settings },
        ],
    },
];

type AdminSidebarProps = {
    activePath?: string;
};

export function AdminSidebar({ activePath }: AdminSidebarProps) {
    const { url, props } = usePage<any>();
    const user = props.auth?.user;
    const { state } = useSidebar();
    // const { messages } = useMessages();
    // const messagesCount = messages.length;

    const currentPath = activePath || url;

    const isActive = (href: string) => {
        if (!currentPath) return false;
        if (currentPath === href) return true;

        // 1. Jika href punya query string, harus exact match (sudah dicover di atas)
        if (href.includes('?')) {
            return false;
        }

        // 2. Jika href base path (tanpa query)
        if (currentPath.startsWith(href)) {
            const rest = currentPath.slice(href.length);

            // Sub-route (misal /admin/orders/123)
            if (rest.startsWith('/')) return true;

            // Query params
            if (rest.startsWith('?')) {
                // Exclude known filter params yang punya menu item sendiri
                if (
                    rest.includes('needs_confirmation=') ||
                    rest.includes('status=')
                ) {
                    return false;
                }
                return true;
            }

            if (rest === '') return true;
        }

        return false;
    };
    const hasActiveChild = (item: NavItem): boolean => {
        const children = item.children ?? [];
        const submenu = item.submenu ?? [];
        const all = [...children, ...submenu];

        return all.some((c) => {
            if (!c.href) return false;

            // Untuk submenu dengan query string, cocokkan exact
            if (c.href.includes('?')) {
                return currentPath === c.href;
            }

            // Untuk path biasa, gunakan startsWith
            return currentPath.startsWith(c.href);
        });
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                {state === 'collapsed' ? (
                    <div className="flex justify-center rounded-md border bg-primary py-1">
                        <GalleryVerticalEnd
                            className="size-5 text-primary-foreground"
                            strokeWidth={1.5}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/50 bg-primary px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-3 text-primary-foreground">
                            <div className="flex size-10 items-center justify-center rounded-xl border border-background/20">
                                <GalleryVerticalEnd className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    Delivery App
                                </p>
                                <p className="text-xs">Admin Panel</p>
                            </div>
                        </div>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className="w-full">
                {navigation.map((section) => (
                    <SidebarGroup key={section.label}>
                        <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                        <SidebarMenu>
                            {section.children?.map((item) => {
                                const Icon = item.icon;

                                // CASE 1 — item punya submenu (Master Data)
                                if (item.submenu) {
                                    return (
                                        <Collapsible
                                            key={item.label}
                                            defaultOpen
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton
                                                        tooltip={item.label}
                                                        asChild
                                                        className={`${hasActiveChild(item) && state === 'collapsed' ? 'bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {Icon && (
                                                                <Icon className="size-4" />
                                                            )}
                                                            <span>
                                                                {item.label}
                                                            </span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </div>
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.submenu.map(
                                                            (sub) => (
                                                                <SidebarMenuSubItem
                                                                    key={
                                                                        sub.href
                                                                    }
                                                                >
                                                                    <SidebarMenuButton
                                                                        asChild
                                                                        tooltip={
                                                                            sub.label
                                                                        }
                                                                        className={`${isActive(sub.href!) ? 'bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                                                                    >
                                                                        <Link
                                                                            href={
                                                                                sub.href!
                                                                            }
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    sub.label
                                                                                }
                                                                            </span>
                                                                        </Link>
                                                                    </SidebarMenuButton>
                                                                </SidebarMenuSubItem>
                                                            ),
                                                        )}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    );
                                }

                                // CASE 2 — item biasa
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.label}
                                            className={`${isActive(item.href!) ? 'bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                                        >
                                            <Link href={item.href!}>
                                                {Icon && (
                                                    <Icon className="size-4" />
                                                )}
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser
                    user={{
                        name: user?.name || 'Admin',
                        email: user?.email || 'admin@delivery.app',
                        avatar: user?.avatar || '',
                    }}
                />
            </SidebarFooter>
        </Sidebar>
    );
}
