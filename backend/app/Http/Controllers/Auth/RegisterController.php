<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class RegisterController extends Controller
{
    protected $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Send OTP to phone number
     */
    public function sendOtp(Request $request)
    {
        // Different validation rules for registration vs confirm account
        $isConfirmAccount = auth()->check();

        $rules = [
            'phone' => 'required|string|min:10|max:15',
        ];

        $messages = [];

        // Only validate unique phone for registration (not logged in users)
        if (!$isConfirmAccount) {
            // Check if phone exists and is ACTIVE
            $activeUser = User::where('phone', $request->phone)->where('is_active', true)->first();
            if ($activeUser) {
                throw ValidationException::withMessages([
                    'phone' => ['Nomor telepon ini sudah terdaftar. Silakan gunakan nomor lain atau login.'],
                ]);
            }
        }

        $request->validate($rules, $messages);

        $phone = $request->phone;

        // For confirm account, ensure the phone matches the authenticated user's phone
        if ($isConfirmAccount) {
            $user = auth()->user();
            if ($user->phone !== $phone) {
                return response()->json([
                    'success' => false,
                    'message' => 'Phone number does not match your account.',
                ], 422);
            }
        }

        $key = 'otp:' . $phone;

        // Rate limiting: max 3 requests per 10 minutes
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'phone' => ["Too many OTP requests. Please try again in {$seconds} seconds."],
            ]);
        }

        // Check cooldown
        if (!$this->otpService->canResendOtp($phone)) {
            $cooldown = $this->otpService->getResendCooldown($phone);

            return response()->json([
                'success' => false,
                'message' => "Please wait {$cooldown} seconds before requesting a new OTP.",
                'cooldown' => $cooldown,
            ], 429);
        }

        RateLimiter::hit($key, 600); // 10 minutes

        try {
            $otp = $this->otpService->createOtp($phone, 'phone');

            return response()->json([
                'success' => true,
                'message' => 'OTP sent successfully.',
                'expires_at' => $otp->expires_at->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            \Log::error('OTP Send Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP. Please try again.',
            ], 500);
        }
    }

    /**
     * Verify OTP code
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        $result = $this->otpService->verifyOtp($request->phone, $request->code);

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        // Check if user is already authenticated (confirm account flow)
        $authenticatedUser = auth()->user();
        if ($authenticatedUser && !$authenticatedUser->is_active && $authenticatedUser->phone === $request->phone) {
            // Activate the authenticated user's account
            $authenticatedUser->update(['is_active' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Account verified and activated successfully.',
                'redirect' => route('customer.dashboard'),
                'account_activated' => true,
            ]);
        }

        // Check if there's an inactive user with this phone number (pending registration verification)
        $user = User::where('phone', $request->phone)
            ->where('is_active', false)
            ->first();

        if ($user) {
            // Activate the user account
            $user->update(['is_active' => true]);

            // Auto-login
            auth()->login($user);

            return response()->json([
                'success' => true,
                'message' => 'Account verified and activated successfully.',
                'redirect' => route('customer.dashboard'),
                'account_activated' => true,
            ]);
        }

        return response()->json($result);
    }

    /**
     * Register user (pending verification)
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'phone' => 'required|string|max:15',
            'password' => 'required|string|min:8|confirmed',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'nullable|string|max:500',
        ], [
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        // Check for existing active users
        $activeUser = User::where('is_active', true)
            ->where(function ($query) use ($request) {
                $query->where('email', $request->email)
                    ->orWhere('phone', $request->phone);
            })
            ->first();

        if ($activeUser) {
            if ($activeUser->email === $request->email) {
                throw ValidationException::withMessages(['email' => 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.']);
            }
            throw ValidationException::withMessages(['phone' => 'Nomor telepon ini sudah terdaftar. Silakan gunakan nomor lain atau login.']);
        }

        // Delete any inactive users with same email or phone to avoid duplicates
        User::where('is_active', false)
            ->where(function ($query) use ($request) {
                $query->where('email', $request->email)
                    ->orWhere('phone', $request->phone);
            })
            ->delete();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'customer',
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'address' => $request->address,
            'is_active' => false, // User created but not yet verified
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully. Please verify your phone number.',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Show confirm account page for logged in but inactive users
     */
    public function showConfirmAccount(Request $request)
    {
        // Check if user is logged in
        if (!$request->user()) {
            return redirect('/login');
        }

        // Check if user is already active
        if ($request->user()->is_active) {
            return redirect('/customer/dashboard');
        }

        return Inertia::render('auth/confirm-account', [
            'user' => [
                'phone' => $request->user()->phone,
            ],
        ]);
    }
}
