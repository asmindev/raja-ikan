import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { OrderFormData, OrderLine, Product, User } from '../schema';

export const useOrderForm = (customers: User[], products: Product[]) => {
    const { data, setData, post, processing, errors } = useForm<OrderFormData>({
        customer_id: '',
        driver_id: '',
        address: '',
        latitude: '',
        longitude: '',
        notes: '',
        estimated: '',
        delivery_at: '',
        order_lines: [],
    });

    const [orderLines, setOrderLines] = useState<OrderLine[]>([
        { product_id: 0, quantity: 1, price: 0 },
    ]);

    // Sync order lines with form data
    useEffect(() => {
        setData('order_lines', orderLines);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderLines]);

    const handleCustomerChange = (customerId: string) => {
        setData('customer_id', customerId);

        const selectedCustomer = customers.find(
            (customer) => customer.id.toString() === customerId,
        );

        if (selectedCustomer) {
            if (selectedCustomer.address) {
                setData('address', selectedCustomer.address);
            }
            if (selectedCustomer.latitude) {
                setData('latitude', selectedCustomer.latitude.toString());
            }
            if (selectedCustomer.longitude) {
                setData('longitude', selectedCustomer.longitude.toString());
            }
        }
    };

    const addOrderLine = () => {
        setOrderLines([
            ...orderLines,
            { product_id: 0, quantity: 1, price: 0 },
        ]);
    };

    const removeOrderLine = (index: number) => {
        if (orderLines.length > 1) {
            setOrderLines(orderLines.filter((_, i) => i !== index));
        }
    };

    const updateOrderLine = (
        index: number,
        field: keyof OrderLine,
        value: number,
    ) => {
        const newLines = [...orderLines];
        newLines[index] = { ...newLines[index], [field]: value };

        // Auto-fill price when product is selected
        if (field === 'product_id') {
            const product = products.find((p) => p.id === value);
            if (product) {
                newLines[index].price = parseFloat(product.price);
            }
        }

        setOrderLines(newLines);
    };

    const handleSubmit = () => {
        post('/admin/orders');
    };

    return {
        data,
        setData,
        processing,
        errors,
        orderLines,
        handleCustomerChange,
        addOrderLine,
        removeOrderLine,
        updateOrderLine,
        handleSubmit,
    };
};
