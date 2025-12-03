# Frontend Integration - OSRM Compatible

API ini return urutan waypoint yang sudah dioptimasi. Frontend tinggal request detail routing ke OSRM.

---

## 🔄 Two-Step Process

### Step 1: Optimize Order (Our API)

**Request:**

```bash
POST http://localhost:8000/api/v1/optimize
```

```json
{
    "coordinates": [
        { "latitude": -3.9778, "longitude": 122.5194 },
        { "latitude": -3.9689, "longitude": 122.5342 },
        { "latitude": -3.9812, "longitude": 122.5267 }
    ]
}
```

**Response:**

```json
{
    "code": "Ok",
    "waypoints": [
        {
            "waypoint_index": 0,
            "trips_idx": 0,
            "latitude": -3.9778,
            "longitude": 122.5194
        },
        {
            "waypoint_index": 1,
            "trips_idx": 2,
            "latitude": -3.9812,
            "longitude": 122.5267
        },
        {
            "waypoint_index": 2,
            "trips_idx": 1,
            "latitude": -3.9689,
            "longitude": 122.5342
        }
    ],
    "total_distance": 3420.8,
    "total_duration": 410.5,
    "osrm_url": "http://router.project-osrm.org/route/v1/driving/122.5194,-3.9778;122.5267,-3.9812;122.5342,-3.9689?steps=true&overview=full&annotations=true",
    "optimized_order": [0, 2, 1]
}
```

### Step 2: Get Routing Details (OSRM)

**Use the `osrm_url` dari response:**

```bash
GET http://router.project-osrm.org/route/v1/driving/122.5194,-3.9778;122.5267,-3.9812;122.5342,-3.9689?steps=true&overview=full&annotations=true
```

**OSRM Response** (Full routing details):

```json
{
  "code": "Ok",
  "routes": [{
    "geometry": "...",
    "legs": [...],
    "distance": 3567.2,
    "duration": 428.6,
    "weight": 428.6
  }],
  "waypoints": [...]
}
```

---

## 💻 Frontend Implementation

### JavaScript (Vanilla)

```javascript
async function getOptimizedRoute(coordinates) {
    // Step 1: Get optimized order
    const optimizeResponse = await fetch(
        "http://localhost:8000/api/v1/optimize",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coordinates }),
        }
    );

    const optimized = await optimizeResponse.json();

    if (optimized.code !== "Ok") {
        throw new Error("Optimization failed");
    }

    console.log("Optimized order:", optimized.optimized_order);
    console.log("GA distance:", optimized.total_distance, "m");

    // Step 2: Get OSRM routing details
    const osrmResponse = await fetch(optimized.osrm_url);
    const osrmData = await osrmResponse.json();

    if (osrmData.code !== "Ok") {
        throw new Error("OSRM routing failed");
    }

    console.log("OSRM distance:", osrmData.routes[0].distance, "m");
    console.log("OSRM duration:", osrmData.routes[0].duration, "s");

    return {
        optimized, // Our API response
        osrm: osrmData, // OSRM response
    };
}

// Usage
const coords = [
    { latitude: -3.9778, longitude: 122.5194 },
    { latitude: -3.9689, longitude: 122.5342 },
    { latitude: -3.9812, longitude: 122.5267 },
];

const result = await getOptimizedRoute(coords);

// Draw route on map using OSRM geometry
const geometry = result.osrm.routes[0].geometry;
// ... render on Leaflet/Google Maps
```

---

### React Example

```jsx
import { useState, useEffect } from "react";
import axios from "axios";

function RouteOptimizer({ coordinates }) {
    const [optimized, setOptimized] = useState(null);
    const [osrmRoute, setOsrmRoute] = useState(null);
    const [loading, setLoading] = useState(false);

    const optimize = async () => {
        setLoading(true);

        try {
            // Step 1: Optimize order
            const { data: optimizeResult } = await axios.post(
                "http://localhost:8000/api/v1/optimize",
                { coordinates }
            );

            setOptimized(optimizeResult);

            // Step 2: Get OSRM routing
            const { data: osrmResult } = await axios.get(
                optimizeResult.osrm_url
            );

            setOsrmRoute(osrmResult);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={optimize} disabled={loading}>
                {loading ? "Optimizing..." : "Optimize Route"}
            </button>

            {optimized && (
                <div>
                    <h3>
                        Optimized Order: {optimized.optimized_order.join(" → ")}
                    </h3>
                    <p>GA Distance: {optimized.total_distance.toFixed(0)} m</p>
                    <p>GA Duration: {optimized.total_duration.toFixed(0)} s</p>
                </div>
            )}

            {osrmRoute && (
                <div>
                    <h3>OSRM Route Details</h3>
                    <p>
                        Actual Distance:{" "}
                        {osrmRoute.routes[0].distance.toFixed(0)} m
                    </p>
                    <p>
                        Actual Duration:{" "}
                        {osrmRoute.routes[0].duration.toFixed(0)} s
                    </p>

                    {osrmRoute.routes[0].legs.map((leg, i) => (
                        <div key={i}>
                            <h4>Leg {i + 1}</h4>
                            {leg.steps.map((step, j) => (
                                <p key={j}>{step.maneuver.instruction}</p>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

---

### Flutter (Dart)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class RouteOptimizer {
  static const String apiUrl = 'http://localhost:8000/api/v1/optimize';

  Future<Map<String, dynamic>> getOptimizedRoute(List<Map<String, double>> coordinates) async {
    // Step 1: Optimize order
    final optimizeResponse = await http.post(
      Uri.parse(apiUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'coordinates': coordinates}),
    );

    if (optimizeResponse.statusCode != 200) {
      throw Exception('Optimization failed');
    }

    final optimized = jsonDecode(optimizeResponse.body);

    print('Optimized order: ${optimized['optimized_order']}');
    print('GA distance: ${optimized['total_distance']} m');

    // Step 2: Get OSRM routing
    final osrmResponse = await http.get(Uri.parse(optimized['osrm_url']));

    if (osrmResponse.statusCode != 200) {
      throw Exception('OSRM routing failed');
    }

    final osrmData = jsonDecode(osrmResponse.body);

    print('OSRM distance: ${osrmData['routes'][0]['distance']} m');
    print('OSRM duration: ${osrmData['routes'][0]['duration']} s');

    return {
      'optimized': optimized,
      'osrm': osrmData,
    };
  }
}

// Usage
final optimizer = RouteOptimizer();
final result = await optimizer.getOptimizedRoute([
  {'latitude': -3.9778, 'longitude': 122.5194},
  {'latitude': -3.9689, 'longitude': 122.5342},
  {'latitude': -3.9812, 'longitude': 122.5267},
]);
```

---

## 🗺️ Map Rendering (Leaflet.js)

```javascript
// Setelah dapat OSRM response
async function renderRoute(optimized, osrmData) {
    const map = L.map("map").setView([-3.9778, 122.5194], 13);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        map
    );

    // Decode OSRM polyline geometry
    const route = osrmData.routes[0];
    const geometry = polyline.decode(route.geometry); // Jika pakai encoded polyline
    // Atau jika geometry sudah GeoJSON coordinates: route.geometry.coordinates

    // Draw route
    L.polyline(geometry, {
        color: "blue",
        weight: 4,
        opacity: 0.7,
    }).addTo(map);

    // Add waypoint markers
    optimized.waypoints.forEach((wp, index) => {
        L.marker([wp.latitude, wp.longitude])
            .bindPopup(`Stop ${index + 1} (original: ${wp.trips_idx})`)
            .addTo(map);
    });

    // Fit bounds
    map.fitBounds(geometry);
}
```

---

## 📊 Response Field Explanation

| Field             | Type   | Description                              |
| ----------------- | ------ | ---------------------------------------- |
| `code`            | string | "Ok" if success, error code otherwise    |
| `waypoints`       | array  | Waypoints in optimal order               |
| `waypoint_index`  | int    | Position in optimized route (0, 1, 2...) |
| `trips_idx`       | int    | Original input index                     |
| `total_distance`  | float  | GA-calculated distance (meters)          |
| `total_duration`  | float  | Estimated duration (seconds)             |
| `osrm_url`        | string | Ready-to-use OSRM routing URL            |
| `optimized_order` | array  | Order of original indices [0, 2, 1]      |

---

## 🎯 Why This Approach?

### ✅ Advantages

1. **Separation of Concerns**

    - Our API: TSP optimization (order)
    - OSRM: Detailed routing (geometry, instructions)

2. **Leverage OSRM Strengths**

    - Turn-by-turn navigation
    - Accurate road distances
    - Real-time traffic data
    - Street names, instructions

3. **Simpler API**

    - Smaller response size
    - Faster computation
    - No need to store/serve map data

4. **Flexibility**
    - Frontend can choose OSRM server (public/private)
    - Can add OSRM parameters (alternatives, avoid tolls, etc.)
    - Easy to switch routing providers

### 🔄 Data Flow

```
User Input
    ↓
[Coordinates]
    ↓
Our API (GA Optimization)
    ↓
[Optimized Order + OSRM URL]
    ↓
OSRM (Detailed Routing)
    ↓
[Geometry + Instructions]
    ↓
Frontend (Map Display)
```

---

## 🛠️ Custom OSRM Parameters

Modify `osrm_url` sesuai kebutuhan:

```javascript
// Add alternatives
const url = optimized.osrm_url + "&alternatives=true";

// Different overview level
const url = optimized.osrm_url.replace("overview=full", "overview=simplified");

// Add geometries format
const url = optimized.osrm_url + "&geometries=geojson";

// Use different OSRM server
const url = optimized.osrm_url.replace(
    "router.project-osrm.org",
    "your-osrm-server.com"
);
```

---

## 📱 Mobile App Integration

### Caching Strategy

```javascript
// Cache optimization result
localStorage.setItem("optimized_route", JSON.stringify(optimized));

// Reuse if coordinates haven't changed
const cached = localStorage.getItem("optimized_route");
if (cached) {
    const optimized = JSON.parse(cached);
    // Call OSRM directly
}
```

### Offline Support

```javascript
// Download OSRM response for offline use
const osrmData = await fetch(optimized.osrm_url).then((r) => r.json());
localStorage.setItem("route_details", JSON.stringify(osrmData));

// Use cached data when offline
if (!navigator.onLine) {
    const cached = JSON.parse(localStorage.getItem("route_details"));
    renderRoute(cached);
}
```

---

**Last Updated:** November 16, 2025
**API Version:** 1.0.0 - Simple OSRM Integration
