import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { OrderForm } from './components/order-form';
import { useOrderForm } from './hooks/use-order-form';
import type { PagePropsWithData } from './schema';
import {
    formatCustomerOptions,
    formatDriverOptions,
    formatProductOptions,
} from './utils/format-options';
import { calculateOrderTotal } from './utils/order-calculations';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Orders', url: '/admin/orders' },
    { label: 'Create', url: '/admin/orders/create' },
];

export default function CreateOrder() {
    const { customers, drivers, products } = usePage()
        .props as unknown as PagePropsWithData;

    const {
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
    } = useOrderForm(customers, products);

    const customerOptions = formatCustomerOptions(customers);
    const driverOptions = formatDriverOptions(drivers);
    const productOptions = formatProductOptions(products);
    const orderTotal = calculateOrderTotal(orderLines);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSubmit();
    };

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Create New Order</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Fill in the information below to create a new order
                    </p>
                </div>

                <OrderForm
                    data={data}
                    setData={setData}
                    processing={processing}
                    errors={errors}
                    orderLines={orderLines}
                    customerOptions={customerOptions}
                    driverOptions={driverOptions}
                    productOptions={productOptions}
                    orderTotal={orderTotal}
                    onCustomerChange={handleCustomerChange}
                    onDriverChange={(value) => setData('driver_id', value)}
                    onAddOrderLine={addOrderLine}
                    onRemoveOrderLine={removeOrderLine}
                    onUpdateOrderLine={updateOrderLine}
                    onSubmit={onSubmit}
                />
            </div>
        </Layout>
    );
}
