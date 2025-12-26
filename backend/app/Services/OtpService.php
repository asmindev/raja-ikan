<?php

namespace App\Services;

use App\Models\OtpVerification;
use Carbon\Carbon;

class OtpService
{
    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }
    /**
     * Generate a 6-digit OTP code
     */
    protected function generateCode(): string
    {
        return str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create and send OTP
     */
    public function createOtp(string $identifier, string $type = 'phone'): OtpVerification
    {
        // Delete any existing unverified OTPs for this identifier
        OtpVerification::where('identifier', $identifier)
            ->where('verified', false)
            ->delete();

        // Create new OTP
        $otp = OtpVerification::create([
            'identifier' => $identifier,
            'code' => $this->generateCode(),
            'type' => $type,
            'expires_at' => Carbon::now()->addMinutes(2), // 2 minutes expiry
            'attempts' => 0,
            'verified' => false,
        ]);

        // Send OTP based on type
        if ($type === 'phone') {
            $this->whatsappService->sendOtp($identifier, $otp->code);
        } else {
            $this->sendOtpViaEmail($identifier, $otp->code);
        }

        return $otp;
    }

    /**
     * Verify OTP code
     */
    public function verifyOtp(string $identifier, string $code): array
    {
        $otp = OtpVerification::where('identifier', $identifier)
            ->where('verified', false)
            ->latest()
            ->first();

        if (!$otp) {
            return [
                'success' => false,
                'message' => 'OTP not found or already verified.',
            ];
        }

        if ($otp->isExpired()) {
            return [
                'success' => false,
                'message' => 'OTP has expired. Please request a new one.',
            ];
        }

        if ($otp->maxAttemptsReached()) {
            return [
                'success' => false,
                'message' => 'Maximum verification attempts reached. Please request a new OTP.',
            ];
        }

        if ($otp->code !== $code) {
            $otp->incrementAttempts();
            return [
                'success' => false,
                'message' => 'Invalid OTP code.',
                'attempts_remaining' => 5 - $otp->attempts,
            ];
        }

        // Mark as verified
        $otp->markAsVerified();

        return [
            'success' => true,
            'message' => 'OTP verified successfully.',
        ];
    }

    /**
     * Send OTP via Email
     */
    protected function sendOtpViaEmail(string $email, string $code): void
    {
        // TODO: Implement email sending using Laravel Mail
        \Log::info("OTP for {$email}: {$code}");
    }

    /**
     * Check if can resend OTP (rate limiting)
     */
    public function canResendOtp(string $identifier): bool
    {
        $lastOtp = OtpVerification::where('identifier', $identifier)
            ->latest()
            ->first();

        if (!$lastOtp) {
            return true;
        }

        // Allow resend after 30 seconds
        return $lastOtp->created_at->addSeconds(30)->isPast();
    }

    /**
     * Get remaining time before can resend
     */
    public function getResendCooldown(string $identifier): int
    {
        $lastOtp = OtpVerification::where('identifier', $identifier)
            ->latest()
            ->first();

        if (!$lastOtp) {
            return 0;
        }

        $canResendAt = $lastOtp->created_at->addSeconds(30);

        if ($canResendAt->isPast()) {
            return 0;
        }

        return $canResendAt->diffInSeconds(now());
    }
}
