import type { Product, User } from '../schema';

export const formatCustomerOptions = (customers: User[]) => {
    return customers.map((customer) => ({
        value: customer.id.toString(),
        label: `${customer.name} • ${customer.email}`,
        searchText: `${customer.name} ${customer.email} ${customer.phone}`,
        customer,
    }));
};

export const formatDriverOptions = (drivers: User[]) => {
    return drivers.map((driver) => ({
        value: driver.id.toString(),
        label: `${driver.name} • ${driver.phone} • ${driver.email}`,
        searchText: `${driver.name} ${driver.phone} ${driver.email}`,
    }));
};

export const formatProductOptions = (products: Product[]) => {
    return products.map((product) => ({
        value: product.id.toString(),
        label: product.name,
        product,
    }));
};
