import type { OrderLine } from '../schema';

export const calculateOrderTotal = (orderLines: OrderLine[]): number => {
    return orderLines.reduce((total, line) => {
        return total + line.quantity * line.price;
    }, 0);
};

export const validateOrderLines = (orderLines: OrderLine[]): string | null => {
    if (orderLines.length === 0) {
        return 'Minimal harus ada 1 produk';
    }

    for (const line of orderLines) {
        if (!line.product_id || line.product_id <= 0) {
            return 'Semua item harus memilih produk';
        }
        if (!line.quantity || line.quantity <= 0) {
            return 'Semua item harus memiliki quantity minimal 1';
        }
    }

    return null;
};
