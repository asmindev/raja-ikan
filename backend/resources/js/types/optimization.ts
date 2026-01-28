// Optimization API Types

export interface Coordinate {
    lat: number;
    lng: number;
}

export interface DriverRoute {
    id: number;
    driver_id: number;
    driver_name: string;
    status: string;
    coordinates: Array<{
        lat: number;
        lng: number;
        address: string;
        customer_name: string;
    }>;
}

export interface GAHistory {
    generations: number[];
    fitness_scores: number[];
    best_routes: number[][];
    avg_fitness: number[];
    diversity: number[];
}

export interface OptimizationTiming {
    graph_load: number;
    distance_matrix: number;
    ga_execution: number;
    total: number;
}

export interface OptimizationParameters {
    pop_size: number;
    generations: number;
    mutation_rate: number;
    crossover_rate: number;
    tournament_size: number;
}

export interface OptimizationDetail {
    timing: OptimizationTiming;
    ga_history: GAHistory;
    parameters: OptimizationParameters;
}

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
    details?: OptimizationDetail;
    osrm_route?: OSRMResponse;
}

export interface OSRMRoute {
    distance: number;
    duration: number;
    geometry: {
        coordinates: [number, number][];
        type: string;
    };
}

export interface OSRMResponse {
    code: string;
    routes: OSRMRoute[];
    waypoints: any[];
}
