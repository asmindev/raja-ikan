import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle } from 'lucide-react';

interface TimelineItem {
    label: string;
    timestamp: string | null;
    isCompleted: boolean;
}

interface OrderTimelineProps {
    timeline: {
        created: string;
        confirmed: string | null;
        accepted: string | null;
        pickup: string | null;
        delivering: string | null;
        delivered: string | null;
        cancelled: string | null;
    };
    status: string;
}

export function OrderTimeline({ timeline, status }: OrderTimelineProps) {
    if (!timeline) {
        return (
            <div className="text-sm text-muted-foreground">
                Timeline not available
            </div>
        );
    }

    // Map status transitions based on actual order status
    const steps: TimelineItem[] = [
        {
            label: 'Pesanan Dibuat',
            timestamp: timeline.created,
            isCompleted: true,
        },
        {
            label: 'Dikonfirmasi Admin',
            timestamp: timeline.confirmed,
            isCompleted: !!timeline.confirmed,
        },
        {
            label: 'Diterima Driver',
            timestamp: timeline.accepted,
            isCompleted: !!timeline.accepted,
        },
        {
            label: 'Pickup Barang',
            timestamp: timeline.pickup,
            isCompleted: !!timeline.pickup,
        },
        {
            label: 'Dalam Pengiriman',
            timestamp: timeline.delivering,
            isCompleted: !!timeline.delivering && status !== 'cancelled',
        },
        {
            label:
                status === 'completed' ? 'Pesanan Selesai' : 'Menunggu Selesai',
            timestamp: timeline.delivered,
            isCompleted: status === 'completed' && !!timeline.delivered,
        },
    ];

    // Calculate progress percentage
    const completedSteps = steps.filter((s) => s.isCompleted).length;
    const progressPercentage = (completedSteps / steps.length) * 100;

    if (status === 'cancelled') {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-red-600">
                    <div className="rounded-full bg-red-500/10 p-2">
                        <Circle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium">Pesanan Dibatalkan</p>
                        <p className="text-sm text-muted-foreground">
                            {timeline.cancelled
                                ? new Date(timeline.cancelled).toLocaleString(
                                      'id-ID',
                                      {
                                          dateStyle: 'medium',
                                          timeStyle: 'short',
                                      },
                                  )
                                : '-'}
                        </p>
                    </div>
                </div>
                {/* Show what was completed before cancellation */}
                <div className="space-y-2 border-t pt-4">
                    <p className="text-sm font-medium text-muted-foreground">
                        Riwayat Sebelum Dibatalkan:
                    </p>
                    <div className="space-y-2 text-sm">
                        {timeline.created && (
                            <p>
                                ✓ Pesanan dibuat:{' '}
                                {new Date(timeline.created).toLocaleString(
                                    'id-ID',
                                    { timeStyle: 'short', dateStyle: 'short' },
                                )}
                            </p>
                        )}
                        {timeline.confirmed && (
                            <p>
                                ✓ Dikonfirmasi:{' '}
                                {new Date(timeline.confirmed).toLocaleString(
                                    'id-ID',
                                    { timeStyle: 'short', dateStyle: 'short' },
                                )}
                            </p>
                        )}
                        {timeline.accepted && (
                            <p>
                                ✓ Diterima driver:{' '}
                                {new Date(timeline.accepted).toLocaleString(
                                    'id-ID',
                                    { timeStyle: 'short', dateStyle: 'short' },
                                )}
                            </p>
                        )}
                        {timeline.pickup && (
                            <p>
                                ✓ Pickup:{' '}
                                {new Date(timeline.pickup).toLocaleString(
                                    'id-ID',
                                    { timeStyle: 'short', dateStyle: 'short' },
                                )}
                            </p>
                        )}
                        {timeline.delivering && (
                            <p>
                                ✓ Dalam pengiriman:{' '}
                                {new Date(timeline.delivering).toLocaleString(
                                    'id-ID',
                                    { timeStyle: 'short', dateStyle: 'short' },
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Progress value={progressPercentage} className="h-2" />

            <div className="space-y-4">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div
                            className={cn(
                                'rounded-full p-2',
                                step.isCompleted
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground',
                            )}
                        >
                            {step.isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                            ) : (
                                <Circle className="h-5 w-5" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p
                                className={cn(
                                    'font-medium',
                                    step.isCompleted
                                        ? 'text-foreground'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {step.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {step.timestamp
                                    ? new Date(step.timestamp).toLocaleString(
                                          'id-ID',
                                          {
                                              dateStyle: 'medium',
                                              timeStyle: 'short',
                                          },
                                      )
                                    : step.isCompleted
                                      ? 'Completed'
                                      : 'Waiting...'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
