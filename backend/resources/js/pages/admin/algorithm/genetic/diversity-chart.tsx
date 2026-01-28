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

interface DiversityChartProps {
    generations: number[];
    diversity: number[];
}

export default function DiversityChart({
    generations,
    diversity,
}: DiversityChartProps) {
    const chartData = generations.map((gen, idx) => ({
        generation: gen,
        diversity: (diversity[idx] * 100).toFixed(1),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>🧬 Keragaman Populasi</CardTitle>
                <CardDescription>
                    Persentase rute unik dalam populasi per generasi
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
                                value: 'Diversity (%)',
                                angle: -90,
                                position: 'insideLeft',
                            }}
                        />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="diversity"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
