import { CheckCircle, Clock, LucideIcon, Truck, XCircle } from 'lucide-react';

export type BadgeVariant = 'secondary' | 'default' | 'destructive';

export interface StatusConfig {
    label: string;
    variant: BadgeVariant;
    icon: LucideIcon;
}

export const getStatusConfig = (status: string): StatusConfig => {
    const statusMap: Record<string, StatusConfig> = {
        pending: {
            label: 'Pending',
            variant: 'secondary',
            icon: Clock,
        },
        delivering: {
            label: 'Delivering',
            variant: 'secondary',
            icon: Truck,
        },
        completed: {
            label: 'Completed',
            variant: 'default',
            icon: CheckCircle,
        },
        cancelled: {
            label: 'Cancelled',
            variant: 'destructive',
            icon: XCircle,
        },
    };

    return statusMap[status] || statusMap['pending'];
};
