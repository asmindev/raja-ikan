<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visitor extends Model
{
    protected $fillable = [
        'ip_address',
        'session_id',
        'user_agent',
        'device_type',
        'browser',
        'platform',
        'url',
        'visited_at',
    ];

    protected $casts = [
        'visited_at' => 'datetime',
    ];
}
