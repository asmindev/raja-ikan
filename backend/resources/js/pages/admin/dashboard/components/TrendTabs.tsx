import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderTrendChart from './OrderTrendChart';
import VisitorTrendChart from './VisitorTrendChart';

interface VisitorTrend {
    date: string;
    mobile: number;
    desktop: number;
}

interface OrderTrend {
    date: string;
    total: number;
    completed: number;
}

interface TrendTabsProps {
    visitorsTrend: VisitorTrend[];
    ordersTrend: OrderTrend[];
}

export default function TrendTabs({
    visitorsTrend,
    ordersTrend,
}: TrendTabsProps) {
    return (
        <Tabs defaultValue="visitors" className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visitors">Visitor Trend</TabsTrigger>
                <TabsTrigger value="orders">Order Trend</TabsTrigger>
            </TabsList>
            <TabsContent value="visitors" className="mt-4">
                <VisitorTrendChart data={visitorsTrend} />
            </TabsContent>
            <TabsContent value="orders" className="mt-4">
                <OrderTrendChart data={ordersTrend} />
            </TabsContent>
        </Tabs>
    );
}
