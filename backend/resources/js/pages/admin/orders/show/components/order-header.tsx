import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Order } from '../types';
import { getStatusConfig } from '../utils/status-utils';

interface OrderHeaderProps {
    order: Order;
}

export function OrderHeader({ order }: OrderHeaderProps) {
    const statusConfig = getStatusConfig(order.status);

    const handleDelete = () => {
        if (
            window.confirm(
                `Are you sure you want to delete Order #${order.id}? This action cannot be undone.`,
            )
        ) {
            router.delete(`/admin/orders/${order.id}`, {
                onSuccess: () => {
                    router.visit('/admin/orders');
                },
            });
        }
    };

    return (
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.visit('/admin/orders')}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                    <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString(
                            'id-ID',
                            {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            },
                        )}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Badge
                    variant={statusConfig.variant}
                    className="h-fit gap-2 px-3 py-1 text-base"
                >
                    <statusConfig.icon className="h-3 w-3" />
                    {statusConfig.label}
                </Badge>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        router.visit(`/admin/orders/${order.id}/edit`)
                    }
                    className="gap-2"
                >
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            </div>
        </div>
    );
}
