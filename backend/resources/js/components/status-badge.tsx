import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    Ban,
    CheckCircle2,
    Circle,
    CircleOff,
    Clock,
    CreditCard,
    HelpCircle,
    Info,
    PauseCircle,
    RotateCcw,
    Truck,
    XCircle,
} from 'lucide-react';
import type { ComponentProps } from 'react';

type BadgeVariant = ComponentProps<typeof Badge>['variant'];

type StatusConfig = {
    label: string;
    icon: LucideIcon;
    iconClassName: string;
    variant?: BadgeVariant;
};

const STATUS_ALIASES: Record<string, string> = {
    // spelling / separators
    'in-progress': 'in_progress',
    'out-for-delivery': 'out_for_delivery',
    'on-hold': 'on_hold',

    // common synonyms
    canceled: 'cancelled',
    delivered: 'completed',
    done: 'completed',
    success: 'completed',
    shipping: 'delivering',
    shipped: 'delivering',
    enroute: 'delivering',
    en_route: 'delivering',
    out_for_delivery: 'delivering',

    unpaid: 'pending',
    awaiting_payment: 'pending',

    in_progress: 'processing',
    processing: 'processing',
    preparing: 'processing',

    enabled: 'active',
    online: 'active',
    available: 'active',

    disabled: 'inactive',
    offline: 'inactive',
    unavailable: 'inactive',

    rejected: 'failed',
    error: 'failed',

    returned: 'refunded',
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
    pending: {
        label: 'Pending',
        icon: Clock,
        iconClassName: 'fill-yellow-500 text-background',
    },
    processing: {
        label: 'Processing',
        icon: Info,
        iconClassName: 'fill-blue-500 text-background',
    },
    delivering: {
        label: 'Delivering',
        icon: Truck,
        iconClassName: 'fill-blue-500 text-background',
    },
    completed: {
        label: 'Completed',
        icon: CheckCircle2,
        iconClassName: 'fill-green-500 text-background',
    },
    cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        iconClassName: 'fill-red-500 text-background',
    },
    failed: {
        label: 'Failed',
        icon: AlertTriangle,
        iconClassName: 'fill-red-500 text-background',
    },
    refunded: {
        label: 'Refunded',
        icon: RotateCcw,
        iconClassName: 'fill-orange-500 text-background',
    },
    paid: {
        label: 'Paid',
        icon: CreditCard,
        iconClassName: 'fill-green-500 text-background',
    },
    active: {
        label: 'Active',
        icon: CheckCircle2,
        iconClassName: 'fill-green-500 text-background',
    },
    inactive: {
        label: 'Inactive',
        icon: CircleOff,
        iconClassName: 'text-muted-foreground',
    },
    paused: {
        label: 'Paused',
        icon: PauseCircle,
        iconClassName: 'fill-orange-500 text-background',
    },
    blocked: {
        label: 'Blocked',
        icon: Ban,
        iconClassName: 'fill-red-500 text-background',
    },
    info: {
        label: 'Info',
        icon: Info,
        iconClassName: 'fil-blue-500 text-background',
    },
};

function normalizeStatus(value: unknown): string {
    if (value === null || value === undefined) return '';

    return String(value).trim().toLowerCase().replace(/\s+/g, '_');
}

function toTitleCase(raw: string): string {
    const s = raw.replace(/[_-]+/g, ' ').trim();
    if (!s) return 'Unknown';

    return s
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export interface StatusBadgeProps {
    status?: string | null;
    label?: string;
    variant?: BadgeVariant;
    className?: string;
    iconClassName?: string;
}

export function StatusBadge({
    status,
    label,
    variant = 'outline',
    className,
    iconClassName,
}: StatusBadgeProps) {
    const rawKey = normalizeStatus(status);
    const canonicalKey = STATUS_ALIASES[rawKey] ?? rawKey;

    const config: StatusConfig =
        STATUS_CONFIG[canonicalKey] ??
        (rawKey
            ? {
                  label: toTitleCase(rawKey),
                  icon: Circle,
                  iconClassName: 'text-muted-foreground',
              }
            : {
                  label: 'Unknown',
                  icon: HelpCircle,
                  iconClassName: 'text-muted-foreground',
              });

    const Icon = config.icon;
    const finalVariant = config.variant ?? variant;

    return (
        <Badge
            variant={finalVariant}
            className={cn('gap-1 rounded-2xl pl-1', className)}
            data-status={canonicalKey || undefined}
        >
            <Icon
                className={cn('size-4', config.iconClassName, iconClassName)}
            />
            <span className="text-foreground/60">{label ?? config.label}</span>
        </Badge>
    );
}
