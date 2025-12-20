import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { Order } from './types';

interface OrdersTableProps {
    orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
    if (orders.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-muted-foreground">No orders found</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">
                                #{order.id}
                            </TableCell>
                            <TableCell>
                                {new Date(order.created_at).toLocaleDateString(
                                    'id-ID',
                                    {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    },
                                )}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={order.status as any} />
                            </TableCell>
                            <TableCell>
                                {order.items.length}{' '}
                                {order.items.length === 1 ? 'item' : 'items'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                Rp {order.total.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/customer/orders/${order.id}`}>
                                    <Button variant="ghost" size="sm">
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
    );
}
