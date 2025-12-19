<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'customer';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'address' => 'required|string|min:10',
            'latitude' => 'required|numeric|min:-90|max:90',
            'longitude' => 'required|numeric|min:-180|max:180',
            'payment_method' => 'required|in:cash,transfer,ewallet',
            'notes' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'address.required' => 'Alamat pengiriman harus diisi',
            'address.min' => 'Alamat terlalu pendek (minimal 10 karakter)',
            'latitude.required' => 'Koordinat lokasi harus dipilih',
            'payment_method.required' => 'Metode pembayaran harus dipilih',
            'payment_method.in' => 'Metode pembayaran tidak valid',
        ];
    }
}
