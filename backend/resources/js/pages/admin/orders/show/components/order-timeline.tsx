import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    Clock,
    MapPin,
    Package,
    Truck,
    User,
    XCircle,
} from 'lucide-react';
import { Order } from '../types';

interface OrderTimelineProps {
    order: Order;
}

interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    timestamp?: string | null;
    icon: React.ElementType;
    status: 'completed' | 'current' | 'pending' | 'cancelled';
}

export function OrderTimeline({ order }: OrderTimelineProps) {
    const isCancelled = !!order.cancelled_at;

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const time = date
            .toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            })
            .replace('.', ':');
        const day = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        return `${time}, ${day}`;
    };

    const events: TimelineEvent[] = [
        {
            id: 'created',
            title: 'Pesanan Dibuat',
            description: 'Pesanan telah diterima sistem',
            timestamp: order.created_at,
            icon: Package,
            status: 'completed',
        },
        {
            id: 'confirmed',
            title: 'Dikonfirmasi',
            description: 'Admin memverifikasi pesanan',
            timestamp: order.confirmed_at,
            icon: CheckCircle2,
            status: order.confirmed_at
                ? 'completed'
                : isCancelled
                  ? 'pending'
                  : 'current',
        },
        {
            id: 'accepted',
            title: 'Driver Ditugaskan',
            description: order.driver
                ? `Driver: ${order.driver.name}`
                : 'Mencari driver terdekat',
            timestamp: order.accepted_at,
            icon: User,
            status: order.accepted_at
                ? 'completed'
                : order.confirmed_at && !isCancelled
                  ? 'current'
                  : 'pending',
        },
        {
            id: 'pickup',
            title: 'Pengambilan',
            description: 'Driver menuju lokasi pengambilan',
            timestamp: order.pickup_at,
            icon: MapPin,
            status: order.pickup_at
                ? 'completed'
                : order.accepted_at && !isCancelled
                  ? 'current'
                  : 'pending',
        },
        {
            id: 'delivering',
            title: 'Pengantaran',
            description: 'Pesanan sedang diantar ke tujuan',
            timestamp: order.delivering_at,
            icon: Truck,
            status: order.delivering_at
                ? 'completed'
                : order.pickup_at && !isCancelled
                  ? 'current'
                  : 'pending',
        },
        {
            id: 'delivered',
            title: 'Selesai',
            description: 'Pesanan telah diterima pelanggan',
            timestamp: order.delivery_at,
            icon: CheckCircle2,
            status: order.delivery_at
                ? 'completed'
                : order.delivering_at && !isCancelled
                  ? 'current'
                  : 'pending',
        },
    ];

    if (isCancelled) {
        // Find the index where the cancellation happened (first non-completed step)
        const cancelIndex = events.findIndex((e) => e.status !== 'completed');
        if (cancelIndex !== -1) {
            // Replace the rest with a cancelled event
            events.splice(cancelIndex, events.length - cancelIndex, {
                id: 'cancelled',
                title: 'Dibatalkan',
                description: 'Pesanan dibatalkan',
                timestamp: order.cancelled_at,
                icon: XCircle,
                status: 'cancelled',
            });
        }
    }

    return (
        <Card className="h-full border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Status Pesanan
                </CardTitle>
            </CardHeader>
            <CardContent className="">
                <div className="relative space-y-0">
                    {events.map((event, index) => {
                        const isLast = index === events.length - 1;
                        const isCompleted = event.status === 'completed';
                        const isCurrent = event.status === 'current';
                        const isCancelled = event.status === 'cancelled';

                        return (
                            <div
                                key={event.id}
                                className="relative flex gap-6 pb-8 last:pb-0"
                            >
                                {/* Connecting Line */}
                                {!isLast && (
                                    <div
                                        className={cn(
                                            'absolute top-10 left-[19px] h-full w-[2px]',
                                            isCompleted
                                                ? 'bg-primary'
                                                : 'bg-border/50',
                                        )}
                                    />
                                )}

                                {/* Icon Bubble */}
                                <div className="relative z-10 flex flex-shrink-0 items-center justify-center">
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-all duration-300',
                                            isCompleted &&
                                                'border-primary bg-primary text-primary-foreground',
                                            isCurrent &&
                                                'border-primary ring-4 ring-primary/20',
                                            isCancelled &&
                                                'border-destructive bg-destructive text-destructive-foreground',
                                            event.status === 'pending' &&
                                                'border-muted-foreground/20 text-muted-foreground',
                                        )}
                                    >
                                        <event.icon className="h-5 w-5" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-1 flex-col pt-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4
                                            className={cn(
                                                'leading-none font-semibold tracking-tight',
                                                isCompleted && 'text-primary',
                                                isCurrent && 'text-foreground',
                                                isCancelled &&
                                                    'text-destructive',
                                                event.status === 'pending' &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            {event.title}
                                        </h4>
                                        {event.timestamp && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs font-normal text-muted-foreground"
                                            >
                                                {formatDate(event.timestamp)}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {event.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
