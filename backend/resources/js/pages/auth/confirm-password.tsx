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
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/user/confirm-password');
    };

    return (
        <>
            <Head title="Confirm Password" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">
                            Confirm Password
                        </CardTitle>
                        <CardDescription>
                            This is a secure area of the application. Please
                            confirm your password before continuing.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                    autoFocus
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? 'Confirming...' : 'Confirm'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}
