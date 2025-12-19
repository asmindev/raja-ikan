import {
    GalleryVerticalEnd,
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    ChevronsUpDown,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, usePage } from '@inertiajs/react';

const items = [
    {
        title: 'Dashboard',
        url: '/customer/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Products',
        url: '/customer/products',
        icon: Package,
    },
    {
        title: 'Orders',
        url: '/customer/orders',
        icon: Truck,
    },
    {
        title: 'Cart',
        url: '/customer/cart',
        icon: ShoppingCart,
    },
];

export function CustomerSidebar() {
    const { url, props } = usePage();
    const [activeLink, setActiveLink] = useState<string>('');
    const { state } = useSidebar();

    const user = props.auth?.user;

    useEffect(() => {
        setActiveLink(url);
    }, [url]);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                {state === 'collapsed' ? (
                    <div className="rounded-md bg-primary p-2">
                        <GalleryVerticalEnd
                            strokeWidth={1.7}
                            className="size-4 text-primary-foreground"
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-2xl p-2 hover:bg-accent hover:text-accent-foreground">
                        <div className="rounded-md bg-primary p-2">
                            <GalleryVerticalEnd
                                strokeWidth={1.7}
                                className="size-4 text-primary-foreground"
                            />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium">
                                Customer Portal
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Browse & track orders
                            </p>
                        </div>
                    </div>
                )}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        asChild
                                        className={`${activeLink.startsWith(item.url) ? 'bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'} `}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage
                                            src={user?.avatar}
                                            alt={user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg">
                                            {user?.name
                                                ?.split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {user?.name}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side={state === 'collapsed' ? 'right' : 'bottom'}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem asChild>
                                    <Link href="/customer/dashboard">
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/customer/orders">
                                        My Orders
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full text-left"
                                    >
                                        Log out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
