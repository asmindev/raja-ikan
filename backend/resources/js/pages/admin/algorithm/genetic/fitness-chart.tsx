import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
}

export default function FitnessChart({
    generations,
    fitnessScores,
    avgFitness,
}: FitnessChartProps) {
    const chartData = generations.map((gen, idx) => ({
        generation: gen,
        'Best Fitness': fitnessScores[idx],
        'Avg Fitness': avgFitness[idx],
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>📈 Evolusi Fitness Score</CardTitle>
                <CardDescription>
                    Perubahan fitness score (jarak total) per generasi
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="generation"
                            label={{
                                value: 'Generasi',
                                position: 'insideBottom',
                                offset: -5,
                            }}
                        />
                        <YAxis
                            label={{
                                value: 'Fitness (meter)',
                                angle: -90,
                                position: 'insideLeft',
                            }}
                        />
                        <Tooltip />
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
