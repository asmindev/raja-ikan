import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerLayout, { BreadcrumbItemType } from '@/layouts/customer-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';

interface Order {
    id: number;
    status: string;
    total: number;
    created_at: string;
    items: Array<{
        id: number;
        product_name: string;
        quantity: number;
        price: number;
        subtotal: number;
    }>;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
}

interface Props {
    orders: PaginatedOrders;
    filters: {
        status?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Customer', url: '/customer/dashboard' },
    { label: 'Orders', url: '/customer/orders' },
];

export default function OrdersIndex({ orders, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.status || 'all');

    const handleSearch = () => {
        router.get('/customer/orders', {
            status: activeTab !== 'all' ? activeTab : undefined,
            search: searchTerm,
        });
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.get('/customer/orders', {
            status: value !== 'all' ? value : undefined,
            search: searchTerm,
        });
    };

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />

            <div className="container mx-auto space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">My Orders</h1>
                    <p className="text-muted-foreground">
                        Track and manage your orders
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 md:flex-row">
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="delivering">
                                Delivering
                            </TabsTrigger>
                            <TabsTrigger value="completed">
                                Completed
                            </TabsTrigger>
                            <TabsTrigger value="cancelled">
                                Cancelled
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex flex-1 gap-2 md:max-w-md">
                        <Input
                            placeholder="Search by order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSearch()
                            }
                        />
                        <Button onClick={handleSearch}>
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Orders Table */}
                {orders.data.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">No orders found</p>
                    </div>
                ) : (
                    <div className="rounded-lg border">
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
                                {orders.data.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            #{order.id}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                status={order.status as any}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {order.items.length}{' '}
                                            {order.items.length === 1
                                                ? 'item'
                                                : 'items'}
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
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
