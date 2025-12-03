import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { formatRupiah } from '@/lib/currency';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { Minus, Plus, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Orders', url: '/admin/orders' },
    { label: 'Edit', url: '#' },
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

interface OrderLineData {
    id?: number;
    product_id: number;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    customer_id: number;
    driver_id: number | null;
    address: string;
    status: string;
    estimated: string | null;
    delivery_at: string | null;
    order_lines: OrderLineData[];
}

interface PagePropsWithData {
    order: Order;
    customers: User[];
    drivers: User[];
    products: Product[];
}

// Form validation schema
const formSchema = z.object({
    customer_id: z.string().min(1, 'Customer is required'),
    driver_id: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    status: z.enum(['pending', 'delivering', 'completed', 'cancelled']),
    estimated: z.string().optional(),
    delivery_at: z.string().optional(),
    order_lines: z
        .array(
            z.object({
                product_id: z.number().min(1, 'Product is required'),
                quantity: z.number().min(1, 'Quantity must be at least 1'),
                price: z.number().min(0, 'Price must be positive'),
            }),
        )
        .min(1, 'At least one order item is required'),
});

export default function EditOrder() {
    const { order, customers, drivers, products } = usePage()
        .props as unknown as PagePropsWithData;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [orderLines, setOrderLines] = useState<OrderLineData[]>(
        order.order_lines.map((line) => ({
            product_id: line.product_id,
            quantity: line.quantity,
            price: parseFloat(line.price.toString()),
        })),
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customer_id: order.customer_id.toString(),
            driver_id: order.driver_id ? order.driver_id.toString() : '',
            address: order.address,
            status: order.status as
                | 'pending'
                | 'delivering'
                | 'completed'
                | 'cancelled',
            estimated: order.estimated
                ? new Date(order.estimated).toISOString().slice(0, 16)
                : '',
            delivery_at: order.delivery_at
                ? new Date(order.delivery_at).toISOString().slice(0, 16)
                : '',
            order_lines: orderLines,
        },
    });

    useEffect(() => {
        form.setValue('order_lines', orderLines);
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
        field: keyof OrderLineData,
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
        form.setValue('customer_id', customerId);

        // Auto-fill address from selected customer
        const selectedCustomer = customers.find(
            (customer) => customer.id.toString() === customerId,
        );
        if (selectedCustomer && selectedCustomer.address) {
            form.setValue('address', selectedCustomer.address);
        }
    };

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        router.put(`/admin/orders/${order.id}`, values, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    // Prepare customer options for combobox with better search
    const customerOptions = customers.map((customer) => ({
        value: customer.id.toString(),
        label: `${customer.name} - ${customer.email}`,
        searchText:
            `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase(),
    }));

    // Prepare driver options for combobox with better search
    const driverOptions = [
        { value: '', label: 'No Driver', searchText: 'no driver' },
        ...drivers.map((driver) => ({
            value: driver.id.toString(),
            label: `${driver.name} - ${driver.phone}`,
            searchText: `${driver.name} ${driver.phone}`.toLowerCase(),
        })),
    ];

    // Prepare product options for combobox
    const productOptions = products.map((product) => ({
        value: product.id.toString(),
        label: `${product.name} - ${formatRupiah(product.price)}`,
        searchText: product.name.toLowerCase(),
    }));

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">
                        Edit Order #{order.id}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update order information and items
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
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
                                            <FormField
                                                control={form.control}
                                                name="customer_id"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>
                                                            Customer *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Combobox
                                                                options={
                                                                    customerOptions
                                                                }
                                                                value={
                                                                    field.value
                                                                }
                                                                onValueChange={
                                                                    handleCustomerChange
                                                                }
                                                                placeholder="Select customer"
                                                                searchPlaceholder="Search customer by name, email, or phone..."
                                                                emptyText="No customer found."
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Select the customer
                                                            for this order
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Driver */}
                                            <FormField
                                                control={form.control}
                                                name="driver_id"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>
                                                            Driver (Optional)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Combobox
                                                                options={
                                                                    driverOptions
                                                                }
                                                                value={
                                                                    field.value ||
                                                                    ''
                                                                }
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                placeholder="Select driver"
                                                                searchPlaceholder="Search driver by name or phone..."
                                                                emptyText="No driver found."
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Assign a driver to
                                                            deliver this order
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Status */}
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Status *
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
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
                                                    <FormDescription>
                                                        Current order status
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                        <FormField
                                            control={form.control}
                                            name="order_lines"
                                            render={() => (
                                                <FormItem>
                                                    <div className="space-y-2">
                                                        {orderLines.map(
                                                            (line, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex gap-2"
                                                                >
                                                                    <div className="flex-1">
                                                                        <Combobox
                                                                            options={
                                                                                productOptions
                                                                            }
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
                                                                                    parseInt(
                                                                                        value,
                                                                                    ),
                                                                                )
                                                                            }
                                                                            placeholder="Select product"
                                                                            searchPlaceholder="Search product by name..."
                                                                            emptyText="No product found."
                                                                        />
                                                                    </div>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        placeholder="Qty"
                                                                        value={
                                                                            line.quantity
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateOrderLine(
                                                                                index,
                                                                                'quantity',
                                                                                parseInt(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ) ||
                                                                                    1,
                                                                            )
                                                                        }
                                                                        className="w-20"
                                                                    />
                                                                    <CurrencyInput
                                                                        placeholder="Price"
                                                                        value={
                                                                            line.price
                                                                        }
                                                                        onChange={(
                                                                            value,
                                                                        ) =>
                                                                            updateOrderLine(
                                                                                index,
                                                                                'price',
                                                                                value ||
                                                                                    0,
                                                                            )
                                                                        }
                                                                        className="w-40"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        size="icon"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            removeOrderLine(
                                                                                index,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            orderLines.length ===
                                                                            1
                                                                        }
                                                                    >
                                                                        <Minus className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                    <FormDescription>
                                                        Add products to this
                                                        order
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Summary */}
                                    <div className="border-t pt-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-end gap-20 text-sm">
                                                <span className="text-muted-foreground">
                                                    Subtotal
                                                </span>
                                                <span className="font-medium">
                                                    {formatRupiah(
                                                        calculateTotal(),
                                                    )}
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
                                    onClick={() =>
                                        router.visit(
                                            `/admin/orders/${order.id}`,
                                        )
                                    }
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 gap-2"
                                    disabled={
                                        isSubmitting ||
                                        form.formState.isSubmitting
                                    }
                                >
                                    <Save className="h-4 w-4" />
                                    {isSubmitting || form.formState.isSubmitting
                                        ? 'Updating...'
                                        : 'Update Order'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </Layout>
    );
}
