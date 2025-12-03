import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { formatRupiah } from '@/lib/currency';
import { router, useForm, usePage } from '@inertiajs/react';
import { Minus, Plus, Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Orders', url: '/admin/orders' },
    { label: 'Create', url: '/admin/orders/create' },
];

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    address?: string;
}

interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
}

interface OrderLine {
    product_id: number;
    quantity: number;
    price: number;
}

interface PagePropsWithData {
    customers: User[];
    drivers: User[];
    products: Product[];
}

export default function CreateOrder() {
    const { customers, drivers, products } = usePage()
        .props as unknown as PagePropsWithData;

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        driver_id: '',
        address: '',
        status: 'pending',
        estimated: '',
        delivery_at: '',
        order_lines: [] as OrderLine[],
    });

    const [orderLines, setOrderLines] = useState<OrderLine[]>([
        { product_id: 0, quantity: 1, price: 0 },
    ]);

    useEffect(() => {
        setData('order_lines', orderLines);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderLines]);

    const addOrderLine = () => {
        setOrderLines([
            ...orderLines,
            { product_id: 0, quantity: 1, price: 0 },
        ]);
    };

    const removeOrderLine = (index: number) => {
        setOrderLines(orderLines.filter((_, i) => i !== index));
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

    const calculateTotal = () => {
        return orderLines.reduce(
            (sum, line) => sum + line.quantity * line.price,
            0,
        );
    };

    const handleCustomerChange = (customerId: string) => {
        setData('customer_id', customerId);

        // Auto-fill address from selected customer
        const selectedCustomer = customers.find(
            (customer) => customer.id.toString() === customerId,
        );
        if (selectedCustomer && selectedCustomer.address) {
            setData('address', selectedCustomer.address);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/orders');
    };

    // Prepare customer options for combobox
    const customerOptions = customers.map((customer) => ({
        value: customer.id.toString(),
        label: `${customer.name} - ${customer.email}`,
    }));

    // Prepare driver options for combobox
    const driverOptions = [
        { value: '', label: 'No Driver' },
        ...drivers.map((driver) => ({
            value: driver.id.toString(),
            label: `${driver.name} - ${driver.phone}`,
        })),
    ];

    // Prepare product options for combobox
    const productOptions = products.map((product) => ({
        value: product.id.toString(),
        label: `${product.name} - ${formatRupiah(product.price)}`,
    }));

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Create New Order</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Fill in the information below to create a new order
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
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
                                        {/* Customer */}
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_id">
                                                Customer *
                                            </Label>
                                            <Combobox
                                                options={customerOptions}
                                                value={data.customer_id}
                                                onValueChange={
                                                    handleCustomerChange
                                                }
                                                placeholder="Select customer"
                                                searchPlaceholder="Search customer by name or email..."
                                                emptyText="No customer found."
                                            />
                                            {errors.customer_id && (
                                                <p className="text-sm text-red-500">
                                                    {errors.customer_id}
                                                </p>
                                            )}
                                        </div>

                                        {/* Driver */}
                                        <div className="space-y-2">
                                            <Label htmlFor="driver_id">
                                                Driver (Optional)
                                            </Label>
                                            <Combobox
                                                options={driverOptions}
                                                value={data.driver_id}
                                                onValueChange={(value) =>
                                                    setData('driver_id', value)
                                                }
                                                placeholder="Select driver"
                                                searchPlaceholder="Search driver by name or phone..."
                                                emptyText="No driver found."
                                            />
                                            {errors.driver_id && (
                                                <p className="text-sm text-red-500">
                                                    {errors.driver_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) =>
                                                setData('status', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">
                                                    Pending
                                                </SelectItem>
                                                <SelectItem value="delivering">
                                                    Delivering
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                    Completed
                                                </SelectItem>
                                                <SelectItem value="cancelled">
                                                    Cancelled
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-500">
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Items Section */}
                                <div className="space-y-4 border-t pt-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-muted-foreground">
                                            Order Items *
                                        </h3>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={addOrderLine}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Item
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {orderLines.map((line, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-4"
                                            >
                                                <div className="flex-1">
                                                    <Combobox
                                                        options={productOptions}
                                                        value={
                                                            line.product_id
                                                                ? line.product_id.toString()
                                                                : ''
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateOrderLine(
                                                                index,
                                                                'product_id',
                                                                parseInt(value),
                                                            )
                                                        }
                                                        placeholder="Select product"
                                                        searchPlaceholder="Search product..."
                                                        emptyText="No product found."
                                                    />
                                                </div>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Qty"
                                                    value={line.quantity}
                                                    onChange={(e) =>
                                                        updateOrderLine(
                                                            index,
                                                            'quantity',
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 1,
                                                        )
                                                    }
                                                    className="w-20"
                                                />
                                                <CurrencyInput
                                                    placeholder="Price"
                                                    value={line.price}
                                                    onChange={(value) =>
                                                        updateOrderLine(
                                                            index,
                                                            'price',
                                                            value || 0,
                                                        )
                                                    }
                                                    className="w-40"
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() =>
                                                        removeOrderLine(index)
                                                    }
                                                    disabled={
                                                        orderLines.length === 1
                                                    }
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.order_lines && (
                                        <p className="text-sm text-red-500">
                                            {errors.order_lines}
                                        </p>
                                    )}
                                </div>

                                {/* Summary */}
                                <div className="border-t pt-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-end gap-20 text-sm">
                                            <span className="text-muted-foreground">
                                                Subtotal
                                            </span>
                                            <span className="font-medium">
                                                {formatRupiah(calculateTotal())}
                                            </span>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="flex justify-end gap-20 text-base font-bold">
                                                <span>Total</span>
                                                <span>
                                                    {formatRupiah(
                                                        calculateTotal(),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/admin/orders')}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 gap-2"
                                disabled={processing}
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Creating...' : 'Create Order'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
