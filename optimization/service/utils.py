"""
Utility functions untuk FastAPI service
"""

import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from algorithm.optimizer import RouteOptimizer
from algorithm.config import OptimizationConfig
from utils.logger import logger

# Global instances
route_optimizer: RouteOptimizer = None
config: OptimizationConfig = None


def startup_event():
    """Initialize services on startup"""
    global route_optimizer, config

    logger.info("=" * 80)
    logger.info("🚀 Starting Route Optimization Service...")
    logger.info("=" * 80)

    # Initialize configuration
    config = OptimizationConfig()
    logger.info("Configuration loaded")

    # Initialize route optimizer
    logger.info("Loading route optimizer with OSM graph...")
    route_optimizer = RouteOptimizer(config)

    # Pre-load graph to cache it
    route_optimizer.graph_loader.load_graph()

    logger.info("✅ Service ready!")
    logger.info("📍 Location: Kendari, Indonesia")
    logger.info("📚 API Docs: http://localhost:8000/docs")
    logger.info("=" * 80)


def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Route Optimization Service...")


def get_route_optimizer() -> RouteOptimizer:
    """Get route optimizer instance"""
    return route_optimizer


def get_config() -> OptimizationConfig:
    """Get config instance"""
    return config
