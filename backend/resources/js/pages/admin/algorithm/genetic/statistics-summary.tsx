import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticsSummaryProps {
    initialFitness: number;
    finalFitness: number;
    finalDiversity: number;
}

export default function StatisticsSummary({
    initialFitness,
    finalFitness,
    finalDiversity,
}: StatisticsSummaryProps) {
    const improvement =
        ((initialFitness - finalFitness) / initialFitness) * 100;

    return (
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
                            {initialFitness.toFixed(2)} m
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Fitness Akhir
                        </p>
                        <p className="text-xl font-bold text-green-600">
                            {finalFitness.toFixed(2)} m
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Improvement
                        </p>
                        <p className="text-xl font-bold text-green-600">
                            {improvement.toFixed(2)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Diversity Akhir
                        </p>
                        <p className="text-xl font-bold">
                            {(finalDiversity * 100).toFixed(1)}%
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
