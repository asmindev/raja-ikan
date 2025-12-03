import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Package,
    Plus,
    Search,
    Truck,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Orders', url: '/admin/orders' },
];

interface Order {
    id: number;
    status: string;
    total: number;
    customer_id: number;
    driver_id: number | null;
    created_at: string;
    customer: {
        id: number;
        name: string;
        email: string;
    };
    driver: {
        id: number;
        name: string;
    } | null;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PagePropsWithOrders {
    orders: PaginatedOrders;
    filters: {
        search: string;
        status: string;
        per_page: number;
    };
    stats: {
        total_orders: number;
        pending_orders: number;
        delivering_orders: number;
        completed_orders: number;
        cancelled_orders: number;
    };
}

type BadgeVariant = 'secondary' | 'default' | 'destructive';

const getStatusBadge = (status: string) => {
    const statusMap: Record<
        string,
        { label: string; variant: BadgeVariant; icon: React.ReactNode }
    > = {
        pending: {
            label: 'Pending',
            variant: 'secondary',
            icon: <Clock className="h-3 w-3" />,
        },
        delivering: {
            label: 'Delivering',
            variant: 'secondary',
            icon: <Truck className="h-3 w-3" />,
        },
        completed: {
            label: 'Completed',
            variant: 'default',
            icon: <CheckCircle className="h-3 w-3" />,
        },
        cancelled: {
            label: 'Cancelled',
            variant: 'destructive',
            icon: <XCircle className="h-3 w-3" />,
        },
    };

    const config = statusMap[status] || statusMap['pending'];
    return (
        <Badge variant={config.variant} className="gap-1">
            {config.icon}
            {config.label}
        </Badge>
    );
};

export default function AdminOrdersIndex() {
    const { orders, filters, stats } = usePage()
        .props as unknown as PagePropsWithOrders;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || 10);

    const debouncedSearch = useDebounce(search, 500);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            '/admin/orders',
            {
                search: debouncedSearch,
                status: status,
                per_page: perPage,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    }, [debouncedSearch, status, perPage]);

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(parseInt(value));
    };

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                {/* Header with Create Button */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Orders Management</h1>
                    <Button
                        onClick={() => router.visit('/admin/orders/create')}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Create Order
                    </Button>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4" />
                                Total Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {stats.total_orders}
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

                {/* Orders Table with Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="mb-6 flex flex-col gap-4 md:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search order ID or customer name..."
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="h-10 pl-10"
                                />
                            </div>
                            <Select
                                value={status}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="h-10 w-32">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="delivering">
                                        Delivering
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={perPage.toString()}
                                onValueChange={handlePerPageChange}
                            >
                                <SelectTrigger className="h-10 w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.data.length > 0 ? (
                                        orders.data.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono">
                                                    #{order.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="font-medium">
                                                            {
                                                                order.customer
                                                                    .name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {
                                                                order.customer
                                                                    .email
                                                            }
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    Rp{' '}
                                                    {new Intl.NumberFormat(
                                                        'id-ID',
                                                    ).format(
                                                        Number(order.total),
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(
                                                        order.status,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {new Date(
                                                        order.created_at,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                router.visit(
                                                                    `/admin/orders/${order.id}`,
                                                                )
                                                            }
                                                            className="gap-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                router.visit(
                                                                    `/admin/orders/${order.id}/edit`,
                                                                )
                                                            }
                                                            className="gap-2"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center"
                                            >
                                                No orders found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between border-t pt-4">
                                <p className="text-sm text-gray-600">
                                    Showing {orders.data.length} of{' '}
                                    {orders.total} orders
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            router.get('/admin/orders', {
                                                page: orders.current_page - 1,
                                                search,
                                                status,
                                                per_page: perPage,
                                            })
                                        }
                                        disabled={orders.current_page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            router.get('/admin/orders', {
                                                page: orders.current_page + 1,
                                                search,
                                                status,
                                                per_page: perPage,
                                            })
                                        }
                                        disabled={
                                            orders.current_page ===
                                            orders.last_page
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
