"""
Genetic Algorithm Optimizer untuk Route Optimization
Menggabungkan GA logic dan Route Optimizer
"""

import random
import numpy as np
from typing import List, Tuple, Optional, Dict
from dataclasses import dataclass
from deap import base, creator, tools
from .config import OptimizationConfig, GAConfig
from .utils import GraphLoader
from utils.logger import logger


@dataclass
class GAResult:
    """Result from genetic algorithm optimization."""

    route: List[int]
    distance: float
    generation: int
    population_stats: Optional[Dict] = None


@dataclass
class OptimizationResult:
    """Result from route optimization."""

    route_indices: List[int]
    route_coordinates: List[Tuple[float, float]]
    total_distance: float
    estimated_time_minutes: Optional[float] = None
    paths_dict: Optional[Dict] = None


class GeneticAlgorithm:
    """Genetic Algorithm optimizer for TSP."""

    def __init__(self, config: Optional[GAConfig] = None):
        self.config = config or GAConfig()
        self.dist_matrix: Optional[np.ndarray] = None
        self.n_points: Optional[int] = None
        self._creator_initialized = False

    def initialize_creator(self):
        """Initialize DEAP creator types."""
        if self._creator_initialized:
            return

        if "FitnessMin" in creator.__dict__:
            del creator.__dict__["FitnessMin"]
        if "Individual" in creator.__dict__:
            del creator.__dict__["Individual"]

        creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
        creator.create("Individual", list, fitness=creator.FitnessMin)
        self._creator_initialized = True

    def set_distance_matrix(self, dist_matrix: np.ndarray):
        """Set distance matrix for optimization."""
        self.dist_matrix = dist_matrix
        self.n_points = dist_matrix.shape[0]

    def evaluate(self, individual: List[int]) -> Tuple[float]:
        """Evaluate TSP route fitness."""
        if self.dist_matrix is None:
            raise ValueError("Distance matrix not set")

        total = sum(
            self.dist_matrix[individual[i], individual[i + 1]]
            for i in range(self.n_points - 1)
        )
        total += self.dist_matrix[individual[-1], individual[0]]
        return (total,)

    def optimize(
        self,
        dist_matrix: np.ndarray,
        pop_size: Optional[int] = None,
        generations: Optional[int] = None,
        mutation_rate: Optional[float] = None,
        crossover_rate: Optional[float] = None,
        verbose: bool = False,
        deterministic: bool = True,
    ) -> GAResult:
        """Run genetic algorithm optimization."""
        pop_size = pop_size or self.config.pop_size
        generations = generations or self.config.generations
        mutation_rate = mutation_rate or self.config.mutation_rate
        crossover_rate = crossover_rate or self.config.crossover_rate

        # Set deterministic seed based on distance matrix
        if deterministic:
            seed = int(np.sum(dist_matrix) * 1000) % 2**32
            random.seed(seed)
            np.random.seed(seed)
            logger.info(f"Using deterministic seed: {seed}")

        logger.info(
            f"Starting GA: pop_size={pop_size}, generations={generations}, "
            f"mutation_rate={mutation_rate:.3f}, crossover_rate={crossover_rate:.3f}"
        )

        self.initialize_creator()

        # Create toolbox
        toolbox = base.Toolbox()
        toolbox.register("indices", random.sample, range(self.n_points), self.n_points)
        toolbox.register(
            "individual", tools.initIterate, creator.Individual, toolbox.indices
        )
        toolbox.register("population", tools.initRepeat, list, toolbox.individual)
        toolbox.register("evaluate", self.evaluate)
        toolbox.register("mate", tools.cxOrdered)
        toolbox.register("mutate", tools.mutShuffleIndexes, indpb=mutation_rate)
        toolbox.register(
            "select", tools.selTournament, tournsize=self.config.tournament_size
        )

        # Initialize population
        pop = toolbox.population(n=pop_size)
        for ind in pop:
            ind.fitness.values = toolbox.evaluate(ind)

        # Hall of Fame
        hof = tools.HallOfFame(self.config.hall_of_fame_size)

        # Run evolution
        for gen in range(generations):
            # Selection
            offspring = toolbox.select(pop, len(pop))
            offspring = list(map(toolbox.clone, offspring))

            # Crossover
            for child1, child2 in zip(offspring[::2], offspring[1::2]):
                if random.random() < crossover_rate:
                    toolbox.mate(child1, child2)
                    del child1.fitness.values
                    del child2.fitness.values

            # Mutation
            for mutant in offspring:
                if random.random() < mutation_rate:
                    toolbox.mutate(mutant)
                    del mutant.fitness.values

            # Evaluate
            invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
            fitnesses = map(toolbox.evaluate, invalid_ind)
            for ind, fit in zip(invalid_ind, fitnesses):
                ind.fitness.values = fit

            pop[:] = offspring
            hof.update(pop)

            if verbose and gen % 10 == 0:
                best_fit = hof[0].fitness.values[0]
                logger.debug(f"Gen {gen}: Best fitness = {best_fit:.2f}")

        best_individual = hof[0]
        best_distance = best_individual.fitness.values[0]

        logger.info(
            f"GA completed: best_distance={best_distance:.2f}m in {generations} generations"
        )

        return GAResult(
            route=list(best_individual),
            distance=best_distance,
            generation=generations,
            population_stats=None,
        )

    def run(self, verbose: bool = False, deterministic: bool = True) -> GAResult:
        """Alias for optimize using pre-set distance matrix."""
        if self.dist_matrix is None:
            raise ValueError("Distance matrix not set. Call set_distance_matrix first.")
        return self.optimize(
            self.dist_matrix, verbose=verbose, deterministic=deterministic
        )


class RouteOptimizer:
    """Main orchestrator for route optimization."""

    def __init__(self, config: Optional[OptimizationConfig] = None):
        self.config = config or OptimizationConfig()
        self.graph_loader = GraphLoader(self.config.map)
        self.ga = GeneticAlgorithm(self.config.ga)
        self.ga.initialize_creator()
        self.average_speed_kmh = 40.0

    def optimize_from_coordinates(
        self,
        coordinates: List[Tuple[float, float]],
        use_optimal_params: bool = False,
        verbose: bool = False,
    ) -> OptimizationResult:
        """Optimize route from coordinates."""
        if len(coordinates) < 1:
            raise ValueError("Need at least 1 coordinate")

        logger.info(f"Optimizing route for {len(coordinates)} coordinates")

        # Handle single coordinate case
        if len(coordinates) == 1:
            logger.info("Single coordinate provided, returning trivial route")
            return OptimizationResult(
                route_indices=[0],
                route_coordinates=coordinates,
                total_distance=0.0,
                estimated_time_minutes=0.0,
                paths_dict=None,
            )

        # Load graph
        self.graph_loader.load_graph()

        # Find nearest nodes
        logger.debug(f"Finding nearest nodes for {len(coordinates)} coordinates")
        nodes = self.graph_loader.get_nearest_nodes(coordinates)

        # Calculate distance matrix
        logger.debug("Calculating distance matrix")
        dist_matrix, paths_dict = self.graph_loader.calculate_distance_matrix(nodes)

        # Run GA
        self.ga.set_distance_matrix(dist_matrix)
        logger.debug("Running genetic algorithm")
        ga_result = self.ga.run(verbose=verbose)

        # Rotate route to start with index 0 (Driver/Start Location)
        route_indices = ga_result.route
        if 0 in route_indices:
            zero_pos = route_indices.index(0)
            route_indices = route_indices[zero_pos:] + route_indices[:zero_pos]
            logger.debug(f"Rotated route to start with 0: {route_indices}")

        # Get optimized coordinates
        optimized_nodes = [nodes[i] for i in route_indices]
        route_coords = self.graph_loader.get_node_coordinates(optimized_nodes)
        route_coords_list = [(lat, lon) for lat, lon in route_coords]

        # Estimate time
        distance_km = ga_result.distance / 1000.0
        estimated_time = (distance_km / self.average_speed_kmh) * 60

        logger.info(
            f"Route optimized: distance={distance_km:.2f}km, "
            f"time={estimated_time:.1f}min, route={route_indices}"
        )

        return OptimizationResult(
            route_indices=route_indices,
            route_coordinates=route_coords_list,
            total_distance=ga_result.distance,
            estimated_time_minutes=estimated_time,
            paths_dict=paths_dict,
        )
