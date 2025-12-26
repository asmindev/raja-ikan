<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        $user = Auth::user();

        // Check if user account needs verification
        if (!$user->is_active) {
            return redirect()->route('auth.confirm-account');
        }

        if ($user->hasRole('admin')) {
            return redirect()->intended('/admin/dashboard');
        }

        if ($user->hasRole('driver')) {
            return redirect()->intended('/driver/dashboard');
        }

        if ($user->hasRole('customer')) {
            return redirect()->intended('/customer/dashboard');
        }

        // Default fallback
        return redirect()->intended('/customer/dashboard');
    }
}
