"""
Utility functions untuk algorithm package
Termasuk GraphLoader dan helper functions
"""

import osmnx as ox
import networkx as nx
import numpy as np
import pickle
from typing import Optional, Tuple, List, Dict, TYPE_CHECKING
from .config import MapConfig, OptimizationConfig
from utils.logger import logger

if TYPE_CHECKING:
    from .optimizer import RouteOptimizer

# Global instances
_route_optimizer: Optional["RouteOptimizer"] = None


class GraphLoader:
    """
    Singleton class untuk loading dan caching OSM graph.
    """

    _instance = None
    _graph = None

    def __new__(cls, config: Optional[MapConfig] = None):
        if cls._instance is None:
            cls._instance = super(GraphLoader, cls).__new__(cls)
        return cls._instance

    def __init__(self, config: Optional[MapConfig] = None):
        if not hasattr(self, "initialized"):
            self.config = config or MapConfig()
            self.initialized = True

    def load_graph(self, force_download: bool = False) -> nx.MultiDiGraph:
        """Load graph from cache or download from OSM."""
        if self._graph is not None and not force_download:
            logger.debug("Using cached graph from memory")
            return self._graph

        # Try cache file
        if not force_download and self._load_from_cache():
            logger.info(f"Loaded graph from cache: {self.config.graph_cache_file}")
            return self._graph

        # Download from OSM
        logger.info(f"Downloading graph for {self.config.location}...")
        self._graph = ox.graph_from_place(
            self.config.location, network_type=self.config.network_type
        )

        # Save to cache
        self._save_to_cache()
        logger.info(f"Graph cached to: {self.config.graph_cache_file}")

        return self._graph

    def _load_from_cache(self) -> bool:
        """Load graph dari pickle file."""
        try:
            with open(self.config.graph_cache_file, "rb") as f:
                self._graph = pickle.load(f)
            return True
        except (FileNotFoundError, Exception) as e:
            logger.warning(f"Could not load cache: {e}")
            return False

    def _save_to_cache(self):
        """Save graph ke pickle file."""
        try:
            with open(self.config.graph_cache_file, "wb") as f:
                pickle.dump(self._graph, f)
        except Exception as e:
            logger.warning(f"Could not save cache: {e}")

    def get_nearest_nodes(self, coordinates: List[Tuple[float, float]]) -> List[int]:
        """Find nearest graph nodes untuk coordinates."""
        if self._graph is None:
            self.load_graph()

        nodes = []
        for lat, lon in coordinates:
            node = ox.nearest_nodes(self._graph, lon, lat)
            nodes.append(node)

        return nodes

    def calculate_distance_matrix(
        self, nodes: List[int]
    ) -> Tuple[np.ndarray, Dict[Tuple[int, int], List[Tuple[float, float]]]]:
        """Calculate distance matrix dan paths antar nodes."""
        if self._graph is None:
            self.load_graph()

        n_points = len(nodes)
        dist_matrix = np.zeros((n_points, n_points))
        paths_dict = {}

        for i in range(n_points):
            for j in range(n_points):
                if i != j:
                    try:
                        path = nx.shortest_path(
                            self._graph, nodes[i], nodes[j], weight="length"
                        )
                        dist_matrix[i][j] = nx.shortest_path_length(
                            self._graph, nodes[i], nodes[j], weight="length"
                        )
                        paths_dict[(i, j)] = [
                            (self._graph.nodes[n]["y"], self._graph.nodes[n]["x"])
                            for n in path
                        ]
                    except nx.NetworkXNoPath:
                        dist_matrix[i][j] = float("inf")
                        paths_dict[(i, j)] = []

        return dist_matrix, paths_dict

    def get_node_coordinates(self, nodes: List[int]) -> np.ndarray:
        """Get (lat, lon) coordinates untuk nodes."""
        if self._graph is None:
            self.load_graph()

        return np.array(
            [[self._graph.nodes[n]["y"], self._graph.nodes[n]["x"]] for n in nodes]
        )

    @property
    def graph(self) -> Optional[nx.MultiDiGraph]:
        """Get loaded graph."""
        return self._graph

    @property
    def num_nodes(self) -> int:
        """Get total nodes dalam graph."""
        if self._graph is None:
            self.load_graph()
        return len(self._graph.nodes)


def initialize_algorithm(config: Optional[OptimizationConfig] = None):
    """Initialize algorithm dengan config."""
    from .optimizer import RouteOptimizer

    global _route_optimizer

    logger.info("Initializing route optimizer...")
    config = config or OptimizationConfig()
    _route_optimizer = RouteOptimizer(config)
    _route_optimizer.graph_loader.load_graph()
    logger.info("Route optimizer initialized successfully")

    return _route_optimizer


def get_route_optimizer() -> Optional["RouteOptimizer"]:
    """Get global route optimizer instance."""
    return _route_optimizer
