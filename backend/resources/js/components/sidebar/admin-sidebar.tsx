import {
    ChevronsUpDown,
    GalleryVerticalEnd,
    Inbox,
    LayoutDashboard,
    LogOut,
    MessageCircle,
    Package,
    Settings,
    Truck,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useMessages } from '@/contexts/messages-context';
import { Link, usePage } from '@inertiajs/react';

// Type for breadcrumb item
export interface BreadcrumbItemType {
    label: string;
    url: string;
}

// Menu items.
const items = [
    {
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        url: '/admin/users',
        icon: Inbox,
    },
    {
        title: 'Orders',
        url: '/admin/orders',
        icon: Truck,
    },
    {
        title: 'Products',
        url: '/admin/products',
        icon: Package,
    },
    {
        title: 'Messages',
        url: '/admin/messages',
        icon: MessageCircle,
    },
    {
        title: 'Settings',
        url: '#',
        icon: Settings,
    },
];

export function AdminSidebar() {
    const { url, props } = usePage<any>();
    const user = props.auth?.user;
    const [activeLink, setActiveLink] = useState<string>('');
    const { state } = useSidebar();
    // Get messages count from context
    const { messages } = useMessages();
    const messagesCount = messages.length;

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
                            <h2 className="text-sm font-medium">Admin Panel</h2>
                            <p className="text-xs text-muted-foreground">
                                Manage your app
                            </p>
                        </div>
                    </div>
                )}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
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
                                            {item.title === 'Messages' &&
                                                messagesCount > 0 && (
                                                    <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                                                        {messagesCount}
                                                    </span>
                                                )}
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
                                            src={
                                                user?.avatar ||
                                                'https://github.com/shadcn.png'
                                            }
                                            alt={user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg">
                                            {user?.name
                                                ?.split(' ')
                                                .map((n: string) => n[0])
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
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full cursor-pointer"
                                    >
                                        <LogOut className="mr-2 size-4" />
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
