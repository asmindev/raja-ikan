import { formatRupiah } from '@/lib/currency';
import type { Product, User } from '../schema';

export const formatCustomerOptions = (customers: User[]) => {
    return customers.map((customer) => ({
        value: customer.id.toString(),
        label: `${customer.name} - ${customer.email}`,
    }));
};

export const formatDriverOptions = (drivers: User[]) => {
    return [
        { value: '', label: 'No Driver' },
        ...drivers.map((driver) => ({
            value: driver.id.toString(),
            label: driver.name,
            searchText:
                `${driver.name} ${driver.phone} ${driver.email}`.toLowerCase(),
        })),
    ];
};

export const formatProductOptions = (products: Product[]) => {
    return products.map((product) => ({
        value: product.id.toString(),
        label: `${product.name} - ${formatRupiah(product.price)}`,
    }));
};
