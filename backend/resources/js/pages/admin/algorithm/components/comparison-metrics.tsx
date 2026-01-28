import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OSRMResponse, OptimizeResponse } from '@/types/optimization';
import { ArrowDown, ArrowUp, CheckCircle2, History } from 'lucide-react';

interface ComparisonMetricsProps {
    before: OSRMResponse;
    after: OptimizeResponse;
}

export default function ComparisonMetrics({
    before,
    after,
}: ComparisonMetricsProps) {
    const beforeDistance = before.routes[0].distance / 1000; // km
    const beforeDuration = before.routes[0].duration / 60; // minutes
    const afterDistance = after.total_distance / 1000; // km
    const afterDuration = after.total_duration / 60; // minutes

    const distanceImprovement =
        ((beforeDistance - afterDistance) / beforeDistance) * 100;
    const timeImprovement =
        ((beforeDuration - afterDuration) / beforeDuration) * 100;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Sebelum Optimasi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Total Jarak
                        </p>
                        <p className="text-3xl font-bold dark:text-gray-100">
                            {beforeDistance.toFixed(2)} km
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Estimasi Waktu
                        </p>
                        <p className="text-3xl font-bold dark:text-gray-100">
                            {Math.floor(beforeDuration)} menit
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Urutan Rute
                        </p>
                        <p className="font-mono text-sm">
                            Original (
                            {Array.from(
                                { length: after.waypoints.length },
                                (_, i) => i,
                            ).join(' → ')}{' '}
                            → 0)
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-green-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        Sesudah Optimasi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Total Jarak
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-green-600">
                                {afterDistance.toFixed(2)} km
                            </p>
                            {distanceImprovement > 0 && (
                                <span className="flex items-center text-sm font-medium text-green-600">
                                    <ArrowDown className="h-4 w-4" />
                                    {distanceImprovement.toFixed(1)}%
                                </span>
                            )}
                            {distanceImprovement < 0 && (
                                <span className="flex items-center text-sm font-medium text-red-600">
                                    <ArrowUp className="h-4 w-4" />
                                    {Math.abs(distanceImprovement).toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Estimasi Waktu
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-green-600">
                                {Math.floor(afterDuration)} menit
                            </p>
                            {timeImprovement > 0 && (
                                <span className="flex items-center text-sm font-medium text-green-600">
                                    <ArrowDown className="h-4 w-4" />
                                    {timeImprovement.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Urutan Rute Optimal
                        </p>
                        <p className="font-mono text-sm">
                            {after.optimized_order.join(' → ')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
