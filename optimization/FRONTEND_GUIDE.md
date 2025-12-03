# Frontend Integration Guide

Panduan lengkap untuk mengintegrasikan Optimization API ke frontend/mobile app.

---

## 📡 API Response Structure

Response API dirancang untuk memudahkan rendering step-by-step navigation di frontend.

### Complete Response Example

```json
{
  "success": true,
  "code": "Ok",
  "optimized_route": [0, 2, 1],
  "waypoints": [...],
  "legs": [...],
  "geometry": [...],
  "total_distance_meters": 3420.8,
  "total_distance_km": 3.42,
  "estimated_time_minutes": 6.85,
  "total_duration_seconds": 410.5,
  "computation_time_seconds": 2.34
}
```

---

## 🎯 Use Cases Frontend

### 1. Display Route Summary

```javascript
// Ambil data summary
const summary = {
    totalStops: response.waypoints.length,
    totalDistance: response.total_distance_km + " km",
    estimatedTime: Math.round(response.estimated_time_minutes) + " menit",
    optimizedOrder: response.optimized_route,
};

console.log(
    `Rute optimal: ${summary.totalStops} stops, ${summary.totalDistance}, ${summary.estimatedTime}`
);
```

**Output:**

```
Rute optimal: 3 stops, 3.42 km, 7 menit
```

---

### 2. Display Waypoints List

```javascript
// Loop waypoints untuk list view
response.waypoints.forEach((waypoint, index) => {
    const item = {
        number: index + 1,
        name: waypoint.name, // "Stop 1", "Stop 2", etc.
        address: `${waypoint.latitude.toFixed(4)}, ${waypoint.longitude.toFixed(
            4
        )}`,
        distanceFromPrevious:
            index === 0
                ? "0 m"
                : Math.round(waypoint.distance_from_previous) + " m",
        totalDistance: Math.round(waypoint.cumulative_distance) + " m",
    };

    // Render ke UI
    console.log(`${item.number}. ${item.name} - ${item.distanceFromPrevious}`);
});
```

**Output:**

```
1. Stop 1 - 0 m
2. Stop 2 - 1235 m (dari stop sebelumnya)
3. Stop 3 - 2186 m (dari stop sebelumnya)
```

---

### 3. Display Step-by-Step Navigation

```javascript
// Loop legs untuk navigation instructions
response.legs.forEach((leg, legIndex) => {
    console.log(`\n=== Leg ${legIndex + 1}: ${leg.summary} ===`);
    console.log(`Distance: ${Math.round(leg.distance)}m`);
    console.log(`Duration: ${Math.round(leg.duration)}s`);

    leg.steps.forEach((step, stepIndex) => {
        console.log(`  ${stepIndex + 1}. ${step.instruction}`);
        console.log(`     Distance: ${Math.round(step.distance)}m`);
        console.log(`     Duration: ${Math.round(step.duration)}s`);
    });
});
```

**Output:**

```
=== Leg 1: From Stop 1 to Stop 2 ===
Distance: 1235m
Duration: 148s
  1. Head to Stop 2
     Distance: 1235m
     Duration: 148s

=== Leg 2: From Stop 2 to Stop 3 ===
Distance: 2186m
Duration: 262s
  1. Head to Stop 3
     Distance: 2186m
     Duration: 262s
```

---

### 4. Draw Route on Map (Leaflet.js)

```javascript
// Initialize map
const map = L.map("map").setView([-3.9778, 122.5194], 13);

// Add base layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Draw full route polyline
const routeCoordinates = response.geometry.map((point) => [point[0], point[1]]);
const polyline = L.polyline(routeCoordinates, {
    color: "blue",
    weight: 4,
    opacity: 0.7,
}).addTo(map);

// Add waypoint markers
response.waypoints.forEach((waypoint, index) => {
    const marker = L.marker([waypoint.latitude, waypoint.longitude])
        .bindPopup(
            `
      <b>${waypoint.name}</b><br>
      Distance from previous: ${Math.round(
          waypoint.distance_from_previous
      )}m<br>
      Cumulative: ${Math.round(waypoint.cumulative_distance)}m
    `
        )
        .addTo(map);

    // Add label
    marker.bindTooltip(waypoint.name, { permanent: true, direction: "top" });
});

// Fit map to route bounds
map.fitBounds(polyline.getBounds());
```

---

### 5. Draw Route on Map (Google Maps)

```javascript
// Initialize map
const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: -3.9778, lng: 122.5194 },
});

// Draw route polyline
const routePath = response.geometry.map((point) => ({
    lat: point[0],
    lng: point[1],
}));

const polyline = new google.maps.Polyline({
    path: routePath,
    geodesic: true,
    strokeColor: "#0000FF",
    strokeOpacity: 0.7,
    strokeWeight: 4,
});
polyline.setMap(map);

// Add waypoint markers
const bounds = new google.maps.LatLngBounds();

response.waypoints.forEach((waypoint, index) => {
    const position = { lat: waypoint.latitude, lng: waypoint.longitude };

    const marker = new google.maps.Marker({
        position: position,
        map: map,
        label: (index + 1).toString(),
        title: waypoint.name,
    });

    const infowindow = new google.maps.InfoWindow({
        content: `
      <b>${waypoint.name}</b><br>
      Distance: ${Math.round(waypoint.distance_from_previous)}m<br>
      Total: ${Math.round(waypoint.cumulative_distance)}m
    `,
    });

    marker.addListener("click", () => {
        infowindow.open(map, marker);
    });

    bounds.extend(position);
});

// Fit map to bounds
map.fitBounds(bounds);
```

---

### 6. Render Navigation Steps (React Example)

```jsx
function NavigationSteps({ legs }) {
    return (
        <div className="navigation-steps">
            {legs.map((leg, legIndex) => (
                <div key={legIndex} className="leg">
                    <h3>{leg.summary}</h3>
                    <p>
                        Distance: {(leg.distance / 1000).toFixed(2)} km |
                        Duration: {Math.round(leg.duration / 60)} min
                    </p>

                    <ol className="steps">
                        {leg.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="step">
                                <strong>{step.instruction}</strong>
                                <div className="step-details">
                                    <span>{Math.round(step.distance)}m</span>
                                    <span>{Math.round(step.duration)}s</span>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            ))}
        </div>
    );
}

// Usage
<NavigationSteps legs={response.legs} />;
```

---

### 7. Animate Route Drawing

```javascript
// Animate route drawing on map
function animateRoute(geometry, map) {
    let index = 0;
    const coordinates = [];

    const interval = setInterval(() => {
        if (index >= geometry.length) {
            clearInterval(interval);
            return;
        }

        coordinates.push([geometry[index][0], geometry[index][1]]);

        // Update polyline
        const polyline = L.polyline(coordinates, {
            color: "blue",
            weight: 4,
        }).addTo(map);

        index++;
    }, 100); // Draw point setiap 100ms
}

// Usage
animateRoute(response.geometry, map);
```

---

### 8. Export to GPX (for GPS devices)

```javascript
function exportToGPX(response) {
    let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Route Optimizer">
  <trk>
    <name>Optimized Route</name>
    <trkseg>`;

    response.geometry.forEach((point) => {
        gpx += `
      <trkpt lat="${point[0]}" lon="${point[1]}">
        <ele>0</ele>
      </trkpt>`;
    });

    gpx += `
    </trkseg>
  </trk>
</gpx>`;

    // Download GPX file
    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-route.gpx";
    a.click();
}
```

---

## 📊 Data Structure Reference

### Waypoint Object

```typescript
interface Waypoint {
    index: number; // Sequential index (0, 1, 2...)
    original_index: number; // Original input index
    latitude: number; // Waypoint latitude
    longitude: number; // Waypoint longitude
    distance_from_previous: number; // Meters from previous waypoint
    cumulative_distance: number; // Total meters from start
    name: string; // "Stop 1", "Stop 2", etc.
}
```

### RouteLeg Object

```typescript
interface RouteLeg {
    leg_index: number; // Leg sequence number
    start_waypoint_index: number; // Start waypoint index
    end_waypoint_index: number; // End waypoint index
    distance: number; // Leg distance in meters
    duration: number; // Leg duration in seconds
    steps: RouteStep[]; // Navigation steps
    summary: string; // "From Stop 1 to Stop 2"
}
```

### RouteStep Object

```typescript
interface RouteStep {
    step_index: number; // Step sequence number
    instruction: string; // "Head to Stop 2"
    distance: number; // Step distance in meters
    duration: number; // Step duration in seconds
    start_location: [number, number]; // [lat, lon]
    end_location: [number, number]; // [lat, lon]
    geometry: Array<[number, number]>; // Path points [[lat,lon], ...]
}
```

---

## 🎨 UI/UX Recommendations

### Route Summary Card

```
┌─────────────────────────────────────┐
│ 📍 Optimized Route                  │
├─────────────────────────────────────┤
│ Total Stops: 3                      │
│ Total Distance: 3.42 km             │
│ Estimated Time: 7 minutes           │
│ Optimized Order: 1 → 3 → 2          │
└─────────────────────────────────────┘
```

### Waypoints List

```
┌─────────────────────────────────────┐
│ 1️⃣ Stop 1                          │
│    Starting point                   │
│    📍 -3.9778, 122.5194            │
├─────────────────────────────────────┤
│ 2️⃣ Stop 2                          │
│    1.2 km from previous            │
│    📍 -3.9812, 122.5267            │
├─────────────────────────────────────┤
│ 3️⃣ Stop 3                          │
│    2.2 km from previous            │
│    📍 -3.9689, 122.5342            │
└─────────────────────────────────────┘
```

---

## 💡 Tips & Best Practices

1. **Caching Response**: Cache response di localStorage untuk offline access
2. **Error Handling**: Selalu handle error dengan fallback UI
3. **Loading State**: Tampilkan loading indicator saat request
4. **Map Optimization**: Lazy load map library untuk performa
5. **Mobile Friendly**: Pastikan UI responsive untuk mobile
6. **GPS Integration**: Gunakan device GPS untuk live tracking

---

## 🔗 Integration Examples

### Fetch API (Vanilla JS)

```javascript
async function optimizeRoute(coordinates) {
    try {
        const response = await fetch("http://localhost:8000/api/v1/optimize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ coordinates }),
        });

        if (!response.ok) throw new Error("Optimization failed");

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}
```

### Axios (React/Vue)

```javascript
import axios from "axios";

async function optimizeRoute(coordinates) {
    try {
        const { data } = await axios.post(
            "http://localhost:8000/api/v1/optimize",
            { coordinates }
        );
        return data;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}
```

### Flutter (Dart)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>?> optimizeRoute(List<Map<String, double>> coordinates) async {
  try {
    final response = await http.post(
      Uri.parse('http://localhost:8000/api/v1/optimize'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'coordinates': coordinates}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  } catch (e) {
    print('Error: $e');
    return null;
  }
}
```

---

**Last Updated:** November 16, 2025
**API Version:** 1.0.0
