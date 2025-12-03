<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    protected $fillable = [
        'driver_id',
        'status',
        'total_distance',
        'estimated_duration',
        'osrm_url',
        'waypoints',
        'optimized_order',
        'legs',
        'geometry',
        'optimized_at',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'total_distance' => 'decimal:2',
        'estimated_duration' => 'integer',
        'waypoints' => 'array',
        'optimized_order' => 'array',
        'legs' => 'array',
        'geometry' => 'array',
        'optimized_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'route_orders')->withPivot('sequence')->orderBy('sequence');
    }
}
