import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

const statusConfig = {
    pending: {
        label: 'Pending',
        icon: Clock,
        className: 'bg-yellow-500/10 text-yellow-600 border-yellow-600/20',
    },
    delivering: {
        label: 'Delivering',
        icon: Truck,
        className: 'bg-blue-500/10 text-blue-600 border-blue-600/20',
    },
    completed: {
        label: 'Completed',
        icon: CheckCircle,
        className: 'bg-green-500/10 text-green-600 border-green-600/20',
    },
    cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        className: 'bg-red-500/10 text-red-600 border-red-600/20',
    },
};

interface OrderStatusBadgeProps {
    status: keyof typeof statusConfig;
    className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn(config.className, className)}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
        </Badge>
    );
}
