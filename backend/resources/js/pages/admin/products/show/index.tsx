import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import routes from '@/routes/admin/products';
import { PageProps, Product } from '@/types/product';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Check, DollarSign, Edit2, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Products', url: '/admin/products' },
    { label: 'Show', url: '/admin/products/show' },
];

interface ShowPageProps extends PageProps {
    product: Product;
}

export default function AdminProductsShow() {
    const { product } = usePage().props as unknown as ShowPageProps;

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Product Details
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(routes.index.url())}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <Button
                            type="button"
                            onClick={() =>
                                router.visit(routes.edit.url(product))
                            }
                            className="gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Main Info - Kolom Kiri */}
                    <div className="space-y-6 md:col-span-2">
                        {/* Product Image */}
                        {product.image && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Product Image
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-center">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="max-w-full rounded-lg shadow-md"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-gray-700">
                                    {product.description}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side Info - Kolom Kanan */}
                    <div className="space-y-4">
                        {/* Status Badge */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            product.is_active
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="gap-1"
                                    >
                                        {product.is_active ? (
                                            <>
                                                <Check className="h-3 w-3" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <X className="h-3 w-3" />
                                                Inactive
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Price */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <DollarSign className="h-4 w-4" />
                                    Price
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-green-600">
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                    }).format(product.price)}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Product ID */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Product ID
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-mono text-sm text-gray-600">
                                    #{product.id}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Dates */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4" />
                                    Dates
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Created
                                    </p>
                                    <p className="font-medium">
                                        {new Date(
                                            product.created_at,
                                        ).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Last Updated
                                    </p>
                                    <p className="font-medium">
                                        {new Date(
                                            product.updated_at,
                                        ).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
