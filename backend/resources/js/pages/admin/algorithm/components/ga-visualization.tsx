import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import type { Coordinate, OptimizationDetail } from '@/types/optimization';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
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

interface GAVisualizationProps {
    data: OptimizationDetail;
    coordinates: Coordinate[];
    optimizedOrder: number[];
}

export default function GAVisualization({
    data,
    coordinates,
    optimizedOrder,
}: GAVisualizationProps) {
    const [animationGen, setAnimationGen] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Auto-play animation
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setAnimationGen((prev) => {
                if (prev >= data.ga_history.generations.length - 1) {
                    setIsPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 200); // 200ms per generation

        return () => clearInterval(interval);
    }, [isPlaying, data.ga_history.generations.length]);

    // Prepare chart data
    const fitnessChartData = data.ga_history.generations.map((gen, idx) => ({
        generation: gen,
        'Best Fitness': data.ga_history.fitness_scores[idx],
        'Avg Fitness': data.ga_history.avg_fitness[idx],
    }));

    const diversityChartData = data.ga_history.generations.map((gen, idx) => ({
        generation: gen,
        diversity: (data.ga_history.diversity[idx] * 100).toFixed(1),
    }));

    // Get current route for animation
    const currentRoute =
        data.ga_history.best_routes[animationGen] || optimizedOrder;
    const currentRouteCoords = currentRoute.map((idx) => coordinates[idx]);

    return (
        <div className="space-y-6">
            {/* Fitness Evolution Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>📈 Evolusi Fitness Score</CardTitle>
                    <CardDescription>
                        Perubahan fitness score (jarak total) per generasi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={fitnessChartData}>
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

            {/* Population Diversity Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>🧬 Keragaman Populasi</CardTitle>
                    <CardDescription>
                        Persentase rute unik dalam populasi per generasi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={diversityChartData}>
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

            {/* Route Animation */}
            <Card>
                <CardHeader>
                    <CardTitle>🎬 Animasi Evolusi Rute</CardTitle>
                    <CardDescription>
                        Visualisasi perubahan rute terbaik dari generasi ke
                        generasi
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setIsPlaying(!isPlaying)}
                            variant="outline"
                            size="sm"
                            className="w-24"
                        >
                            {isPlaying ? (
                                <>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Play
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => {
                                setAnimationGen(0);
                                setIsPlaying(false);
                            }}
                            variant="outline"
                            size="sm"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                        <div className="flex-1">
                            <Slider
                                value={[animationGen]}
                                onValueChange={(value) =>
                                    setAnimationGen(value[0])
                                }
                                max={data.ga_history.generations.length - 1}
                                step={1}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">
                                Generasi: {animationGen} /{' '}
                                {data.ga_history.generations.length - 1}
                            </span>
                            <span className="text-sm font-medium">
                                Fitness:{' '}
                                {data.ga_history.fitness_scores[
                                    animationGen
                                ]?.toFixed(2)}{' '}
                                m
                            </span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Urutan Rute:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {currentRoute.map((idx, position) => (
                                    <div
                                        key={position}
                                        className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
                                    >
                                        {idx}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Simple route visualization */}
                    <div className="rounded-lg border p-4">
                        <p className="mb-2 text-sm font-medium">
                            Visualisasi Rute:
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {currentRouteCoords.map((coord, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                            {currentRoute[idx]}
                                        </div>
                                        <span className="mt-1 text-xs text-muted-foreground">
                                            ({coord.lat.toFixed(4)},{' '}
                                            {coord.lng.toFixed(4)})
                                        </span>
                                    </div>
                                    {idx < currentRouteCoords.length - 1 && (
                                        <div className="h-0.5 w-8 bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Parameters */}
            <Card>
                <CardHeader>
                    <CardTitle>⚙️ Parameter Algoritma Genetika</CardTitle>
                    <CardDescription>
                        Konfigurasi yang digunakan dalam optimasi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                            <dt className="text-sm font-medium text-muted-foreground">
                                Population Size
                            </dt>
                            <dd className="mt-1 text-2xl font-bold">
                                {data.parameters.pop_size}
                            </dd>
                        </div>
                        <div className="rounded-lg border p-4">
                            <dt className="text-sm font-medium text-muted-foreground">
                                Total Generasi
                            </dt>
                            <dd className="mt-1 text-2xl font-bold">
                                {data.parameters.generations}
                            </dd>
                        </div>
                        <div className="rounded-lg border p-4">
                            <dt className="text-sm font-medium text-muted-foreground">
                                Mutation Rate
                            </dt>
                            <dd className="mt-1 text-2xl font-bold">
                                {(data.parameters.mutation_rate * 100).toFixed(
                                    1,
                                )}
                                %
                            </dd>
                        </div>
                        <div className="rounded-lg border p-4">
                            <dt className="text-sm font-medium text-muted-foreground">
                                Crossover Rate
                            </dt>
                            <dd className="mt-1 text-2xl font-bold">
                                {(data.parameters.crossover_rate * 100).toFixed(
                                    1,
                                )}
                                %
                            </dd>
                        </div>
                        <div className="rounded-lg border p-4">
                            <dt className="text-sm font-medium text-muted-foreground">
                                Tournament Size
                            </dt>
                            <dd className="mt-1 text-2xl font-bold">
                                {data.parameters.tournament_size}
                            </dd>
                        </div>
                        <div className="rounded-lg border bg-primary/10 p-4">
                            <dt className="text-sm font-medium text-muted-foreground">
                                Waktu Eksekusi GA
                            </dt>
                            <dd className="mt-1 text-2xl font-bold text-primary">
                                {data.timing.ga_execution.toFixed(3)}s
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            {/* Statistics Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>📊 Ringkasan Statistik</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Fitness Awal
                            </p>
                            <p className="text-xl font-bold">
                                {data.ga_history.fitness_scores[0]?.toFixed(2)}{' '}
                                m
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Fitness Akhir
                            </p>
                            <p className="text-xl font-bold text-green-600">
                                {data.ga_history.fitness_scores[
                                    data.ga_history.fitness_scores.length - 1
                                ]?.toFixed(2)}{' '}
                                m
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Improvement
                            </p>
                            <p className="text-xl font-bold text-green-600">
                                {(
                                    ((data.ga_history.fitness_scores[0] -
                                        data.ga_history.fitness_scores[
                                            data.ga_history.fitness_scores
                                                .length - 1
                                        ]) /
                                        data.ga_history.fitness_scores[0]) *
                                    100
                                ).toFixed(2)}
                                %
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Diversity Akhir
                            </p>
                            <p className="text-xl font-bold">
                                {(
                                    data.ga_history.diversity[
                                        data.ga_history.diversity.length - 1
                                    ] * 100
                                ).toFixed(1)}
                                %
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
