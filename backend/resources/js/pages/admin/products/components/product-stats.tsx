import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, XCircle } from 'lucide-react';

interface ProductStatsProps {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
}

export function ProductStats({
    totalProducts,
    activeProducts,
    inactiveProducts,
}: ProductStatsProps) {
    return (
        <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Products
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalProducts}</div>
                    <p className="text-xs text-muted-foreground">
                        Total products
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active Products
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeProducts}</div>
                    <p className="text-xs text-muted-foreground">
                        Currently active
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Inactive Products
                    </CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{inactiveProducts}</div>
                    <p className="text-xs text-muted-foreground">
                        Currently inactive
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
