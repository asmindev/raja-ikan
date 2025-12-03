"""
Simple test untuk Route Optimization API
"""

import requests
import json

BASE_URL = "http://localhost:8000"


def test_root():
    print("\n=== Test Root ===")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def test_health():
    print("\n=== Test Health ===")
    response = requests.get(f"{BASE_URL}/api/v1/health")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def test_optimize():
    print("\n=== Test Optimize ===")

    payload = {
        "coordinates": [
            {"latitude": -3.9778, "longitude": 122.5150},
            {"latitude": -3.9856, "longitude": 122.5234},
            {"latitude": -3.9912, "longitude": 122.5178},
            {"latitude": -3.9801, "longitude": 122.5289},
            {"latitude": -3.9734, "longitude": 122.5201},
        ],
        "use_cached_params": True,
    }

    response = requests.post(f"{BASE_URL}/api/v1/optimize", json=payload)
    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"✅ Success!")
        print(f"Route: {result['optimized_route']}")
        print(f"Distance: {result['total_distance_km']:.2f} km")
        print(f"Time: {result['estimated_time_minutes']:.1f} min")
        print(f"Computation: {result['computation_time_seconds']:.2f} sec")
    else:
        print(f"❌ Failed: {response.text}")


if __name__ == "__main__":
    print("=" * 80)
    print("Testing Route Optimization API")
    print("Make sure server is running: python app.py")
    print("=" * 80)

    try:
        test_root()
        test_health()
        test_optimize()
        print("\n" + "=" * 80)
        print("✅ All tests completed!")
        print("=" * 80)
    except requests.exceptions.ConnectionError:
        print("\n❌ Cannot connect to server!")
        print("Run: python app.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")
