# 🚚 Delivery Optimization App - Kendari

Aplikasi optimasi rute pengiriman untuk Kendari, Indonesia dengan 4 komponen utama yang terintegrasi.

---

## 📦 Komponen Aplikasi

### 1. 🎯 **optimization/** - Route Optimization Service
FastAPI service untuk optimasi rute menggunakan Genetic Algorithm + XGBoost

**Tech Stack:**
- Python 3.x + FastAPI
- Genetic Algorithm untuk optimasi rute
- XGBoost untuk prediksi hyperparameter
- OSMnx untuk data peta Kendari
- GraphLoader dengan caching

**Virtual Environment:** `optimization/.venv`

**Setup & Run:**
```bash
cd optimization
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python app.py              # Run server (port 8000)
python test_api.py         # Test API
```

**API Endpoints:**
- `GET /api/v1/health` - Health check & graph status
- `POST /api/v1/optimize` - Optimize delivery route

**Struktur:**
```
optimization/
├── app.py                    # FastAPI entry point
├── test_api.py              # Integration test
├── requirements.txt
├── algorithm/               # Core optimization (5 files)
│   ├── config.py            # Semua konfigurasi
│   ├── optimizer.py         # Genetic Algorithm
│   ├── xgboost_trainer.py   # ML training
│   ├── utils.py             # GraphLoader singleton
│   └── cache/               # Graph & model cache
└── service/                 # API layer (3 files)
    ├── routes.py            # Endpoints
    ├── schemas.py           # Pydantic models
    └── utils.py             # Lifecycle
```

---

### 2. 🌐 **backend/** - Laravel Backend + Admin Panel
Laravel 11 dengan Inertia.js untuk admin panel dan API

**Tech Stack:**
- Laravel 11
- Inertia.js + React + TypeScript
- Shadcn UI components
- Laravel Fortify (authentication)
- MySQL database

**Setup & Run:**
```bash
cd backend
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve           # Backend (port 8000)
npm run dev                 # Frontend dev server
```

**Fitur:**
- User management (Admin, Customer, Driver)
- Order management dengan confirmation workflow
- Product management
- Real-time messaging
- Modern admin dashboard dengan grouped sidebar
- View-based folder structure untuk modular components

**Struktur:**
```
backend/
├── app/                     # Laravel MVC
│   ├── Http/Controllers/
│   │   ├── Admin/          # Admin controllers
│   │   └── Customer/       # Customer controllers
│   └── Models/
├── resources/js/
│   ├── pages/              # Inertia pages (view-based)
│   │   ├── admin/
│   │   │   ├── orders/
│   │   │   │   └── index/
│   │   │   │       ├── index.tsx
│   │   │   │       ├── components/
│   │   │   │       └── hooks/
│   │   │   └── users/
│   │   └── user/
│   ├── components/         # Shared components
│   │   ├── sidebar/
│   │   └── ui/             # Shadcn UI
│   └── layouts/
├── routes/
└── database/
```

---

### 3. 📱 **mobile/** - Flutter Mobile App
Cross-platform mobile app untuk customer dan driver

**Tech Stack:**
- Flutter 3.x
- Dart
- Riverpod (state management)
- HTTP interceptor untuk API calls

**Setup & Run:**
```bash
cd mobile
flutter pub get
flutter run                 # Run on connected device
flutter build apk          # Build Android APK
flutter build ios          # Build iOS (Mac only)
```

**Fitur:**
- Customer app: Order placement, tracking, payment
- Driver app: Order acceptance, route navigation, delivery confirmation
- Real-time location tracking
- Push notifications

**Struktur:**
```
mobile/
├── lib/
│   ├── main.dart
│   ├── config/             # App configuration
│   ├── models/             # Data models
│   ├── screens/            # UI screens
│   ├── services/           # API services
│   └── providers/          # Riverpod providers
└── pubspec.yaml
```

---

### 4. 💬 **wa-gateaway/** - WhatsApp Gateway
WhatsApp Business API gateway untuk notifikasi dan komunikasi

**Tech Stack:**
- Node.js + TypeScript
- WhatsApp Business API
- Express.js

**Setup & Run:**
```bash
cd wa-gateaway
npm install
npm start                   # Run gateway
```

**Fitur:**
- WhatsApp notifications untuk order updates
- QR code authentication
- Message templates
- Session management

**Struktur:**
```
wa-gateaway/
├── src/                    # TypeScript source
├── logs/                   # Application logs
├── sesi/                   # WhatsApp sessions
├── package.json
└── tsconfig.json
```

---

## 🔗 Integrasi

```
┌─────────────────┐
│  Mobile App     │ ──┐
│  (Flutter)      │   │
└─────────────────┘   │
                      ├──► ┌──────────────────┐
┌─────────────────┐   │    │  Backend API     │
│  Admin Panel    │ ──┘    │  (Laravel)       │
│  (Inertia+React)│         └──────────────────┘
└─────────────────┘              │      │
                                 │      │
                    ┌────────────┘      └─────────────┐
                    │                                  │
           ┌────────▼────────┐              ┌─────────▼────────┐
           │  Optimization   │              │  WA Gateway      │
           │  Service        │              │  (WhatsApp API)  │
           │  (FastAPI)      │              └──────────────────┘
           └─────────────────┘
```

**Flow:**
1. **Mobile/Admin** → Buat order → **Backend**
2. **Backend** → Request optimized route → **optimization/**
3. **optimization/** → Return optimized route dengan waypoints
4. **Backend** → Assign ke driver + Send notification → **wa-gateaway/**
5. **Mobile Driver** → Navigate using optimized route
6. **Mobile Customer** → Track delivery real-time

---

## 🚀 Quick Start

### Development
```bash
# Terminal 1: Backend
cd backend && php artisan serve

# Terminal 2: Frontend dev server
cd backend && npm run dev

# Terminal 3: Optimization service
cd optimization && source .venv/bin/activate && python app.py

# Terminal 4: WA Gateway
cd wa-gateaway && npm start

# Terminal 5: Mobile
cd mobile && flutter run
```

### Production Build
```bash
# Backend
cd backend && npm run build

# Mobile
cd mobile && flutter build apk --release

# Optimization service runs as-is dengan uvicorn
# WA Gateway runs dengan pm2 atau systemd
```

---

## 📝 Environment Variables

### Backend (.env)
```env
APP_NAME="Delivery App"
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=delivery
DB_USERNAME=root
DB_PASSWORD=
```

### Optimization (algorithm/config.py)
```python
# Kendari coordinates
MAP_CENTER = (-3.9778, 122.5151)
CITY_NAME = "Kendari, Indonesia"

# GA parameters
POPULATION_SIZE = 100
GENERATIONS = 200
```

### Mobile (lib/config/)
```dart
const String apiBaseUrl = 'http://localhost:8000/api';
```

---

## 🛠️ Development Guidelines

### Backend (Laravel + Inertia)
- **View-based folder structure**: Setiap view punya folder sendiri dengan components/hooks/schemas
- **Naming convention**: kebab-case untuk filenames
- **Controller paths**: Sesuaikan dengan folder struktur (`admin/users/index/index`)

### Optimization Service
- **JANGAN** tambah file baru di `algorithm/` atau `service/`
- **Cache** HARUS di `algorithm/cache/`
- **JANGAN** import numpy di `config.py`
- Gunakan relative imports

### Mobile
- Follow Flutter best practices
- Use Riverpod untuk state management
- Implement proper error handling dengan HTTP interceptor

---

## 📚 Dokumentasi Tambahan

- [Optimization Service Guide](optimization/README.md)
- [Frontend Integration](optimization/FRONTEND_GUIDE.md)
- [OSRM Integration](optimization/OSRM_INTEGRATION.md)
- [Backend API Driver Stats](mobile/BACKEND_API_DRIVER_STATS.md)
- [Riverpod Guide](mobile/RIVERPOD_GUIDE.md)
- [HTTP Interceptor Guide](mobile/HTTP_INTERCEPTOR_GUIDE.md)
- [WA Gateway Architecture](wa-gateaway/ARCHITECTURE.md)
- [WA Gateway QR Setup](wa-gateaway/README-QR.md)

---

## 🤝 Contributing

1. Clone repository
2. Create feature branch
3. Follow coding standards per komponen
4. Test thoroughly
5. Submit pull request

---

## 📄 License

Proprietary - Delivery Optimization Project Kendari

---

## 👥 Team

Delivery Optimization Team - Kendari, Indonesia 🇮🇩
