import { OtpStep } from '@/components/registration/otp-step';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Shield } from 'lucide-react';

interface Props {
    user: {
        phone: string;
    };
}

export default function ConfirmAccount({ user }: Props) {
    const handleOtpVerified = () => {
        // Redirect to dashboard after successful verification
        window.location.href = '/customer/dashboard';
    };

    const handleBack = () => {
        // Logout and go back to registration
        window.location.href = '/register';
    };

    return (
        <>
            <Head title="Confirm Your Account" />

            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Shield className="mx-auto h-12 w-12 text-primary" />
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Confirm Your Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your account was created but needs verification.
                            Please enter the OTP sent to your phone number.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Phone Verification</CardTitle>
                            <CardDescription>
                                We've sent a 6-digit code to{' '}
                                <strong>{user.phone}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OtpStep
                                phone={user.phone}
                                onVerified={handleOtpVerified}
                                onBack={handleBack}
                            />
                        </CardContent>
                    </Card>

                    <div className="text-center">
                        <Link href="/register">
                            <Button variant="ghost" className="text-sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Registration
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
