import { router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import type { Order, OrderFormData, OrderLine, Product, User } from '../schema';
import { validateOrderLines } from '../utils/order-calculations';

export const useEditOrderForm = (
    order: Order,
    customers: User[],
    products: Product[],
) => {
    const { data, setData, errors, processing } = useForm<OrderFormData>({
        customer_id: order.customer_id.toString(),
        driver_id: order.driver_id ? order.driver_id.toString() : '',
        address: order.address,
        latitude: order.latitude?.toString() || '',
        longitude: order.longitude?.toString() || '',
        notes: order.notes || '',
        order_lines: order.order_lines.map((line) => ({
            id: line.id,
            product_id: line.product_id,
            quantity: line.quantity,
            price: line.price,
        })),
    });

    const [validationError, setValidationError] = useState<string>('');

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find((c) => c.id.toString() === customerId);

        if (customer) {
            setData({
                ...data,
                customer_id: customerId,
                address: customer.address || '',
                latitude: customer.latitude?.toString() || '',
                longitude: customer.longitude?.toString() || '',
            });
        } else {
            setData('customer_id', customerId);
        }
    };

    const addOrderLine = () => {
        setData('order_lines', [
            ...data.order_lines,
            { product_id: 0, quantity: 1, price: 0 },
        ]);
    };

    const removeOrderLine = (index: number) => {
        const newOrderLines = data.order_lines.filter((_, i) => i !== index);
        setData('order_lines', newOrderLines);
    };

    const updateOrderLine = (
        index: number,
        field: keyof OrderLine,
        value: number,
    ) => {
        const newOrderLines = [...data.order_lines];
        newOrderLines[index] = { ...newOrderLines[index], [field]: value };

        // Auto-fill price when product is selected
        if (field === 'product_id') {
            const product = products.find((p) => p.id === value);
            if (product) {
                newOrderLines[index].price = parseFloat(product.price);
            }
        }

        setData('order_lines', newOrderLines);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setValidationError('');

        // Client-side validation for order lines
        const error = validateOrderLines(data.order_lines);
        if (error) {
            setValidationError(error);
            return;
        }

        router.put(`/admin/orders/${order.id}`, data as any);
    };

    return {
        data,
        setData,
        errors,
        processing,
        validationError,
        handleCustomerChange,
        addOrderLine,
        removeOrderLine,
        updateOrderLine,
        handleSubmit,
    };
};
