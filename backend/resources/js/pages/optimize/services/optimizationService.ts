import type {
    Coordinate,
    OptimizationResult,
    OptimizeResponse,
    OSRMResponse,
} from '../types';

const OPTIMIZATION_API_URL = 'http://localhost:5000/api/v1';

/**
 * Call optimization API to get optimal route order
 */
export async function getOptimizedOrder(
    coordinates: Coordinate[],
): Promise<OptimizeResponse> {
    const response = await fetch(`${OPTIMIZATION_API_URL}/optimize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coordinates }),
    });

    if (!response.ok) {
        throw new Error(`Optimization failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok') {
        throw new Error(`Optimization error: ${data.code}`);
    }

    return data;
}

/**
 * Call OSRM API to get detailed routing
 */
export async function getOSRMRouting(osrmUrl: string): Promise<OSRMResponse> {
    // Add geometries=geojson to get GeoJSON geometry
    const urlWithGeometry = osrmUrl.includes('geometries=')
        ? osrmUrl
        : `${osrmUrl}&geometries=geojson`;

    console.log('Fetching OSRM:', urlWithGeometry);

    const response = await fetch(urlWithGeometry);

    if (!response.ok) {
        throw new Error(`OSRM routing failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok') {
        throw new Error(`OSRM error: ${data.code}`);
    }

    console.log('OSRM Response:', data);

    return data;
}

/**
 * Complete optimization workflow:
 * 1. Get optimized order from our API
 * 2. Get detailed routing from OSRM
 */
export async function optimizeRoute(
    coordinates: Coordinate[],
): Promise<OptimizationResult> {
    // Step 1: Get optimized order
    const optimized = await getOptimizedOrder(coordinates);

    console.log('✓ Optimized order:', optimized.optimized_order);
    console.log('✓ GA distance:', optimized.total_distance, 'm');

    // Step 2: Get OSRM routing details
    const osrm = await getOSRMRouting(optimized.osrm_url);

    console.log('✓ OSRM distance:', osrm.routes[0]?.distance, 'm');
    console.log('✓ OSRM duration:', osrm.routes[0]?.duration, 's');

    return {
        optimized,
        osrm,
    };
}
