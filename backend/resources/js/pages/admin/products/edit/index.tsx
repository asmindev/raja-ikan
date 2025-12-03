import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import routes from '@/routes/admin/products';
import { PageProps, Product } from '@/types/product';
import { router, usePage } from '@inertiajs/react';
import { Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Products', url: '/admin/products' },
    { label: 'Edit', url: '/admin/products/edit' },
];

interface FormData {
    name: string;
    description: string;
    price: number | undefined;
    image: FileList | null;
    is_active: boolean;
    delete_image?: boolean;
}

interface EditPageProps extends PageProps {
    product: Product;
}

export default function AdminProductsEdit() {
    const { product } = usePage().props as unknown as EditPageProps;
    const { errors } = usePage().props;
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const form = useForm<FormData>({
        defaultValues: {
            name: product.name,
            description: product.description,
            price: product.price,
            image: null,
            is_active: product.is_active,
            delete_image: false,
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (product.image) {
            setImagePreview(product.image);
        }
    }, [product?.image]);

    // Handle server validation errors
    useEffect(() => {
        if (errors) {
            Object.keys(errors).forEach((key) => {
                form.setError(key as keyof FormData, {
                    type: 'server',
                    message: errors[key],
                });
            });
        }
    }, [errors, form]);

    const handleImageChange = (files: FileList | null) => {
        form.setValue('image', files);
        if (files && files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(files[0]);
        } else if (!product.image) {
            setImagePreview(null);
        }
    };

    const removeImage = () => {
        form.setValue('image', null);
        form.setValue('delete_image', true);
        setImagePreview(null);
    };

    const onSubmit = (data: FormData) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price?.toString() || '');
        formData.append('is_active', data.is_active ? '1' : '0');
        formData.append('_method', 'PUT');
        if (data.delete_image) {
            formData.append('delete_image', '1');
        }
        if (data.image && data.image[0]) {
            formData.append('image', data.image[0]);
        }

        router.post(routes.update.url(product), formData, {
            onSuccess: () => {
                router.visit('/admin/products');
            },
            onError: (errors) => {
                // Handle server validation errors
                Object.keys(errors).forEach((key) => {
                    form.setError(key as keyof FormData, {
                        type: 'server',
                        message: errors[key],
                    });
                });
            },
        });
    };

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>
                            <h1>Edit Product</h1>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="grid grid-cols-1 gap-8 md:grid-cols-3"
                            >
                                {/* Form Fields */}
                                <div className="space-y-6 md:col-span-2">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            rules={{
                                                required:
                                                    'Product name is required.',
                                                maxLength: {
                                                    value: 255,
                                                    message:
                                                        'Product name cannot exceed 255 characters.',
                                                },
                                            }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Product name"
                                                            className="h-12"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            rules={{
                                                required:
                                                    'Product price is required.',
                                                validate: (value) => {
                                                    if (
                                                        value !== undefined &&
                                                        value !== null
                                                    ) {
                                                        if (isNaN(value)) {
                                                            return 'Product price must be a valid number.';
                                                        }
                                                        if (value < 0) {
                                                            return 'Product price cannot be negative.';
                                                        }
                                                    }
                                                    return true;
                                                },
                                            }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price</FormLabel>
                                                    <FormControl>
                                                        <CurrencyInput
                                                            placeholder="0"
                                                            className="h-12"
                                                            value={field.value}
                                                            onChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        rules={{
                                            required:
                                                'Product description is required.',
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Description
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Product description"
                                                        className="min-h-32 resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="is_active"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                                                <div className="space-y-1">
                                                    <FormLabel className="text-sm font-medium">
                                                        Active Product
                                                    </FormLabel>
                                                    <p className="text-xs text-muted-foreground">
                                                        Make this product
                                                        available for purchase
                                                    </p>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="image"
                                        rules={{
                                            validate: (value) => {
                                                if (value && value[0]) {
                                                    const file = value[0];
                                                    const allowedTypes = [
                                                        'image/jpeg',
                                                        'image/png',
                                                        'image/jpg',
                                                        'image/gif',
                                                    ];
                                                    if (
                                                        !allowedTypes.includes(
                                                            file.type,
                                                        )
                                                    ) {
                                                        return 'Image must be in JPEG, PNG, JPG, or GIF format.';
                                                    }
                                                    if (
                                                        file.size >
                                                        10 * 1024 * 1024
                                                    ) {
                                                        // 10MB
                                                        return 'Image size cannot exceed 10MB.';
                                                    }
                                                }
                                                return true;
                                            },
                                        }}
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>
                                                    Product Image
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="space-y-3">
                                                        {imagePreview && (
                                                            <div className="relative w-full overflow-hidden rounded-lg border">
                                                                <img
                                                                    src={
                                                                        imagePreview
                                                                    }
                                                                    alt="Preview"
                                                                    className="aspect-square w-full object-cover"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 h-7 w-7 rounded-full"
                                                                    onClick={
                                                                        removeImage
                                                                    }
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}

                                                        <div className="group cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) =>
                                                                    handleImageChange(
                                                                        e.target
                                                                            .files,
                                                                    )
                                                                }
                                                                className="hidden"
                                                                id="image-upload"
                                                            />
                                                            <label
                                                                htmlFor="image-upload"
                                                                className="flex flex-col items-center justify-center space-y-2"
                                                            >
                                                                <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                                                                <span className="text-sm text-muted-foreground">
                                                                    Click to
                                                                    upload or
                                                                    drag & drop
                                                                </span>
                                                                <p className="text-xs text-muted-foreground">
                                                                    PNG, JPG,
                                                                    GIF up to
                                                                    10MB
                                                                </p>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="col-span-full flex justify-end space-x-4 border-t pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            router.visit('/admin/products')
                                        }
                                        className="px-8"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="px-8">
                                        Update Product
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
