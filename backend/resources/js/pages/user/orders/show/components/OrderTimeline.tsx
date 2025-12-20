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

interface OrderTimelineProps {
    timeline: {
        created: string;
        confirmed?: string | null;
        accepted: string | null;
        pickup: string | null;
        delivering: string | null;
        delivered: string | null;
        cancelled: string | null;
    };
    status: string;
}

interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    timestamp?: string | null;
    icon: React.ElementType;
    status: 'completed' | 'current' | 'pending' | 'cancelled';
}

export function OrderTimeline({ timeline, status }: OrderTimelineProps) {
    if (!timeline) return null;

    const isCancelled = status === 'cancelled' || !!timeline.cancelled;

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
            description: 'Pesanan Anda telah diterima sistem',
            timestamp: timeline.created,
            icon: Package,
            status: 'completed',
        },
        {
            id: 'confirmed',
            title: 'Dikonfirmasi',
            description: 'Admin sedang memverifikasi pesanan',
            timestamp: timeline.confirmed,
            icon: CheckCircle2,
            status: timeline.confirmed
                ? 'completed'
                : isCancelled
                  ? 'pending'
                  : 'current',
        },
        {
            id: 'accepted',
            title: 'Driver Ditugaskan',
            description: timeline.accepted
                ? 'Driver sedang menuju lokasi'
                : 'Mencari driver terdekat',
            timestamp: timeline.accepted,
            icon: User,
            status: timeline.accepted
                ? 'completed'
                : timeline.confirmed && !isCancelled
                  ? 'current'
                  : 'pending',
        },
        {
            id: 'pickup',
            title: 'Pengambilan',
            description: 'Driver mengambil pesanan Anda',
            timestamp: timeline.pickup,
            icon: MapPin,
            status: timeline.pickup
                ? 'completed'
                : timeline.accepted && !isCancelled
                  ? 'current'
                  : 'pending',
        },
        {
            id: 'delivering',
            title: 'Pengantaran',
            description: 'Pesanan sedang diantar ke lokasi Anda',
            timestamp: timeline.delivering,
            icon: Truck,
            status: timeline.delivering
                ? 'completed'
                : timeline.pickup && !isCancelled
                  ? 'current'
                  : 'pending',
        },
        {
            id: 'delivered',
            title: 'Selesai',
            description: 'Pesanan telah Anda terima',
            timestamp: timeline.delivered,
            icon: CheckCircle2,
            status: timeline.delivered
                ? 'completed'
                : timeline.delivering && !isCancelled
                  ? 'current'
                  : 'pending',
        },
    ];

    if (isCancelled) {
        const cancelIndex = events.findIndex((e) => e.status !== 'completed');
        if (cancelIndex !== -1) {
            events.splice(cancelIndex, events.length - cancelIndex, {
                id: 'cancelled',
                title: 'Dibatalkan',
                description: 'Pesanan telah dibatalkan',
                timestamp: timeline.cancelled,
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
            <CardContent className="px-0">
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
