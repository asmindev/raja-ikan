import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface OtpStepProps {
    phone: string;
    onVerified: () => void;
    onBack: () => void;
    isLoading?: boolean;
}

export function OtpStep({
    phone,
    onVerified,
    onBack,
    isLoading,
}: OtpStepProps) {
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
    const [isVerifying, setIsVerifying] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    // Send initial OTP on mount
    useEffect(() => {
        sendOtp();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const sendOtp = async () => {
        setIsSendingOtp(true);
        console.log('Sending OTP to', phone);

        try {
            const response = await axios.post('/auth/send-otp', { phone });

            toast.success(response.data.message);
            setTimeLeft(120); // Reset timer
            setCanResend(false);
        } catch (error: any) {
            if (error.response?.status === 429) {
                const cooldown = error.response.data.cooldown;
                toast.error(error.response.data.message);
                setTimeLeft(cooldown);
            } else if (error.response?.status === 422) {
                // Validation error (phone already registered)
                const message =
                    error.response?.data?.message ||
                    error.response?.data?.errors?.phone?.[0] ||
                    'Failed to send OTP';
                toast.error(message);
            } else {
                toast.error(
                    error.response?.data?.message || 'Gagal mengirim OTP',
                );
            }
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.error('Silakan masukkan OTP 6 digit lengkap');
            return;
        }

        setIsVerifying(true);

        try {
            const response = await axios.post('/auth/verify-otp', {
                phone,
                code: otp,
            });

            if (response.data.success) {
                toast.success(response.data.message);

                // Check if account was activated (for registration flow)
                if (response.data.account_activated) {
                    // Redirect to dashboard after a short delay
                    setTimeout(() => {
                        window.location.href =
                            response.data.redirect || '/customer/dashboard';
                    }, 1000);
                }

                onVerified();
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Verifikasi gagal';
            const attemptsRemaining = error.response?.data?.attempts_remaining;

            if (attemptsRemaining !== undefined) {
                toast.error(
                    `${message} (${attemptsRemaining} percobaan tersisa)`,
                );
            } else {
                toast.error(message);
            }

            setOtp(''); // Clear OTP on error
        } finally {
            setIsVerifying(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-lg font-semibold">Verifikasi Telepon</h2>
                <p className="text-sm text-muted-foreground">
                    Kode dikirim ke{' '}
                    <span className="font-medium text-foreground">{phone}</span>
                </p>
            </div>

            <div className="flex justify-center">
                <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isVerifying || isLoading}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            <div className="space-y-4">
                <Button
                    type="button"
                    onClick={handleVerify}
                    disabled={otp.length !== 6 || isVerifying || isLoading}
                    className="w-full"
                >
                    {isVerifying ? 'Memverifikasi...' : 'Verifikasi Kode'}
                </Button>

                <div className="flex items-center justify-between text-sm">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isVerifying || isLoading}
                        className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        Kembali
                    </button>

                    <div className="text-right">
                        {canResend ? (
                            <button
                                type="button"
                                onClick={sendOtp}
                                disabled={isSendingOtp}
                                className="font-medium text-primary transition-all hover:underline"
                            >
                                {isSendingOtp
                                    ? 'Mengirim...'
                                    : 'Kirim Ulang Kode'}
                            </button>
                        ) : (
                            <span className="text-muted-foreground">
                                Kirim ulang dalam {formatTime(timeLeft)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
