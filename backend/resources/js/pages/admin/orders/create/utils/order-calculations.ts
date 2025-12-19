import type { OrderLine } from '../schema';

export const calculateOrderTotal = (orderLines: OrderLine[]): number => {
    return orderLines.reduce(
        (sum, line) => sum + line.quantity * line.price,
        0,
    );
};

export const validateOrderLines = (orderLines: OrderLine[]): boolean => {
    return orderLines.every(
        (line) => line.product_id > 0 && line.quantity > 0 && line.price >= 0,
    );
};
