import { Badge } from '@/components/ui/badge';
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
import { router } from '@inertiajs/react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { CheckCircle, Clock, Eye, Truck, XCircle } from 'lucide-react';

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

const columns: ColumnDef<Order>[] = [
    {
        accessorKey: 'id',
        header: 'Order ID',
        cell: ({ row }) => (
            <span className="font-mono text-sm">#{row.getValue('id')}</span>
        ),
    },
    {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) => {
            const customer = row.getValue('customer') as Order['customer'];
            return (
                <div className="text-sm">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                </div>
            );
        },
    },
    {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => {
            const total = row.getValue('total') as number;
            return (
                <span className="text-sm font-medium">
                    Rp {new Intl.NumberFormat('id-ID').format(Number(total))}
                </span>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return getStatusBadge(status);
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Date',
        cell: ({ row }) => {
            const date = row.getValue('created_at') as string;
            return (
                <span className="text-sm text-gray-600">
                    {new Date(date).toLocaleDateString('id-ID')}
                </span>
            );
        },
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const order = row.original;
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.visit(`/admin/orders/${order.id}`)}
                    className="gap-2"
                >
                    <Eye className="h-4 w-4" />
                    View
                </Button>
            );
        },
    },
];

interface OrdersTableProps {
    orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
    const table = useReactTable({
        data: orders,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            row.getIsSelected() && 'selected'
                                        }
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-sm text-gray-500"
                                    >
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
