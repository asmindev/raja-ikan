import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface DeviceDistributionProps {
    totalVisitors: number;
    mobileVisitors: number;
    desktopVisitors: number;
    tabletVisitors: number;
}

interface DeviceItemProps {
    icon: React.ReactNode;
    label: string;
    count: number;
    total: number;
    color: string;
}

function DeviceItem({ icon, label, count, total, color }: DeviceItemProps) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}/10`}
            >
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">
                        {percentage}%
                    </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                        className={`h-full ${color}`}
                        style={{
                            width: `${percentage}%`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function DeviceDistribution({
    totalVisitors,
    mobileVisitors,
    desktopVisitors,
    tabletVisitors,
}: DeviceDistributionProps) {
    return (
        <Card className="w-1/3">
            <CardHeader className="pb-4">
                <CardTitle className="text-base">
                    Distribusi Perangkat Hari Ini
                </CardTitle>
                <CardDescription className="text-sm">
                    Persentase pengunjung berdasarkan jenis perangkat
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="space-y-3">
                    <DeviceItem
                        icon={<Smartphone className="h-4 w-4 text-blue-500" />}
                        label="Mobile"
                        count={mobileVisitors}
                        total={totalVisitors}
                        color="bg-blue-500"
                    />
                    <DeviceItem
                        icon={<Monitor className="h-4 w-4 text-green-500" />}
                        label="Desktop"
                        count={desktopVisitors}
                        total={totalVisitors}
                        color="bg-green-500"
                    />
                    <DeviceItem
                        icon={<Tablet className="h-4 w-4 text-purple-500" />}
                        label="Tablet"
                        count={tabletVisitors}
                        total={totalVisitors}
                        color="bg-purple-500"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
