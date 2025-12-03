# AI Agent Instructions

Proyek delivery optimization untuk Kendari, Indonesia dengan 4 komponen utama.

---

## 📁 optimization/

**FastAPI route optimization service (Genetic Algorithm + XGBoost)**

#### virtual environment: `/home/labubu/Projects/app-delivery/optimization/.venv`

### Struktur (JANGAN DIUBAH):

```
optimization/
├── app.py                    # Entry point FastAPI
├── test_api.py              # Test integration
├── requirements.txt         # Dependencies
├── algorithm/               # 5 files ONLY
│   ├── __init__.py          # Exports
│   ├── config.py            # Semua konfigurasi (MapConfig, GAConfig, XGBoostConfig)
│   ├── optimizer.py         # Genetic Algorithm + RouteOptimizer
│   ├── xgboost_trainer.py   # Hyperparameter tuning
│   ├── utils.py             # GraphLoader singleton
│   └── cache/               # Graph & model cache (auto-generated)
└── service/                 # 3 files ONLY
    ├── routes.py            # API endpoints
    ├── schemas.py           # Pydantic models
    └── utils.py             # Lifecycle functions
```

### Rules:

-   ❌ JANGAN tambah file baru di `algorithm/` atau `service/`
-   ❌ JANGAN import numpy di `config.py` - pakai list biasa
-   ✅ Pakai relative imports: `from .config import ...`
-   ✅ Cache HARUS di `algorithm/cache/`

### Commands:

```bash
cd optimization
python app.py              # Start server (port 8000)
python test_api.py         # Test API
```

### Flow:

1. GraphLoader download OSM Kendari → cache ke `algorithm/cache/kendari_graph.pkl`
2. GET `/api/v1/health` - cek graph loaded
3. POST `/api/v1/optimize` - optimize route pakai GA
4. XGBoost prediksi hyperparameter optimal (opsional)

### Config:

Edit `algorithm/config.py`:

```python
config = OptimizationConfig()
config.ga.pop_size = 100
config.ga.generations = 200
```

---

## 📁 backend/

**Laravel 11 + Inertia.js**

### Struktur:

```
backend/
├── app/              # MVC standard Laravel
├── routes/           # web.php, console.php
├── resources/        # Views, JS, CSS
├── config/           # fortify.php, inertia.php
└── database/         # migrations, seeders
```

### Commands:

```bash
cd backend
php artisan serve
php artisan test
```

### Stack:

-   Laravel Fortify (auth)
-   Inertia.js (frontend)
-   Vue/React

---

## 📁 mobile/

**Flutter cross-platform app**

### Struktur:

```
mobile/
├── lib/
│   ├── main.dart
│   ├── config/
│   ├── models/
│   ├── screens/
│   └── services/
└── pubspec.yaml
```

### Commands:

```bash
cd mobile
flutter pub get
flutter run
flutter build apk
```

---

## 📁 wa-gateaway/

**WhatsApp Business API gateway (Node.js/TypeScript)**

### Struktur:

```
wa-gateaway/
├── src/
├── logs/
├── sesi/
├── package.json
└── tsconfig.json
```

### Commands:

```bash
cd wa-gateaway
npm install
npm start
```

---

## 🔗 Integration

**optimization/** expose REST API:

-   `POST /api/v1/optimize` → terima coordinates, return optimized route
-   Response: `{ optimized_route: [0,2,1], total_distance_km: 5.42, waypoints: [...] }`

**backend/** & **mobile/** consume API ini untuk route planning.
