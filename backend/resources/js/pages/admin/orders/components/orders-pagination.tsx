import { Button } from '@/components/ui/button';

interface PaginatedOrders {
    data: unknown[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface OrdersPaginationProps {
    orders: PaginatedOrders;
    onPageChange: (page: number) => void;
}

export function OrdersPagination({
    orders,
    onPageChange,
}: OrdersPaginationProps) {
    if (orders.last_page <= 1) {
        return null;
    }

    return (
        <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-gray-600">
                Showing {orders.data.length} of {orders.total} orders
            </p>
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(orders.current_page - 1)}
                    disabled={orders.current_page === 1}
                >
                    Previous
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(orders.current_page + 1)}
                    disabled={orders.current_page === orders.last_page}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
