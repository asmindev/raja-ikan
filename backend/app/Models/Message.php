<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'from_number',
        'message_text',
        'message_timestamp',
        'message_type',
        'raw_data',
    ];

    protected $casts = [
        'message_timestamp' => 'datetime',
        'raw_data' => 'array',
    ];
}
