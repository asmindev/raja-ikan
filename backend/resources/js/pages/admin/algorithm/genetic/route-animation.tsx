import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import type { Coordinate } from '@/types/optimization';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RouteAnimationProps {
    generations: number[];
    fitnessScores: number[];
    bestRoutes: number[][];
    coordinates: Coordinate[];
}

export default function RouteAnimation({
    generations,
    fitnessScores,
    bestRoutes,
    coordinates,
}: RouteAnimationProps) {
    const [animationGen, setAnimationGen] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Auto-play animation
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setAnimationGen((prev) => {
                if (prev >= generations.length - 1) {
                    setIsPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 200); // 200ms per generation

        return () => clearInterval(interval);
    }, [isPlaying, generations.length]);

    const currentRoute =
        bestRoutes[animationGen] || bestRoutes[bestRoutes.length - 1];
    const currentRouteCoords = currentRoute.map((idx) => coordinates[idx]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>🎬 Animasi Evolusi Rute</CardTitle>
                <CardDescription>
                    Visualisasi perubahan rute terbaik dari generasi ke generasi
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
                            onValueChange={(value) => setAnimationGen(value[0])}
                            max={generations.length - 1}
                            step={1}
                            className="flex-1"
                        />
                    </div>
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                            Generasi: {animationGen} / {generations.length - 1}
                        </span>
                        <span className="text-sm font-medium">
                            Fitness: {fitnessScores[animationGen]?.toFixed(2)} m
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
                            <div key={idx} className="flex items-center gap-2">
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
    );
}
