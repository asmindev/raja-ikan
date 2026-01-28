import type { Coordinate, OptimizationDetail } from '@/types/optimization';
import FitnessChart from './fitness-chart';

interface GAVisualizationProps {
    data: OptimizationDetail;
    coordinates: Coordinate[];
    targetDistance?: number; // Target OSRM distance in meters
}

export default function GAVisualization({
    data,
    coordinates,
    targetDistance,
}: GAVisualizationProps) {
    const { ga_history, parameters, timing } = data;

    return (
        <div className="space-y-6">
            {/* Fitness Evolution Chart */}
            <FitnessChart
                generations={ga_history.generations}
                fitnessScores={ga_history.fitness_scores}
                avgFitness={ga_history.avg_fitness}
                targetDistance={targetDistance}
            />

            {/* Population Diversity Chart */}
            {/* <DiversityChart
                generations={ga_history.generations}
                diversity={ga_history.diversity}
            /> */}

            {/* Route Animation */}
            {/* <RouteAnimation
                generations={ga_history.generations}
                fitnessScores={ga_history.fitness_scores}
                bestRoutes={ga_history.best_routes}
                coordinates={coordinates}
            /> */}

            {/* Algorithm Parameters */}
            {/* <AlgorithmParameters parameters={parameters} timing={timing} /> */}

            {/* Statistics Summary */}
            {/* <StatisticsSummary
                initialFitness={ga_history.fitness_scores[0]}
                finalFitness={
                    ga_history.fitness_scores[
                        ga_history.fitness_scores.length - 1
                    ]
                }
                finalDiversity={
                    ga_history.diversity[ga_history.diversity.length - 1]
                }
            /> */}
        </div>
    );
}
