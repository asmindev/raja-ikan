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
import { Link } from '@inertiajs/react';
import { Fragment } from 'react/jsx-runtime';

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
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="min-w-0 flex-1 overflow-auto">
                <header className="flex items-center gap-2 p-4">
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
                </header>
                {children}
            </main>
        </SidebarProvider>
    );
}
