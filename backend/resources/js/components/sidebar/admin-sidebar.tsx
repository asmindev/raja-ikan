import {
    GalleryVerticalEnd,
    Inbox,
    LayoutDashboard,
    MessageCircle,
    Package,
    Settings,
    Truck,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
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
    const { url } = usePage();
    const [activeLink, setActiveLink] = useState<string>('');

    // Get messages count from context
    const { messages } = useMessages();
    const messagesCount = messages.length;

    useEffect(() => {
        setActiveLink(url);
    }, [url]);

    return (
        <Sidebar>
            <SidebarHeader>
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
        </Sidebar>
    );
}
