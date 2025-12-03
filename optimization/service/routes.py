from typing import Union
from fastapi import APIRouter, HTTPException
import time
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from service.schemas import OptimizeRequest, OptimizeResponse, OptimizedWaypoint
from service.utils import get_route_optimizer
from utils.logger import logger

router = APIRouter(prefix="/api/v1")


@router.get("/health")
def health_check():
    """Check service health"""
    optimizer = get_route_optimizer()
    return {
        "status": "healthy",
        "graph_loaded": optimizer is not None
        and optimizer.graph_loader.graph is not None,
    }


@router.post("/optimize", response_model=OptimizeResponse)
def optimize_route(request: OptimizeRequest):
    """
    Optimize delivery route order using Genetic Algorithm.

    Returns optimized waypoint order + OSRM URL for detailed routing.
    Frontend should call OSRM with the optimized order for turn-by-turn navigation.
    """
    try:
        start_time = time.time()

        logger.info(
            f"Received optimization request for {len(request.coordinates)} coordinates"
        )
        logger.info(f"Coordinates: {request.coordinates}")

        # Get optimizer
        optimizer = get_route_optimizer()
        if optimizer is None:
            logger.error("Service not ready - optimizer is None")
            raise HTTPException(status_code=503, detail="Service not ready")

        # Convert coordinates
        coordinates = [
            (coord.latitude, coord.longitude) for coord in request.coordinates
        ]

        # Optimize
        result = optimizer.optimize_from_coordinates(
            coordinates=coordinates,
            use_optimal_params=request.use_cached_params,
            verbose=True,
        )

        # FORCE route to start from index 0 (driver location)
        # Rotate route if needed so index 0 is always first
        optimized_route = result.route_indices
        if len(optimized_route) > 1 and optimized_route[0] != 0:
            # Find position of index 0
            start_pos = optimized_route.index(0)
            # Rotate list so index 0 is first
            optimized_route = optimized_route[start_pos:] + optimized_route[:start_pos]
            logger.info(
                f"Route rotated to start from driver (index 0): {optimized_route}"
            )

        # Build optimized waypoints list in OPTIMIZED ORDER
        # waypoint_index: position in optimized route (0, 1, 2, 3...)
        # trips_idx: original input coordinate index
        waypoints = []
        for waypoint_index, original_coord_idx in enumerate(optimized_route):
            # Get coordinate from original input based on optimized order
            original_coord = coordinates[original_coord_idx]
            waypoint = OptimizedWaypoint(
                waypoint_index=waypoint_index,  # Position in optimized sequence
                trips_idx=original_coord_idx,  # Original input index
                latitude=original_coord[0],
                longitude=original_coord[1],
            )
            waypoints.append(waypoint)

        logger.info(
            f"Waypoints built in optimized order. "
            f"Sequence: {[wp.trips_idx for wp in waypoints]}"
        )

        # Build OSRM URL
        osrm_base = "http://router.project-osrm.org/route/v1/driving"
        coords_str = ";".join([f"{wp.longitude},{wp.latitude}" for wp in waypoints])
        osrm_url = f"{osrm_base}/{coords_str}?steps=true&overview=full&annotations=true&geometries=geojson"

        # Calculate total duration
        total_duration = result.estimated_time_minutes * 60  # Convert to seconds

        computation_time = time.time() - start_time

        logger.info(
            f"Optimization successful: distance={result.total_distance:.0f}m, "
            f"duration={total_duration:.0f}s, computation={computation_time:.2f}s, "
            f"order={optimized_route}"
        )
        logger.info(f"OSRM URL ready: {len(osrm_url)} chars")

        result = OptimizeResponse(
            code="Ok",
            waypoints=waypoints,
            total_distance=result.total_distance,
            total_duration=total_duration,
            osrm_url=osrm_url,
            optimized_order=optimized_route,  # Use rotated route
        )
        logger.info(f"Coordinates Request: {request.coordinates}")
        logger.info(
            "waypoints: " + str([(wp.latitude, wp.longitude) for wp in waypoints])
        )
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Optimization failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")
