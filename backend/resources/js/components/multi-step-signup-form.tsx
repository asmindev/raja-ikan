import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Stepper } from '@/components/ui/stepper';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { ArrowRight, Mail, Phone, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import { LocationStep } from './registration/location-step';
import { OtpStep } from './registration/otp-step';

const steps = [
    { id: 1, title: 'Personal Info', description: 'Basic details' },
    { id: 2, title: 'Location', description: 'Choose address' },
    { id: 3, title: 'Verify', description: 'OTP verification' },
];

interface RegistrationData {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    latitude: number | null;
    longitude: number | null;
    address: string;
    otp_verified: boolean;
}

export function MultiStepSignupForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<RegistrationData>({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        latitude: null,
        longitude: null,
        address: '',
        otp_verified: false,
    });
    const [errors, setErrors] = useState<
        Partial<Record<keyof RegistrationData, string>>
    >({});

    const handleStep1Submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validate step 1
        const newErrors: Partial<Record<keyof RegistrationData, string>> = {};

        if (!data.name.trim()) newErrors.name = 'Name is required';
        if (!data.email.trim()) newErrors.email = 'Email is required';
        if (!data.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!data.password) newErrors.password = 'Password is required';
        if (data.password.length < 8)
            newErrors.password = 'Password must be at least 8 characters';
        if (data.password !== data.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setCurrentStep(2);
    };

    const handleStep2Complete = async (
        latitude: number,
        longitude: number,
        address: string,
    ) => {
        setIsLoading(true);

        try {
            // Create user account (pending verification) after location is set
            const response = await axios.post('/auth/register', {
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
                password_confirmation: data.password_confirmation,
                latitude,
                longitude,
                address,
            });

            // Update local data
            setData({ ...data, latitude, longitude, address });

            toast.success(
                'Account created! Please verify your phone number to activate your account.',
            );

            // Proceed to OTP step
            setCurrentStep(3);
        } catch (error: any) {
            if (error.response?.data?.errors) {
                const backendErrors = error.response.data.errors;
                const formattedErrors: Partial<
                    Record<keyof RegistrationData, string>
                > = {};

                Object.keys(backendErrors).forEach((key) => {
                    formattedErrors[key as keyof RegistrationData] =
                        backendErrors[key][0];
                });

                setErrors(formattedErrors);
                toast.error('Please check your information and try again.');

                // Go back to step 1 if there are validation errors
                setCurrentStep(1);
            } else {
                toast.error(
                    error.response?.data?.message || 'Failed to create account',
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpVerified = () => {
        // OTP verification is handled by OtpStep component
        // If successful, user will be redirected by the backend
        toast.success('Account verified successfully!');
        window.location.href = '/customer/dashboard';
    };

    // Remove completeRegistration function as it's no longer needed

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="p-6 md:p-8">
                    {/* Stepper */}
                    <Stepper
                        steps={steps}
                        currentStep={currentStep}
                        className="mb-8"
                    />

                    {/* Step 1: Personal Info */}
                    {currentStep === 1 && (
                        <form onSubmit={handleStep1Submit}>
                            <FieldGroup>
                                <div className="mb-6 flex flex-col items-center gap-2 text-center">
                                    <h1 className="text-2xl font-bold">
                                        Create your account
                                    </h1>
                                    <p className="text-sm text-balance text-muted-foreground">
                                        Enter your details to get started
                                    </p>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="name">
                                        Full Name
                                    </FieldLabel>
                                    <div className="relative">
                                        <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            className="pl-10"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    name: e.target.value,
                                                })
                                            }
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="email">
                                        Email
                                    </FieldLabel>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            className="pl-10"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    email: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="phone">
                                        WhatsApp Number
                                    </FieldLabel>
                                    <div className="relative">
                                        <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="08123456789"
                                            className="pl-10"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    phone: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-sm text-red-600">
                                            {errors.phone}
                                        </p>
                                    )}
                                    <FieldDescription>
                                        We'll send an OTP to verify your number
                                    </FieldDescription>
                                </Field>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="password">
                                            Password
                                        </FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    password: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        {errors.password && (
                                            <p className="text-sm text-red-600">
                                                {errors.password}
                                            </p>
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="password_confirmation">
                                            Confirm Password
                                        </FieldLabel>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    password_confirmation:
                                                        e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        {errors.password_confirmation && (
                                            <p className="text-sm text-red-600">
                                                {errors.password_confirmation}
                                            </p>
                                        )}
                                    </Field>
                                </div>

                                <Button type="submit" className="w-full">
                                    Continue{' '}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>

                                <FieldDescription className="text-center">
                                    Already have an account?{' '}
                                    <Link href="/login" className="underline">
                                        Sign in
                                    </Link>
                                </FieldDescription>
                            </FieldGroup>
                        </form>
                    )}

                    {/* Step 2: Location */}
                    {currentStep === 2 && (
                        <LocationStep
                            onComplete={handleStep2Complete}
                            onBack={() => setCurrentStep(1)}
                        />
                    )}

                    {/* Step 3: OTP Verification */}
                    {currentStep === 3 && (
                        <OtpStep
                            phone={data.phone}
                            onVerified={handleOtpVerified}
                            onBack={() => setCurrentStep(2)}
                            isLoading={isLoading}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
