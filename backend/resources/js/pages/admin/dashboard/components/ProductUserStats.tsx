import { Package, Users } from 'lucide-react';
import StatsCard from './StatsCard';

interface ProductUserStatsProps {
    totalProducts: number;
    totalUsers: number;
}

export default function ProductUserStats({
    totalProducts,
    totalUsers,
}: ProductUserStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <StatsCard
                title="Total Products"
                value={totalProducts}
                description="Produk terdaftar dalam sistem"
                icon={Package}
            />
            <StatsCard
                title="Total Customers"
                value={totalUsers}
                description="Customer terdaftar dalam sistem"
                icon={Users}
            />
        </div>
    );
}
