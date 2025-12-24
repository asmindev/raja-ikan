import { ModeToggle } from '@/components/mode-toggle';
import { CustomerSidebar } from '@/components/sidebar/customer-sidebar';
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
import { Fragment } from 'react/jsx-runtime';
import { toast } from 'sonner';

export interface BreadcrumbItemType {
    label: string;
    url: string;
}

export default function CustomerLayout({
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
    if (flash?.content) {
        toast[flash.type ?? 'message'](flash.content);
    }

    const sidebarState = (props.sidebarOpen as boolean | undefined) ?? true;

    return (
        <SidebarProvider defaultOpen={sidebarState}>
            <CustomerSidebar />
            <main className="min-w-0 flex-1">
                <header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-4">
                    <div className="flex flex-1 items-center justify-between">
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
                                                            <Link
                                                                href={crumb.url}
                                                            >
                                                                {crumb.label}
                                                            </Link>
                                                        </BreadcrumbLink>
                                                    )}
                                                </BreadcrumbItem>
                                                {index <
                                                    breadcrumbs.length - 1 && (
                                                    <BreadcrumbSeparator />
                                                )}
                                            </Fragment>
                                        ))}
                                    </BreadcrumbList>
                                </Breadcrumb>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <ModeToggle />
                        </div>
                    </div>
                </header>
                {children}
            </main>
        </SidebarProvider>
    );
}
