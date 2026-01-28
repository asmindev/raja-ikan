import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface FitnessChartProps {
    generations: number[];
    fitnessScores: number[];
    avgFitness: number[];
    targetDistance?: number;
}

export default function FitnessChart({
    generations,
    fitnessScores,
    avgFitness,
    targetDistance,
}: FitnessChartProps) {
    // Calculate scaling factor between GA Geometric Distance and OSRM Real Distance
    // ensuring the text matches the "Summary" card exactly.
    const lastFitness = fitnessScores[fitnessScores.length - 1];
    const scalingFactor =
        targetDistance && lastFitness > 0 ? targetDistance / lastFitness : 1;

    const chartData = generations.map((gen, idx) => ({
        generation: gen,
        'Best Fitness': Number(
            ((fitnessScores[idx] * scalingFactor) / 1000).toFixed(2),
        ),
        'Avg Fitness': Number(
            ((avgFitness[idx] * scalingFactor) / 1000).toFixed(2),
        ),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <TrendingUp className="h-5 w-5" />
                    Evolusi Fitness Score
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Perubahan fitness score (jarak total) per generasi
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-gray-200 dark:stroke-gray-700"
                        />
                        <XAxis
                            dataKey="generation"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            label={{
                                value: 'Generasi',
                                position: 'insideBottom',
                                offset: -5,
                                fill: '#888888',
                            }}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                            label={{
                                value: 'Fitness (km)',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#888888',
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                                color: 'hsl(var(--foreground))',
                            }}
                            formatter={(value: number) => [`${value} km`]}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="Best Fitness"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="Avg Fitness"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray="5 5"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
