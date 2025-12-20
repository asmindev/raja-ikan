# Backend API - Driver Stats Endpoint

## 1. Buat Controller: `app/Http/Controllers/Driver/StatsController.php`

```php
<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    /**
     * Get driver statistics
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // Get delivery stats for this driver
            $stats = DB::table('orders')
                ->where('driver_id', $user->id)
                ->select([
                    DB::raw('COUNT(*) as total_deliveries'),
                    DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_deliveries'),
                    DB::raw('SUM(CASE WHEN status IN ("assigned", "picked_up", "delivering") THEN 1 ELSE 0 END) as ongoing_deliveries'),
                    DB::raw('SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled_deliveries'),
                    DB::raw('SUM(CASE WHEN status = "completed" THEN delivery_fee ELSE 0 END) as total_earnings'),
                ])
                ->first();

            // Get average rating (if you have ratings table)
            // $averageRating = DB::table('ratings')
            //     ->where('driver_id', $user->id)
            //     ->avg('rating');

            return response()->json([
                'data' => [
                    'total_deliveries' => (int) ($stats->total_deliveries ?? 0),
                    'completed_deliveries' => (int) ($stats->completed_deliveries ?? 0),
                    'ongoing_deliveries' => (int) ($stats->ongoing_deliveries ?? 0),
                    'cancelled_deliveries' => (int) ($stats->cancelled_deliveries ?? 0),
                    'total_earnings' => (float) ($stats->total_earnings ?? 0),
                    'average_rating' => null, // Implement if you have ratings
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get driver statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
```

## 2. Tambahkan Route di `routes/api.php` atau file route yang sesuai

Tambahkan di dalam middleware auth:sanctum untuk driver:

```php
// Driver routes
Route::middleware(['auth:sanctum'])->prefix('driver')->group(function () {
    Route::get('/stats', [App\Http\Controllers\Driver\StatsController::class, 'index']);
});
```

Atau jika sudah ada group driver, tambahkan di dalamnya:

```php
Route::middleware(['auth:sanctum', 'role:driver'])->prefix('driver')->group(function () {
    // ... existing routes ...
    Route::get('/stats', [App\Http\Controllers\Driver\StatsController::class, 'index']);
});
```

## 3. Test Endpoint

Jalankan test dengan curl atau Postman:

```bash
curl -X GET http://localhost:8000/api/driver/stats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

Expected Response:

```json
{
    "data": {
        "total_deliveries": 10,
        "completed_deliveries": 8,
        "ongoing_deliveries": 1,
        "cancelled_deliveries": 1,
        "total_earnings": 150000.0,
        "average_rating": null
    }
}
```

## 4. Catatan

-   Sesuaikan nama kolom dengan struktur database Anda
-   Sesuaikan status order dengan yang ada di database ('completed', 'assigned', dll)
-   Jika kolom `driver_id` berbeda, sesuaikan
-   Jika kolom `delivery_fee` berbeda (misalnya `total` atau `amount`), sesuaikan
-   Tambahkan middleware role jika perlu memastikan hanya driver yang bisa akses

## 5. Migration (Opsional)

Jika kolom `delivery_fee` belum ada di table orders:

```bash
php artisan make:migration add_delivery_fee_to_orders_table
```

```php
public function up()
{
    Schema::table('orders', function (Blueprint $table) {
        $table->decimal('delivery_fee', 10, 2)->default(0)->after('total');
    });
}
```
