import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import CustomerLayout, { BreadcrumbItemType } from '@/layouts/customer-layout';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle,
    Clock,
    Eye,
    Package,
    ShoppingBag,
    Wallet,
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
    { label: 'Customer', url: '/customer/dashboard' },
    { label: 'Dashboard', url: '/customer/dashboard' },
];

export default function CustomerDashboard({ stats, recentOrders }: Props) {
    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="container mx-auto space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back!</h1>
                    <p className="text-muted-foreground">
                        Here's what's happening with your orders
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Orders
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.active_orders}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently being processed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.pending_orders}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Waiting for confirmation
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Completed
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.completed_orders}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Successfully delivered
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Spent
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Rp {stats.total_spent.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All time spending
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Orders</CardTitle>
                            <Link href="/customer/orders">
                                <Button variant="outline" size="sm">
                                    View All
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <div className="py-12 text-center">
                                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">
                                    No orders yet
                                </p>
                                <Link href="/customer/products">
                                    <Button className="mt-4">
                                        Browse Products
                                    </Button>
                                </Link>
                            </div>
                        ) : (
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
                                                    status={order.status}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {order.items_count} items
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
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Link href="/customer/products">
                        <Card className="cursor-pointer transition-shadow hover:shadow-md">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <ShoppingBag className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Browse Products
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Discover our products
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/customer/orders">
                        <Card className="cursor-pointer transition-shadow hover:shadow-md">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <Package className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            My Orders
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Track your deliveries
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </CustomerLayout>
    );
}
