<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = ['image'];

    public function orderLines()
    {
        return $this->hasMany(OrderLine::class);
    }

    public function getImageAttribute()
    {
        $imagePath = $this->attributes['image'] ?? null;
        // if starts with http or https, return as is
        if ($imagePath && (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://'))) {
            return $imagePath;
        }
        return $imagePath ? asset('storage/' . $imagePath) : null;
    }
}
