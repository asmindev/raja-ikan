import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormEvent } from 'react';
import type { FormErrors, OrderFormData, OrderLine } from '../schema';
import { getOrderLinesError } from '../utils/error-helper';
import { CustomerSelector } from './customer-selector';
import { DeliveryAddressSection } from './delivery-address-section';
import { DriverSelector } from './driver-selector';
import { FormActions } from './form-actions';
import { OrderItemsList } from './order-items-list';
import { OrderSummary } from './order-summary';

interface OrderFormProps {
    data: OrderFormData;
    setData: (key: keyof OrderFormData, value: string) => void;
    processing: boolean;
    errors: FormErrors;
    orderLines: OrderLine[];
    customerOptions: Array<{ value: string; label: string }>;
    driverOptions: Array<{ value: string; label: string; searchText?: string }>;
    productOptions: Array<{ value: string; label: string }>;
    orderTotal: number;
    onCustomerChange: (value: string) => void;
    onDriverChange: (value: string) => void;
    onAddOrderLine: () => void;
    onRemoveOrderLine: (index: number) => void;
    onUpdateOrderLine: (
        index: number,
        field: keyof OrderLine,
        value: number,
    ) => void;
    onSubmit: (e: FormEvent) => void;
}

export function OrderForm({
    data,
    setData,
    processing,
    errors,
    orderLines,
    customerOptions,
    driverOptions,
    productOptions,
    orderTotal,
    onCustomerChange,
    onDriverChange,
    onAddOrderLine,
    onRemoveOrderLine,
    onUpdateOrderLine,
    onSubmit,
}: OrderFormProps) {
    // Get parsed error message for order lines
    const orderLinesError = getOrderLinesError(errors);

    return (
        <form onSubmit={onSubmit}>
            <div className="space-y-6">
                {/* Order Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Customer Information Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Informasi Pelanggan
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <CustomerSelector
                                    value={data.customer_id}
                                    options={customerOptions}
                                    onChange={onCustomerChange}
                                    error={errors.customer_id}
                                />
                                <DriverSelector
                                    value={data.driver_id}
                                    options={driverOptions}
                                    onChange={onDriverChange}
                                    error={errors.driver_id}
                                />
                            </div>
                        </div>

                        {/* Delivery Address Section */}
                        <DeliveryAddressSection
                            data={data}
                            setData={setData}
                            errors={errors}
                        />

                        {/* Order Items Section */}
                        <OrderItemsList
                            orderLines={orderLines}
                            productOptions={productOptions}
                            onAdd={onAddOrderLine}
                            onRemove={onRemoveOrderLine}
                            onUpdate={onUpdateOrderLine}
                            error={orderLinesError}
                        />

                        {/* Summary */}
                        <OrderSummary total={orderTotal} />
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <FormActions processing={processing} />
            </div>
        </form>
    );
}
