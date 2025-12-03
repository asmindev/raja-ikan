<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    protected $fillable = [
        'status',
        'total',
        'customer_id',
        'driver_id',
        'address',
        'estimated',
        'accepted_at',
        'pickup_at',
        'delivering_at',
        'delivery_at',
        'cancelled_at',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'estimated' => 'datetime',
        'accepted_at' => 'datetime',
        'pickup_at' => 'datetime',
        'delivering_at' => 'datetime',
        'delivery_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function orderLines()
    {
        return $this->hasMany(OrderLine::class);
    }

    public function lines()
    {
        return $this->hasMany(OrderLine::class);
    }

    public function routes()
    {
        return $this->belongsToMany(Route::class, 'route_orders')->withPivot('sequence');
    }

    // Accessor untuk items
    protected $appends = ['items'];

    public function getItemsAttribute()
    {
        return $this->orderLines->map(function ($line) {
            return [
                'id' => $line->id,
                'product_name' => $line->product->name ?? 'Unknown Product',
                'quantity' => $line->quantity,
                'price' => $line->price,
                'subtotal' => $line->subtotal,
            ];
        });
    }
}
