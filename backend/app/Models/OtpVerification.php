<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpVerification extends Model
{
    protected $fillable = [
        'identifier',
        'code',
        'type',
        'expires_at',
        'attempts',
        'verified',
        'verified_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'verified' => 'boolean',
    ];

    /**
     * Check if OTP is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if max attempts reached
     */
    public function maxAttemptsReached(): bool
    {
        return $this->attempts >= 5;
    }

    /**
     * Increment verification attempts
     */
    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }

    /**
     * Mark as verified
     */
    public function markAsVerified(): void
    {
        $this->update([
            'verified' => true,
            'verified_at' => now(),
        ]);
    }
}
