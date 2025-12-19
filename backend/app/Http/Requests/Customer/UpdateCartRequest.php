<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCartRequest extends FormRequest
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
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:99',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Product harus dipilih',
            'product_id.exists' => 'Product tidak ditemukan',
            'quantity.required' => 'Jumlah harus diisi',
            'quantity.min' => 'Jumlah minimal 1',
            'quantity.max' => 'Jumlah maksimal 99',
        ];
    }
}
