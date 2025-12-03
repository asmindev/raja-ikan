from dataclasses import dataclass, field
from typing import List
import os


@dataclass
class MapConfig:
    """Configuration for map and graph settings."""

    location: str = "Kendari, Indonesia"
    network_type: str = "drive"
    cache_dir: str = field(
        default_factory=lambda: os.path.join(os.path.dirname(__file__), "cache")
    )
    graph_cache_file: str = field(init=False)

    def __post_init__(self):
        self.graph_cache_file = os.path.join(self.cache_dir, "kendari_graph.pkl")
        # Create cache directory if not exists
        os.makedirs(self.cache_dir, exist_ok=True)


@dataclass
class GAConfig:
    """Configuration for Genetic Algorithm."""

    # Default/Original GA parameters
    pop_size: int = 50
    generations: int = 50
    mutation_rate: float = 0.2
    crossover_rate: float = 0.7
    elitism_percentage: float = 0.1  # 10% best individuals preserved
    tournament_size: int = 3
    hall_of_fame_size: int = 1

    # Search spaces for hyperparameter tuning
    pop_size_space: List[int] = field(default_factory=lambda: [50, 100, 150, 200])
    generations_space: List[int] = field(
        default_factory=lambda: [50, 100, 150, 200, 250]
    )
    mutation_rate_space: List[float] = field(
        default_factory=lambda: [
            0.01,
            0.06,
            0.12,
            0.17,
            0.23,
            0.28,
            0.34,
            0.39,
            0.45,
            0.50,
        ]
    )
    crossover_rate_space: List[float] = field(
        default_factory=lambda: [
            0.50,
            0.55,
            0.60,
            0.65,
            0.70,
            0.75,
            0.80,
            0.85,
            0.90,
            0.95,
        ]
    )

    # New search spaces for prediction (more granular)
    new_pop_size_space: List[int] = field(
        default_factory=lambda: [50, 100, 150, 200, 250]
    )
    new_generations_space: List[int] = field(
        default_factory=lambda: [50, 100, 150, 200, 250, 300]
    )
    new_mutation_rate_space: List[float] = field(
        default_factory=lambda: [
            0.01,
            0.035,
            0.06,
            0.085,
            0.11,
            0.135,
            0.16,
            0.185,
            0.21,
            0.235,
            0.26,
            0.285,
            0.31,
            0.335,
            0.36,
            0.385,
            0.41,
            0.435,
            0.46,
            0.50,
        ]
    )
    new_crossover_rate_space: List[float] = field(
        default_factory=lambda: [
            0.50,
            0.524,
            0.547,
            0.571,
            0.595,
            0.618,
            0.642,
            0.666,
            0.689,
            0.713,
            0.737,
            0.761,
            0.784,
            0.808,
            0.832,
            0.855,
            0.879,
            0.903,
            0.926,
            0.95,
        ]
    )


@dataclass
class XGBoostConfig:
    """Configuration for XGBoost training."""

    objective: str = "reg:squarederror"
    n_estimators: int = 100
    random_state: int = 42
    test_size: float = 0.2
    training_n_nodes: int = 10  # Number of nodes for training sample
    model_cache_file: str = field(
        default_factory=lambda: os.path.join(
            os.path.dirname(__file__), "cache", "xgb_model.pkl"
        )
    )


@dataclass
class OptimizationConfig:
    """Main configuration class that combines all configs."""

    map: MapConfig = field(default_factory=MapConfig)
    ga: GAConfig = field(default_factory=GAConfig)
    xgboost: XGBoostConfig = field(default_factory=XGBoostConfig)
    random_state: int = 42

    @classmethod
    def from_optimal_params(cls, optimal_params: dict):
        """Create config with optimal GA parameters from XGBoost."""
        config = cls()
        config.ga.pop_size = int(optimal_params.get("pop_size", config.ga.pop_size))
        config.ga.generations = int(
            optimal_params.get("generations", config.ga.generations)
        )
        config.ga.mutation_rate = float(
            optimal_params.get("indpb", config.ga.mutation_rate)
        )
        config.ga.crossover_rate = float(
            optimal_params.get("crossover_prob", config.ga.crossover_rate)
        )
        return config


# Default configuration instance
default_config = OptimizationConfig()
