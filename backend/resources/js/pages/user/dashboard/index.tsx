import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import CustomerLayout, { BreadcrumbItemType } from '@/layouts/customer-layout';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle,
    Clock,
    CreditCard,
    Package,
    Plus,
    ShoppingBag,
    Truck,
} from 'lucide-react';

interface Stats {
    active_orders: number;
    pending_orders: number;
    completed_orders: number;
    total_spent: number;
}

interface RecentOrder {
    id: number;
    status: string;
    total: number;
    created_at: string;
    items_count: number;
}

interface Props {
    stats: Stats;
    recentOrders: RecentOrder[];
}

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Dashboard', url: '/customer/dashboard' },
];

export default function CustomerDashboard({ stats, recentOrders }: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="container mx-auto max-w-5xl space-y-6 p-4 pb-20 md:p-6">
                {/* Welcome Section */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            Hi, {auth.user.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-muted-foreground">
                            Ready to order something delicious today?
                        </p>
                    </div>
                    <Link href="/customer/products" className="hidden md:block">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> New Order
                        </Button>
                    </Link>
                </div>

                {/* Mobile Primary Action */}
                <div className="md:hidden">
                    <Link href="/customer/products">
                        <Card className="bg-primary text-primary-foreground shadow-lg">
                            <CardContent className="flex items-center justify-between p-6">
                                <div>
                                    <h3 className="text-lg font-bold">
                                        Order Now
                                    </h3>
                                    <p className="text-sm opacity-90">
                                        Browse our fresh products
                                    </p>
                                </div>
                                <div className="rounded-full bg-white/20 p-3">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Stats Grid - Mobile Friendly (2x2 on mobile, 4x1 on desktop) */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Truck className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase md:text-sm">
                                    Active
                                </span>
                            </div>
                            <div className="mt-2 text-2xl font-bold">
                                {stats.active_orders}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase md:text-sm">
                                    Pending
                                </span>
                            </div>
                            <div className="mt-2 text-2xl font-bold">
                                {stats.pending_orders}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase md:text-sm">
                                    Done
                                </span>
                            </div>
                            <div className="mt-2 text-2xl font-bold">
                                {stats.completed_orders}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500 shadow-sm">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CreditCard className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase md:text-sm">
                                    Spent
                                </span>
                            </div>
                            <div className="mt-2 text-lg font-bold md:text-2xl">
                                <span className="text-xs text-muted-foreground md:hidden">
                                    Rp{' '}
                                </span>
                                {stats.total_spent.toLocaleString('id-ID', {
                                    notation: 'compact',
                                    maximumFractionDigits: 1,
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent Orders</h2>
                        <Link
                            href="/customer/orders"
                            className="flex items-center text-sm text-primary hover:underline"
                        >
                            View All <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="rounded-full bg-muted p-3">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 font-semibold">
                                    No orders yet
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Your order history will appear here
                                </p>
                                <Link href="/customer/products">
                                    <Button variant="outline">
                                        Start Shopping
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Mobile View: Stacked Cards */}
                            <div className="space-y-3 md:hidden">
                                {recentOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/customer/orders/${order.id}`}
                                        className="block"
                                    >
                                        <Card className="transition-colors active:bg-muted/50">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">
                                                                #{order.id}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                •{' '}
                                                                {
                                                                    order.created_at
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {order.items_count}{' '}
                                                            items
                                                        </div>
                                                    </div>
                                                    <StatusBadge
                                                        status={order.status}
                                                    />
                                                </div>
                                                <div className="mt-4 flex items-center justify-between border-t pt-3">
                                                    <span className="font-bold text-primary">
                                                        Rp{' '}
                                                        {order.total.toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 px-2 text-xs"
                                                    >
                                                        Details
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {/* Desktop View: Table */}
                            <Card className="hidden md:block">
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order ID</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead className="text-right">
                                                    Total
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Action
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentOrders.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-medium">
                                                        #{order.id}
                                                    </TableCell>
                                                    <TableCell>
                                                        {order.created_at}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            status={
                                                                order.status
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {order.items_count}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        Rp{' '}
                                                        {order.total.toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            href={`/customer/orders/${order.id}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                View
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
