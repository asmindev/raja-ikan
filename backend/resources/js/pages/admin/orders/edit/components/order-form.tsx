import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormErrors, OrderLine } from '../schema';
import { getOrderLinesError } from '../utils/error-helper';
import { CustomerSelector } from './customer-selector';
import { DeliveryAddressSection } from './delivery-address-section';
import { FormActions } from './form-actions';
import { OrderItemsList } from './order-items-list';
import { OrderSummary } from './order-summary';

interface CustomerOption {
    value: string;
    label: string;
    searchText: string;
    customer: {
        id: number;
        name: string;
        email: string;
        phone: string;
        address?: string;
        latitude?: number;
        longitude?: number;
    };
}

interface DriverOption {
    value: string;
    label: string;
    searchText: string;
}

interface ProductOption {
    value: string;
    label: string;
    product: {
        id: number;
        name: string;
        price: string;
        image: string;
    };
}

interface FormData {
    customer_id: string;
    driver_id: string;
    address: string;
    latitude: string;
    longitude: string;
    notes: string;
    order_lines: OrderLine[];
}

interface Props {
    orderId: number;
    data: FormData;
    errors: FormErrors;
    validationError: string;
    processing: boolean;
    customerOptions: CustomerOption[];
    driverOptions: DriverOption[];
    productOptions: ProductOption[];
    total: number;
    onCustomerChange: (value: string) => void;
    onDriverChange: (value: string) => void;
    onAddressChange: (value: string) => void;
    onLatitudeChange: (value: string) => void;
    onLongitudeChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onAddOrderLine: () => void;
    onRemoveOrderLine: (index: number) => void;
    onUpdateOrderLine: (
        index: number,
        field: keyof OrderLine,
        value: number,
    ) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const OrderForm = ({
    orderId,
    data,
    errors,
    validationError,
    processing,
    customerOptions,
    driverOptions,
    productOptions,
    total,
    onCustomerChange,
    onDriverChange,
    onAddressChange,
    onLatitudeChange,
    onLongitudeChange,
    onNotesChange,
    onAddOrderLine,
    onRemoveOrderLine,
    onUpdateOrderLine,
    onSubmit,
}: Props) => {
    // Parse order_lines errors
    const orderLinesError = getOrderLinesError(errors) || validationError;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Customer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <CustomerSelector
                        value={data.customer_id}
                        options={customerOptions}
                        onChange={onCustomerChange}
                        error={errors.customer_id}
                        disabled={processing}
                    />

                    {/* <DriverSelector
                        value={data.driver_id}
                        options={driverOptions}
                        onChange={onDriverChange}
                        error={errors.driver_id}
                        disabled={processing}
                    /> */}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Alamat & Lokasi Pengiriman</CardTitle>
                </CardHeader>
                <CardContent>
                    <DeliveryAddressSection
                        address={data.address}
                        latitude={data.latitude}
                        longitude={data.longitude}
                        notes={data.notes}
                        onAddressChange={onAddressChange}
                        onLatitudeChange={onLatitudeChange}
                        onLongitudeChange={onLongitudeChange}
                        onNotesChange={onNotesChange}
                        errors={{
                            address: errors.address,
                            latitude: errors.latitude,
                            longitude: errors.longitude,
                            notes: errors.notes,
                        }}
                        disabled={processing}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Produk</CardTitle>
                </CardHeader>
                <CardContent>
                    <OrderItemsList
                        orderLines={data.order_lines}
                        productOptions={productOptions}
                        onAdd={onAddOrderLine}
                        onRemove={onRemoveOrderLine}
                        onUpdate={onUpdateOrderLine}
                        errorMessage={orderLinesError}
                        disabled={processing}
                    />
                </CardContent>
            </Card>

            <OrderSummary total={total} />

            <FormActions isProcessing={processing} orderId={orderId} />
        </form>
    );
};
