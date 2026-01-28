import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type {
    OptimizationParameters,
    OptimizationTiming,
} from '@/types/optimization';

interface AlgorithmParametersProps {
    parameters: OptimizationParameters;
    timing: OptimizationTiming;
}

export default function AlgorithmParameters({
    parameters,
    timing,
}: AlgorithmParametersProps) {
    return (
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
                            {parameters.pop_size}
                        </dd>
                    </div>
                    <div className="rounded-lg border p-4">
                        <dt className="text-sm font-medium text-muted-foreground">
                            Total Generasi
                        </dt>
                        <dd className="mt-1 text-2xl font-bold">
                            {parameters.generations}
                        </dd>
                    </div>
                    <div className="rounded-lg border p-4">
                        <dt className="text-sm font-medium text-muted-foreground">
                            Mutation Rate
                        </dt>
                        <dd className="mt-1 text-2xl font-bold">
                            {(parameters.mutation_rate * 100).toFixed(1)}%
                        </dd>
                    </div>
                    <div className="rounded-lg border p-4">
                        <dt className="text-sm font-medium text-muted-foreground">
                            Crossover Rate
                        </dt>
                        <dd className="mt-1 text-2xl font-bold">
                            {(parameters.crossover_rate * 100).toFixed(1)}%
                        </dd>
                    </div>
                    <div className="rounded-lg border p-4">
                        <dt className="text-sm font-medium text-muted-foreground">
                            Tournament Size
                        </dt>
                        <dd className="mt-1 text-2xl font-bold">
                            {parameters.tournament_size}
                        </dd>
                    </div>
                    <div className="rounded-lg border bg-primary/10 p-4">
                        <dt className="text-sm font-medium text-muted-foreground">
                            Waktu Eksekusi GA
                        </dt>
                        <dd className="mt-1 text-2xl font-bold text-primary">
                            {timing.ga_execution.toFixed(3)}s
                        </dd>
                    </div>
                </dl>
            </CardContent>
        </Card>
    );
}
