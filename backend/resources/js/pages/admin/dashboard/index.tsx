import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import DashboardHeader from './components/DashboardHeader';
import DeviceDistribution from './components/DeviceDistribution';
import ProductUserStats from './components/ProductUserStats';
import TrendTabs from './components/TrendTabs';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Dashboard', url: '/admin/dashboard' },
];

interface DashboardStats {
    totalVisitorsToday: number;
    mobileVisitors: number;
    desktopVisitors: number;
    tabletVisitors: number;
    totalProducts: number;
    totalUsers: number;
}

interface VisitorTrend {
    date: string;
    mobile: number;
    desktop: number;
}

interface OrderTrend {
    date: string;
    total: number;
    completed: number;
}

interface DashboardProps {
    stats: DashboardStats;
    visitorsTrend: VisitorTrend[];
    ordersTrend: OrderTrend[];
}

export default function AdminDashboardIndex({
    stats,
    visitorsTrend,
    ordersTrend,
}: DashboardProps) {
    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full space-y-6 p-6">
                <DashboardHeader />

                {/* <VisitorStatsGrid
                    totalVisitorsToday={stats.totalVisitorsToday}
                    mobileVisitors={stats.mobileVisitors}
                    desktopVisitors={stats.desktopVisitors}
                    tabletVisitors={stats.tabletVisitors}
                /> */}

                <ProductUserStats
                    totalProducts={stats.totalProducts}
                    totalUsers={stats.totalUsers}
                />

                <div className="flex flex-col gap-4 md:flex-row">
                    <TrendTabs
                        visitorsTrend={visitorsTrend}
                        ordersTrend={ordersTrend}
                    />
                    <DeviceDistribution
                        totalVisitors={stats.totalVisitorsToday}
                        mobileVisitors={stats.mobileVisitors}
                        desktopVisitors={stats.desktopVisitors}
                        tabletVisitors={stats.tabletVisitors}
                    />
                </div>
            </div>
        </Layout>
    );
}
