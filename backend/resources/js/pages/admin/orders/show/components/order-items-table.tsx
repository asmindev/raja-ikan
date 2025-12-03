import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useMemo } from 'react';
import { Order } from '../types';

interface OrderItemsTableProps {
    order: Order;
}

export function OrderItemsTable({ order }: OrderItemsTableProps) {
    const orderTotal = useMemo(() => {
        return order.order_lines.reduce(
            (sum, line) => sum + line.price * line.quantity,
            0,
        );
    }, [order.order_lines]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-left">
                                    Product
                                </TableHead>
                                <TableHead className="text-right">
                                    Price
                                </TableHead>
                                <TableHead className="text-right">
                                    Quantity
                                </TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.order_lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>
                                        <div className="flex gap-3">
                                            <div>
                                                <p className="font-medium">
                                                    {line.product.name}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        Rp{' '}
                                        {new Intl.NumberFormat('id-ID').format(
                                            Number(line.price),
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {line.quantity}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        Rp{' '}
                                        {new Intl.NumberFormat('id-ID').format(
                                            Number(line.price) * line.quantity,
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Total */}
                <div className="mt-4 flex justify-end border-t pt-4">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>
                                Rp{' '}
                                {new Intl.NumberFormat('id-ID').format(
                                    Number(orderTotal),
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-green-600">
                                Rp{' '}
                                {new Intl.NumberFormat('id-ID').format(
                                    Number(order.total),
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
