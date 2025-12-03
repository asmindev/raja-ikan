// Coordinate types
export interface Coordinate {
    latitude: number;
    longitude: number;
}

// Optimization API Response
export interface OptimizedWaypoint {
    waypoint_index: number;
    trips_idx: number;
    latitude: number;
    longitude: number;
}

export interface OptimizeResponse {
    code: string;
    waypoints: OptimizedWaypoint[];
    total_distance: number;
    total_duration: number;
    osrm_url: string;
    optimized_order: number[];
}

// OSRM Response Types
export interface OSRMWaypoint {
    hint: string;
    distance: number;
    name: string;
    location: [number, number]; // [lon, lat]
}

export interface OSRMManeuver {
    bearing_after: number;
    bearing_before: number;
    location: [number, number];
    type: string;
    modifier?: string;
    instruction?: string;
}

export interface OSRMStep {
    distance: number;
    duration: number;
    geometry: string | any; // GeoJSON or encoded polyline
    name: string;
    mode: string;
    maneuver: OSRMManeuver;
    intersections?: any[];
}

export interface OSRMLeg {
    distance: number;
    duration: number;
    steps: OSRMStep[];
    summary: string;
    weight: number;
}

export interface OSRMRoute {
    distance: number;
    duration: number;
    weight: number;
    weight_name: string;
    legs: OSRMLeg[];
    geometry: any; // GeoJSON or encoded polyline
}

export interface OSRMResponse {
    code: string;
    waypoints: OSRMWaypoint[];
    routes: OSRMRoute[];
}

// Combined result
export interface OptimizationResult {
    optimized: OptimizeResponse;
    osrm: OSRMResponse;
}
