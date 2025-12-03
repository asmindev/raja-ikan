from pydantic import BaseModel, Field
from typing import List, Optional


class Coordinate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

    class Config:
        json_schema_extra = {"example": {"latitude": -3.9778, "longitude": 122.5150}}


class OptimizeRequest(BaseModel):
    coordinates: List[Coordinate] = Field(..., min_length=1)
    use_cached_params: bool = Field(default=True)

    class Config:
        json_schema_extra = {
            "example": {
                "coordinates": [
                    {"latitude": -3.9778, "longitude": 122.5150},
                    {"latitude": -3.9856, "longitude": 122.5234},
                    {"latitude": -3.9912, "longitude": 122.5178},
                ],
                "use_cached_params": True,
            }
        }


class OptimizedWaypoint(BaseModel):
    """Waypoint dalam urutan optimal."""

    waypoint_index: int  # Position in optimized route (0, 1, 2...)
    trips_idx: int  # Original input index
    latitude: float
    longitude: float


class OptimizeResponse(BaseModel):
    """
    Simple optimization response.
    Return urutan optimal + OSRM URL untuk detail routing.
    """

    code: str = "Ok"  # OSRM-compatible status
    waypoints: List[OptimizedWaypoint]  # Waypoints in optimal order
    total_distance: float  # Total distance in meters (GA calculation)
    total_duration: float  # Total duration in seconds (estimation)

    # OSRM integration helpers
    osrm_url: str  # Ready-to-use OSRM request URL
    optimized_order: List[int]  # Original indices order: [0, 2, 1]
