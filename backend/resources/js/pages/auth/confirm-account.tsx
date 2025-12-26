import { OtpStep } from '@/components/registration/otp-step';
import { Card, CardContent } from '@/components/ui/card';
import { Head } from '@inertiajs/react';

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
                <div className="w-full max-w-md">
                    <Card>
                        <CardContent className="pt-6">
                            <OtpStep
                                phone={user.phone}
                                onVerified={handleOtpVerified}
                                onBack={handleBack}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
