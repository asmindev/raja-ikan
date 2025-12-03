import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

interface OrderTrend {
    date: string;
    total: number;
    completed: number;
}

interface OrderTrendChartProps {
    data: OrderTrend[];
}

const chartConfig = {
    total: {
        label: 'Total Orders',
        color: 'var(--chart-3)',
    },
    completed: {
        label: 'Completed',
        color: 'var(--chart-4)',
    },
} satisfies ChartConfig;

export default function OrderTrendChart({ data }: OrderTrendChartProps) {
    return (
        <Card className="flex-1">
            <CardHeader className="pb-4">
                <CardTitle className="text-base">
                    Order Trend (7 Hari Terakhir)
                </CardTitle>
                <CardDescription className="text-sm">
                    Grafik total order dan order selesai dalam 7 hari terakhir
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
                <ChartContainer
                    config={chartConfig}
                    className="h-[250px] w-full"
                >
                    <AreaChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 0,
                            right: 0,
                            top: 5,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                });
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <defs>
                            <linearGradient
                                id="fillTotal"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-total)"
                                    stopOpacity={0.9}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-total)"
                                    stopOpacity={0.2}
                                />
                            </linearGradient>
                            <linearGradient
                                id="fillCompleted"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-completed)"
                                    stopOpacity={0.6}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-completed)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="completed"
                            type="natural"
                            fill="url(#fillCompleted)"
                            fillOpacity={0.3}
                            stroke="var(--color-completed)"
                            strokeWidth={1.5}
                        />
                        <Area
                            dataKey="total"
                            type="natural"
                            fill="url(#fillTotal)"
                            fillOpacity={0.5}
                            stroke="var(--color-total)"
                            strokeWidth={1.5}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="pt-0 pb-4">
                <div className="flex w-full items-start gap-2 text-xs">
                    <div className="grid gap-1">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            Trending order 7 hari terakhir{' '}
                            <TrendingUp className="h-3 w-3" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            {data[0]?.date} - {data[data.length - 1]?.date}
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
