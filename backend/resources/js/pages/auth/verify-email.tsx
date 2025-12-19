import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail } from 'lucide-react';

interface Props {
    status?: string;
}

export default function VerifyEmail({ status }: Props) {
    const { post, processing } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <>
            <Head title="Email Verification" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Verify Your Email
                        </CardTitle>
                        <CardDescription>
                            Thanks for signing up! Before getting started, could
                            you verify your email address by clicking on the
                            link we just emailed to you?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {status === 'verification-link-sent' && (
                            <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <form onSubmit={submit} className="w-full">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Sending...'
                                    : 'Resend Verification Email'}
                            </Button>
                        </form>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-center text-sm text-muted-foreground hover:text-primary"
                        >
                            Logout
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
