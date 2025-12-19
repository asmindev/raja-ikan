import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    status?: string;
}

export default function ForgotPassword({ status }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Forgot Password" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">
                            Forgot Password
                        </CardTitle>
                        <CardDescription>
                            Enter your email and we'll send you a password reset
                            link
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            {status && (
                                <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                                    {status}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                    autoFocus
                                    placeholder="you@example.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? 'Sending...' : 'Send Reset Link'}
                            </Button>

                            <Link
                                href={route('login')}
                                className="text-center text-sm text-primary hover:underline"
                            >
                                Back to login
                            </Link>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}
