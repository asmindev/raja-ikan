import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import routes from '@/routes/admin/products';
import { PageProps } from '@/types/product';
import { Link, usePage } from '@inertiajs/react';
import { ProductFilters } from './components/product-filters';
import { ProductPagination } from './components/product-pagination';
import { ProductStats } from './components/product-stats';
import { ProductTable } from './components/product-table';
import { useProductTable } from './hooks/use-product-table';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Products', url: '/admin/products' },
];

export default function AdminProductsIndex() {
    const {
        table,
        search,
        isActive,
        perPage,
        handleSearch,
        handleIsActiveChange,
        handlePerPageChange,
    } = useProductTable();
    const { stats } = usePage().props as unknown as PageProps;

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full p-6">
                <ProductStats
                    totalProducts={stats.total_products}
                    activeProducts={stats.active_products}
                    inactiveProducts={stats.inactive_products}
                />
                <Card className="w-full">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                <h1>Data Products</h1>
                            </CardTitle>
                            <Link href={routes.create.url()}>
                                <Button>Create Product</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <ProductFilters
                            search={search}
                            onSearchChange={handleSearch}
                            isActive={isActive}
                            onIsActiveChange={handleIsActiveChange}
                            perPage={perPage}
                            onPerPageChange={handlePerPageChange}
                        />
                        <div className="overflow-x-auto">
                            <ProductTable table={table} />
                        </div>
                        <ProductPagination table={table} />
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
