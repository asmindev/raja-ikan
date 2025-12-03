import { Monitor, Smartphone, Tablet, Users } from 'lucide-react';
import StatsCard from './StatsCard';

interface VisitorStatsGridProps {
    totalVisitorsToday: number;
    mobileVisitors: number;
    desktopVisitors: number;
    tabletVisitors: number;
}

export default function VisitorStatsGrid({
    totalVisitorsToday,
    mobileVisitors,
    desktopVisitors,
    tabletVisitors,
}: VisitorStatsGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
                title="Visitors Hari Ini"
                value={totalVisitorsToday}
                description="Total pengunjung hari ini"
                icon={Users}
            />
            <StatsCard
                title="Mobile Visitors"
                value={mobileVisitors}
                description="Pengunjung dari mobile"
                icon={Smartphone}
            />
            <StatsCard
                title="Desktop Visitors"
                value={desktopVisitors}
                description="Pengunjung dari desktop"
                icon={Monitor}
            />
            <StatsCard
                title="Tablet Visitors"
                value={tabletVisitors}
                description="Pengunjung dari tablet"
                icon={Tablet}
            />
        </div>
    );
}
