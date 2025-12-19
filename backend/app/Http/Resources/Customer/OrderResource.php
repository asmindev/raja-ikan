<?php

namespace App\Http\Resources\Customer;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'status' => $this->status,
            'total' => (float) $this->total,
            'address' => $this->address,
            'latitude' => $this->latitude ? (float) $this->latitude : null,
            'longitude' => $this->longitude ? (float) $this->longitude : null,
            'notes' => $this->notes,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'estimated' => $this->estimated?->format('Y-m-d H:i:s'),
            'delivery_at' => $this->delivery_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),

            // Customer info
            'customer' => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'phone' => $this->customer->phone,
            ],

            // Driver info (jika sudah ada)
            'driver' => $this->when($this->driver, [
                'id' => $this->driver?->id,
                'name' => $this->driver?->name,
                'phone' => $this->driver?->phone,
            ]),

            // Order items
            'items' => $this->orderLines->map(function ($line) {
                return [
                    'id' => $line->id,
                    'product_id' => $line->product_id,
                    'product_name' => $line->product->name,
                    'quantity' => $line->quantity,
                    'price' => (float) $line->price,
                    'subtotal' => (float) ($line->quantity * $line->price),
                ];
            }),

            // Status timeline
            'timeline' => [
                'created' => $this->created_at->format('Y-m-d H:i:s'),
                'confirmed' => $this->confirmed_at?->format('Y-m-d H:i:s'),
                'accepted' => $this->accepted_at?->format('Y-m-d H:i:s'),
                'pickup' => $this->pickup_at?->format('Y-m-d H:i:s'),
                'delivering' => $this->delivering_at?->format('Y-m-d H:i:s'),
                'delivered' => $this->completed_at?->format('Y-m-d H:i:s'),
                'cancelled' => $this->cancelled_at?->format('Y-m-d H:i:s'),
            ],
        ];
    }
}
