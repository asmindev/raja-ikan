<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'price',
        'stock',
        'image',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    protected $appends = ['image'];

    public function orderLines()
    {
        return $this->hasMany(OrderLine::class);
    }

    public function getImageAttribute()
    {
        $imagePath = $this->attributes['image'] ?? null;

        // If no image, return placeholder
        if (!$imagePath) {
            return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png';
        }

        // If starts with http or https, return as is (external URL)
        if (str_starts_with($imagePath, 'http')) {
            return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png';
        }

        // Return local storage URL
        return asset('storage/' . $imagePath);
    }
}
