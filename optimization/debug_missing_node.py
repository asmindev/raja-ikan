import sys
import os
import logging
from algorithm.optimizer import RouteOptimizer
from algorithm.config import OptimizationConfig

# Setup logging
logging.basicConfig(level=logging.INFO)

# Coordinates from CustomerTestSeeder (La Ode Rahmat)
# 0: Driver
# 1-8: Customers (Note: 1 is same as 0)
coordinates = [
    # Driver
    (-3.970249, 122.5721736),
    # Customer 1 (Duplicate of Driver)
    (-3.970249, 122.5721736),
    # Other Customers
    (-3.9632465, 122.5496578),
    (-3.9604325, 122.5405964),
    (-3.9617819, 122.5385778),
    (-3.9657975, 122.5334315),
    (-3.9649415, 122.5288105),
    # New ones
    (-3.965983499721565, 122.53742530330005),
    (-3.961680824799172, 122.53287421295018)
]

print(f"Total coordinates: {len(coordinates)}")

optimizer = RouteOptimizer(OptimizationConfig())

try:
    result = optimizer.optimize_from_coordinates(coordinates, verbose=True)
    print("\n--- Result ---")
    print(f"Route Indices: {result.route_indices}")
    print(f"Length of route: {len(result.route_indices)}")

    missing = set(range(len(coordinates))) - set(result.route_indices)
    if missing:
        print(f"MISSING INDICIES: {missing}")
    else:
        print("All indices present.")

except Exception as e:
    print(f"Error: {e}")
