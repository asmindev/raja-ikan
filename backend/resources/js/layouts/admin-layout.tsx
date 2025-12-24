import { ModeToggle } from '@/components/mode-toggle';
import { AdminSidebar } from '@/components/sidebar/admin-sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { toast } from 'sonner';

// Type for breadcrumb item
export interface BreadcrumbItemType {
    label: string;
    url: string;
}

export default function Layout({
    children,
    breadcrumbs,
}: {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { props } = usePage();
    const flash = props.flash as {
        type: 'success' | 'error' | 'message' | null;
        content: string | null;
    };

    useEffect(() => {
        if (flash.content) {
            toast[flash.type ?? 'message'](flash.content);
        }
    }, [flash]);

    const sidebarState = props.sidebarOpen as boolean;
    return (
        <SidebarProvider defaultOpen={sidebarState}>
            <AdminSidebar />
            <main className="min-w-0 flex-1">
                <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-background p-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        {breadcrumbs && (
                            <Breadcrumb>
                                <BreadcrumbList
                                    aria-label="Breadcrumb"
                                    className="space-x-2"
                                >
                                    {breadcrumbs.map((crumb, index) => (
                                        <Fragment key={crumb.label}>
                                            <BreadcrumbItem>
                                                {index ===
                                                breadcrumbs.length - 1 ? (
                                                    <BreadcrumbPage>
                                                        {crumb.label}
                                                    </BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink asChild>
                                                        <Link href={crumb.url}>
                                                            {crumb.label}
                                                        </Link>
                                                    </BreadcrumbLink>
                                                )}
                                            </BreadcrumbItem>
                                            {index < breadcrumbs.length - 1 && (
                                                <BreadcrumbSeparator />
                                            )}
                                        </Fragment>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        )}
                    </div>
                    <ModeToggle />
                </header>
                {children}
            </main>
        </SidebarProvider>
    );
}
