<?php

namespace App\Http\Resources\Customer;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'price' => (float) $this->product->price,
                'image' => $this->product->image ? asset('storage/' . $this->product->image) : null,
            ],
            'quantity' => $this->quantity,
            'subtotal' => (float) ($this->quantity * $this->product->price),
        ];
    }
}
