# Mobile Orders UI

A minimal Flutter UI that fetches orders from the Laravel backend at `/api/v1/orders` and displays them in a paginated list.

## Configure API base URL

By default:

-   Android emulator uses `http://10.0.2.2:8000`
-   iOS/macOS/Linux/Windows/web use `http://localhost:8000`

You can override at build time:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:8000
```

## Run

1. Start Laravel dev server from `backend/`:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

1. From `mobile/`, get packages and run:

```bash
flutter pub get
flutter run
```

## API

`GET /api/v1/orders?per_page=20&page=1&status=pending&search=keyword`
Returns Laravel pagination payload with `data` array.
