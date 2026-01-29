"""
XGBoost Trainer untuk Hyperparameter Tuning GA
"""

import itertools
import pickle
import random
from concurrent.futures import ProcessPoolExecutor, as_completed
from functools import partial
from typing import Dict, List, Optional, Callable

import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

from .config import OptimizationConfig, XGBoostConfig, GAConfig
from utils.logger import logger


# Worker function defined at module level for pickling
def _worker_run_ga(pop_size, generations, mutation_rate, crossover_rate, config, dist_matrix):
    """Worker function to run GA."""
    try:
        from .optimizer import GeneticAlgorithm
        ga = GeneticAlgorithm(config.ga)
        ga.config.pop_size = pop_size
        ga.config.generations = generations
        ga.config.mutation_rate = mutation_rate
        ga.config.crossover_rate = crossover_rate

        # Set the pre-calculated distance matrix
        ga.set_distance_matrix(dist_matrix)

        # Disable deterministic mode to allow true parameter evaluation
        result = ga.run(verbose=False, deterministic=False)
        return result.distance
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise e


class XGBoostTrainer:
    """XGBoost trainer untuk hyperparameter tuning Genetic Algorithm."""

    def __init__(self, config: Optional[OptimizationConfig] = None):
        """Initialize XGBoostTrainer."""
        self.config = config or OptimizationConfig()
        self.model: Optional[xgb.XGBRegressor] = None
        self.training_data: Optional[pd.DataFrame] = None
        self.feature_importance: Optional[pd.DataFrame] = None

    def perform_hyperparameter_search(
        self, run_ga_func: Callable, param_grid: Optional[Dict[str, List]] = None
    ) -> pd.DataFrame:
        """
        Perform Randomized Search over GA hyperparameters with Parallel Processing.
        """
        if param_grid is None:
            param_grid = {
                "pop_size": self.config.ga.pop_size_space,
                "generations": self.config.ga.generations_space,
                "mutation_rate": self.config.ga.mutation_rate_space,
                "crossover_rate": self.config.ga.crossover_rate_space,
            }

        # Generate ALL possible combinations
        all_combinations = list(
            itertools.product(
                param_grid["pop_size"],
                param_grid["generations"],
                param_grid["mutation_rate"],
                param_grid["crossover_rate"],
            )
        )

        # RANDOMIZED SEARCH: Sample only max_evals
        max_evals = getattr(self.config.xgboost, "max_evals", 100)
        if len(all_combinations) > max_evals:
            search_combinations = random.sample(all_combinations, max_evals)
            logger.info(
                f"Randomized Search applied: Selecting {max_evals} random samples "
                f"from {len(all_combinations)} total combinations"
            )
        else:
            search_combinations = all_combinations
            logger.info(
                f"Grid Search: Checking all {len(all_combinations)} combinations"
            )

        n_jobs = getattr(self.config.xgboost, "n_jobs", -1)
        # If n_jobs is -1 or None, use all CPUs.
        max_workers = None if (n_jobs is None or n_jobs == -1) else n_jobs

        logger.info(f"Starting parallel execution with workers={max_workers}...")

        results = []

        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks directly using run_ga_func
            future_to_params = {
                executor.submit(run_ga_func, *params): params
                for params in search_combinations
            }

            # Process results as they complete
            completed_count = 0
            for future in as_completed(future_to_params):
                try:
                    # result is just the fitness/distance (float)
                    fitness = future.result()

                    # Get params to reconstruct the dictionary
                    params = future_to_params[future]
                    pop, gens, mut, cross = params

                    results.append({
                        "pop_size": pop,
                        "generations": gens,
                        "mutation_rate": mut,
                        "crossover_rate": cross,
                        "best_fit": fitness,
                    })
                    completed_count += 1

                    if completed_count % 10 == 0:
                        logger.debug(f"Progress: {completed_count}/{len(search_combinations)} completed")

                except Exception as e:
                    logger.error(f"Task failed: {e}")

        self.training_data = pd.DataFrame(results)
        logger.info(
            f"Hyperparameter search completed: {len(self.training_data)} samples collected"
        )
        return self.training_data

    def train_model(self, training_data: Optional[pd.DataFrame] = None) -> Dict:
        """Train XGBoost model on hyperparameter search results."""
        if training_data is None:
            if self.training_data is None:
                raise ValueError(
                    "No training data. Run perform_hyperparameter_search first."
                )
            training_data = self.training_data

        if training_data.empty:
            raise ValueError("Training data is empty. Hyperparameter search failed to collect results.")

        feature_cols = ["pop_size", "generations", "mutation_rate", "crossover_rate"]
        X = training_data[feature_cols]
        y = training_data["best_fit"]

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=self.config.xgboost.test_size,
            random_state=self.config.random_state,
        )

        logger.info("Training XGBoost model...")
        self.model = xgb.XGBRegressor(
            objective=self.config.xgboost.objective,
            n_estimators=self.config.xgboost.n_estimators,
            random_state=self.config.xgboost.random_state,
        )

        self.model.fit(X_train, y_train)
        logger.info("XGBoost model trained successfully")

        return self.evaluate_model(X_train, X_test, y_test)

    def evaluate_model(
        self, X_train: pd.DataFrame, X_test: pd.DataFrame, y_test: pd.Series
    ) -> Dict:
        """Evaluate XGBoost model and calculate metrics."""
        if self.model is None:
            raise ValueError("Model not trained. Call train_model first.")

        y_pred = self.model.predict(X_test)
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)

        logger.info(f"Model Evaluation: R²={r2:.4f}, MAE={mae:.4f}")

        feature_importances = self.model.feature_importances_
        self.feature_importance = pd.DataFrame(
            {"Feature": X_train.columns, "Importance": feature_importances}
        ).sort_values(by="Importance", ascending=False)

        logger.debug(f"Feature Importances:\n{self.feature_importance}")

        return {
            "r2_score": r2,
            "mae": mae,
            "feature_importance": self.feature_importance,
        }

    def predict_optimal_hyperparameters(
        self, param_grid: Optional[Dict[str, List]] = None
    ) -> pd.Series:
        """Use trained model to predict optimal GA hyperparameters."""
        if self.model is None:
            raise ValueError("Model not trained. Call train_model first.")

        if param_grid is None:
            param_grid = {
                "pop_size": self.config.ga.new_pop_size_space,
                "generations": self.config.ga.new_generations_space,
                "mutation_rate": self.config.ga.new_mutation_rate_space,
                "crossover_rate": self.config.ga.new_crossover_rate_space,
            }

        new_combinations = list(
            itertools.product(
                param_grid["pop_size"],
                param_grid["generations"],
                param_grid["mutation_rate"],
                param_grid["crossover_rate"],
            )
        )

        new_X = pd.DataFrame(
            new_combinations,
            columns=["pop_size", "generations", "mutation_rate", "crossover_rate"],
        )

        predicted_fit = self.model.predict(new_X)
        new_X["predicted_best_fit"] = predicted_fit

        optimal_row = new_X.loc[new_X["predicted_best_fit"].idxmin()]

        logger.info(
            f"Optimal hyperparameters found: PopSize={int(optimal_row['pop_size'])}, "
            f"Gens={int(optimal_row['generations'])}, MutRate={optimal_row['mutation_rate']:.3f}, "
            f"CrossRate={optimal_row['crossover_rate']:.3f}, PredictedFit={optimal_row['predicted_best_fit']:.4f}"
        )

        return optimal_row

    def save_model(self, filepath: Optional[str] = None):
        """Save trained model to file."""
        if self.model is None:
            raise ValueError("No model to save. Train model first.")

        filepath = filepath or self.config.xgboost.model_cache_file

        with open(filepath, "wb") as f:
            pickle.dump(self.model, f)

        logger.info(f"Model saved to: {filepath}")

    def load_model(self, filepath: Optional[str] = None):
        """Load trained model from file."""
        filepath = filepath or self.config.xgboost.model_cache_file

        try:
            with open(filepath, "rb") as f:
                self.model = pickle.load(f)
            logger.info(f"Model loaded from: {filepath}")
        except FileNotFoundError:
            raise FileNotFoundError(f"Model file not found: {filepath}")

    def get_optimal_config(self, optimal_params: pd.Series) -> GAConfig:
        """Create GAConfig with optimal parameters."""
        config = GAConfig()
        config.pop_size = int(optimal_params["pop_size"])
        config.generations = int(optimal_params["generations"])
        config.mutation_rate = float(optimal_params["mutation_rate"])
        config.crossover_rate = float(optimal_params["crossover_rate"])
        return config


if __name__ == "__main__":
    """
    Manual training script untuk XGBoost model.
    """
    import sys
    from .utils import GraphLoader, initialize_algorithm

    # GeneticAlgorithm is imported locally inside _worker_run_ga for workers,
    # but we need it here if we were using it directly, but we use _worker_run_ga via partial.
    # Actually, we don't strictly need it in main scope unless used.
    # But let's import it to be safe if any other part uses it.
    # However, to avoid circular import at top level, we import inside main if possible.
    # But wait, utils.initialize_algorithm might use it.
    # Let's keep imports clean.

    logger.info("=" * 60)
    logger.info("XGBoost Training Script Started")
    logger.info("=" * 60)
    logger.warning("This process may take 30 minutes - 2 HOURS to complete!")

    # Initialize
    config = OptimizationConfig()
    graph_loader = GraphLoader(config.map)
    graph_loader.load_graph()

    logger.info(
        f"Training configuration: {config.xgboost.training_n_nodes} nodes sample"
    )
    logger.info("Setting up Genetic Algorithm for hyperparameter search...")

    # Create fixed sample nodes for consistent comparison across hyperparameters
    # This ensures that all parameter combinations are tested on the SAME problem instance.
    n_nodes = config.xgboost.training_n_nodes
    all_nodes = list(graph_loader.graph.nodes)

    if len(all_nodes) < n_nodes:
        logger.warning(f"Graph only has {len(all_nodes)} nodes, using all of them.")
        training_sample_nodes = all_nodes
    else:
        # Use random sample of nodes to ensure diversity
        # Generated ONCE so all params are tested on SAME problem
        import random
        training_sample_nodes = random.sample(all_nodes, n_nodes)

    logger.info(f"Generated fixed problem instance with {len(training_sample_nodes)} nodes for fair comparison")

    # Calculate distance matrix ONCE
    training_dist_matrix, _ = graph_loader.calculate_distance_matrix(training_sample_nodes)

    # Use partial to bind config and matrix to the worker function
    # This makes 'run_ga_partial' picklable because it's a top-level function wrapped in partial
    # And _worker_run_ga is defined at module level
    run_ga_partial = partial(
        _worker_run_ga,
        config=config,
        dist_matrix=training_dist_matrix
    )

    # Train XGBoost
    logger.info("Starting hyperparameter search...")
    trainer = XGBoostTrainer(config)

    try:
        training_data = trainer.perform_hyperparameter_search(run_ga_partial)
        logger.info(f"Training data collected: {len(training_data)} samples")

        logger.info("Training XGBoost model...")
        metrics = trainer.train_model(training_data)
        logger.info(
            f"Model trained: R²={metrics['r2_score']:.4f}, MAE={metrics['mae']:.4f}"
        )

        logger.info("Saving model...")
        trainer.save_model()

        logger.info("=" * 60)
        logger.info("✓ XGBoost Training Completed Successfully!")
        logger.info(f"Model saved to: {config.xgboost.model_cache_file}")
        logger.info("=" * 60)

    except KeyboardInterrupt:
        logger.warning("\nTraining interrupted by user!")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Training failed: {e}", exc_info=True)
        sys.exit(1)
