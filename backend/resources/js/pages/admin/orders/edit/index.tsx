import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { usePage } from '@inertiajs/react';
import { OrderForm } from './components/order-form';
import { useEditOrderForm } from './hooks/use-edit-order-form';
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
    { label: 'Edit', url: '#' },
];

export default function EditOrder() {
    const { order, customers, drivers, products } = usePage()
        .props as unknown as PagePropsWithData;

    // Use custom hook for form management
    const {
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
    } = useEditOrderForm(order, customers, products);

    // Format options for combobox components
    const customerOptions = formatCustomerOptions(customers);
    const driverOptions = formatDriverOptions(drivers);
    const productOptions = formatProductOptions(products);

    // Calculate total
    const total = calculateOrderTotal(data.order_lines);

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="container mx-auto px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">
                        Edit Order #{order.id}
                    </h1>
                    <p className="text-muted-foreground">
                        Ubah detail order yang sudah dikonfirmasi dengan status
                        pending
                    </p>
                </div>

                <OrderForm
                    orderId={order.id}
                    data={data}
                    errors={errors}
                    validationError={validationError}
                    processing={processing}
                    customerOptions={customerOptions}
                    driverOptions={driverOptions}
                    productOptions={productOptions}
                    total={total}
                    onCustomerChange={handleCustomerChange}
                    onDriverChange={(value) => setData('driver_id', value)}
                    onAddressChange={(value) => setData('address', value)}
                    onLatitudeChange={(value) => setData('latitude', value)}
                    onLongitudeChange={(value) => setData('longitude', value)}
                    onNotesChange={(value) => setData('notes', value)}
                    onAddOrderLine={addOrderLine}
                    onRemoveOrderLine={removeOrderLine}
                    onUpdateOrderLine={updateOrderLine}
                    onSubmit={handleSubmit}
                />
            </div>
        </Layout>
    );
}
