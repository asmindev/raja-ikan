import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import axios from 'axios';
import { ArrowLeft, Check, Clock, Shield } from 'lucide-react';
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
    const [otpSent, setOtpSent] = useState(false);

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
            setOtpSent(true);
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
                    error.response?.data?.message || 'Failed to send OTP',
                );
            }
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.error('Please enter the complete 6-digit OTP');
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
            const message =
                error.response?.data?.message || 'Verification failed';
            const attemptsRemaining = error.response?.data?.attempts_remaining;

            if (attemptsRemaining !== undefined) {
                toast.error(
                    `${message} (${attemptsRemaining} attempts remaining)`,
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
        <div>
            <FieldGroup>
                <div className="mb-6 flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-primary/10 p-3">
                        <Shield className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Verify Your Number</h2>
                    <p className="text-sm text-muted-foreground">
                        We've sent a 6-digit code to
                    </p>
                    <p className="text-sm font-semibold">{phone}</p>
                </div>

                {otpSent && (
                    <div className="rounded-lg bg-muted p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>
                                {timeLeft > 0 ? (
                                    <>
                                        Code expires in{' '}
                                        <strong>{formatTime(timeLeft)}</strong>
                                    </>
                                ) : (
                                    <span className="text-red-600">
                                        Code expired
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                )}

                <Field>
                    <FieldLabel className="text-center">
                        Enter OTP Code
                    </FieldLabel>
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
                    <FieldDescription className="text-center">
                        Enter the 6-digit code from WhatsApp
                    </FieldDescription>
                </Field>

                <Button
                    type="button"
                    onClick={handleVerify}
                    disabled={otp.length !== 6 || isVerifying || isLoading}
                    className="w-full"
                >
                    {isVerifying || isLoading ? (
                        'Verifying...'
                    ) : (
                        <>
                            <Check className="mr-2 h-4 w-4" /> Verify & Complete
                        </>
                    )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Didn't receive the code?{' '}
                    {canResend ? (
                        <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-primary"
                            onClick={sendOtp}
                            disabled={isSendingOtp}
                        >
                            {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                        </Button>
                    ) : (
                        <span>Wait {formatTime(timeLeft)}</span>
                    )}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="w-full"
                    disabled={isVerifying || isLoading}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </FieldGroup>
        </div>
    );
}
