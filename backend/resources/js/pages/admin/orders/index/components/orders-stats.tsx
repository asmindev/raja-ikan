import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Package,
    Truck,
    XCircle,
} from 'lucide-react';

interface Stats {
    total_orders: number;
    pending_orders: number;
    needs_confirmation: number;
    delivering_orders: number;
    completed_orders: number;
    cancelled_orders: number;
}

interface OrdersStatsProps {
    stats: Stats;
}

export function OrdersStats({ stats }: OrdersStatsProps) {
    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4" />
                        Total Orders
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{stats.total_orders}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        Need Confirm
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-orange-500">
                        {stats.needs_confirmation}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        Pending
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-yellow-500">
                        {stats.pending_orders}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-blue-500" />
                        Delivering
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-blue-500">
                        {stats.delivering_orders}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Completed
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-green-500">
                        {stats.completed_orders}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Cancelled
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-red-500">
                        {stats.cancelled_orders}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
