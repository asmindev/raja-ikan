# Route Optimization API

FastAPI service untuk optimasi rute pengiriman di Kendari, Indonesia menggunakan Genetic Algorithm dan XGBoost.

---

## 🚀 Quick Start

### 1. Setup Virtual Environment

```bash
cd /home/labubu/Projects/app-delivery/optimization
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Server

```bash
python app.py
```

Server akan berjalan di: `http://localhost:8000`

---

## 📡 API Endpoints

### Health Check

```bash
GET /api/v1/health
```

**Response:**

```json
{
    "status": "healthy",
    "graph_loaded": true,
    "nodes_count": 10428
}
```

### Optimize Route

```bash
POST /api/v1/optimize
```

**Request Body:**

```json
{
    "coordinates": [
        { "latitude": -3.9778, "longitude": 122.5194 },
        { "latitude": -3.9689, "longitude": 122.5342 },
        { "latitude": -3.9812, "longitude": 122.5267 }
    ],
    "use_cached_params": true
}
```

**Note:** `use_cached_params` default adalah `true`. Jika model XGBoost belum di-training, akan otomatis pakai parameter default dari config.

**Response:**

```json
{
    "success": true,
    "optimized_route": [0, 2, 1],
    "total_distance_km": 5.42,
    "estimated_time_minutes": 16.3,
    "waypoints": [
        { "lat": -3.9778, "lon": 122.5194 },
        { "lat": -3.9812, "lon": 122.5267 },
        { "lat": -3.9689, "lon": 122.5342 }
    ]
}
```

---

## 🧪 Testing

### Run Test API

```bash
python test_api.py
```

### Manual Test dengan curl

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Optimize route (use_cached_params default = true)
curl -X POST http://localhost:8000/api/v1/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [
      {"latitude": -3.9778, "longitude": 122.5194},
      {"latitude": -3.9689, "longitude": 122.5342},
      {"latitude": -3.9812, "longitude": 122.5267}
    ]
  }'

# Optimize dengan parameter default GA (use_cached_params = false)
curl -X POST http://localhost:8000/api/v1/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [
      {"latitude": -3.9778, "longitude": 122.5194},
      {"latitude": -3.9689, "longitude": 122.5342},
      {"latitude": -3.9812, "longitude": 122.5267}
    ],
    "use_cached_params": false
  }'
```

---

## ⚙️ Configuration

Edit `algorithm/config.py` untuk mengubah parameter:

### Genetic Algorithm

```python
@dataclass
class GAConfig:
    pop_size: int = 50           # Ukuran populasi
    generations: int = 50        # Jumlah generasi
    mutation_rate: float = 0.2   # Rate mutasi
    crossover_rate: float = 0.7  # Rate crossover
```

### Map Settings

```python
@dataclass
class MapConfig:
    location: str = "Kendari, Indonesia"
    network_type: str = "drive"
```

### XGBoost Training

```python
@dataclass
class XGBoostConfig:
    training_n_nodes: int = 10   # 10: cepat (~30 min), 30: akurat (~2 jam)
    n_estimators: int = 100
    test_size: float = 0.2
```

---

## 🤖 XGBoost Training (Opsional)

XGBoost digunakan untuk memprediksi hyperparameter GA yang optimal.

### Kapan Training Diperlukan?

-   ✅ **Skip** jika hanya pakai parameter default
-   ✅ **Training** jika mau pakai `use_optimal_params=true` di API

### Cara Training

```bash
cd /home/labubu/Projects/app-delivery/optimization
source .venv/bin/activate
python -m algorithm.xgboost_trainer
```

**Waktu:** 30 menit - 2 jam (tergantung `training_n_nodes`)

**Hasil:** Model disimpan di `algorithm/cache/xgb_model.pkl`

### Mengubah Konfigurasi Training

Edit `algorithm/config.py`:

```python
training_n_nodes: int = 10   # Cepat (~30 menit)
# atau
training_n_nodes: int = 30   # Akurat (~2 jam)
```

---

## 📂 Project Structure

```
optimization/
├── app.py                    # FastAPI entry point
├── test_api.py              # API integration tests
├── requirements.txt         # Python dependencies
├── README.md                # This file
├── algorithm/               # Core optimization algorithms
│   ├── config.py            # All configurations
│   ├── optimizer.py         # Genetic Algorithm
│   ├── xgboost_trainer.py   # XGBoost training
│   ├── utils.py             # GraphLoader utilities
│   └── cache/               # Graph & model cache
│       ├── kendari_graph.pkl      # OSM graph (auto-download)
│       └── xgb_model.pkl          # XGBoost model (optional)
├── service/                 # API layer
│   ├── routes.py            # API endpoints
│   ├── schemas.py           # Pydantic models
│   └── utils.py             # Lifecycle functions
├── utils/                   # Shared utilities
│   └── logger.py            # Centralized logging
└── logs/                    # Application logs
    └── app.log              # Log file
```

---

## 📊 Workflow

### Startup Flow

```
1. app.py → uvicorn server start
2. lifespan event → startup_event()
3. Load OptimizationConfig
4. Initialize GraphLoader
5. Load graph:
   - Memory cache (instant)
   - File cache (2-3s)
   - OSM download (30-60s first time)
6. API ready!
```

### Optimization Flow

```
1. POST /api/v1/optimize
2. Find nearest nodes from coordinates
3. Calculate distance matrix
4. Run Genetic Algorithm:
   - Default: use config.py params
   - Optimal: load XGBoost model → predict params
5. Return optimized route
```

---

## 📝 Logging

Logs tersimpan di `logs/app.log` dan console.

**Format:**

```
2025-11-16 12:25:34 - optimizer.py - INFO - Route optimized: distance=5.42km
```

**Log Levels:**

-   `INFO`: Operasi normal
-   `DEBUG`: Detail algoritma
-   `WARNING`: Peringatan
-   `ERROR`: Error dengan stacktrace

---

## 🔧 Troubleshooting

### Graph tidak terload

```bash
# Hapus cache dan download ulang
rm algorithm/cache/kendari_graph.pkl
python app.py
```

### Port 8000 sudah dipakai

Edit `app.py`:

```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Ganti port
```

### XGBoost model tidak ditemukan

Jika pakai `use_optimal_params=true` tapi model belum di-training:

```bash
# Training model dulu
python -m algorithm.xgboost_trainer

# Atau pakai default params
curl -X POST ... -d '{"coordinates": [...], "use_optimal_params": false}'
```

---

## 📦 Dependencies

-   **FastAPI**: Web framework
-   **DEAP**: Genetic Algorithm library
-   **XGBoost**: Machine learning untuk hyperparameter tuning
-   **OSMnx**: OpenStreetMap graph downloader
-   **NetworkX**: Graph algorithms
-   **Uvicorn**: ASGI server

---

## 🎯 Performance

| Mode        | Parameters        | Time    | Quality |
| ----------- | ----------------- | ------- | ------- |
| **Default** | pop=50, gen=50    | ~5-10s  | Good    |
| **Optimal** | XGBoost predicted | ~10-15s | Better  |

**Graph Loading:**

-   First run: 30-60 seconds (download OSM)
-   Cached: 2-3 seconds

---

## 📞 Support

Untuk pertanyaan atau issues, hubungi tim development atau buat issue di repository.

---

**Version:** 1.0.0
**Last Updated:** November 16, 2025
