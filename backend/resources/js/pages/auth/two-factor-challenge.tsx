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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function TwoFactorChallenge() {
    const [recovery, setRecovery] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/two-factor-challenge');
    };

    return (
        <>
            <Head title="Two-Factor Authentication" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">
                            Two-Factor Authentication
                        </CardTitle>
                        <CardDescription>
                            {recovery
                                ? 'Please confirm access to your account by entering one of your emergency recovery codes.'
                                : 'Please confirm access to your account by entering the authentication code provided by your authenticator application.'}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent>
                            <Tabs
                                defaultValue="code"
                                value={recovery ? 'recovery' : 'code'}
                                onValueChange={(value) =>
                                    setRecovery(value === 'recovery')
                                }
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="code">Code</TabsTrigger>
                                    <TabsTrigger value="recovery">
                                        Recovery Code
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="code" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">
                                            Authentication Code
                                        </Label>
                                        <Input
                                            id="code"
                                            type="text"
                                            value={data.code}
                                            onChange={(e) =>
                                                setData('code', e.target.value)
                                            }
                                            autoFocus
                                            autoComplete="one-time-code"
                                            placeholder="000000"
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-destructive">
                                                {errors.code}
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>
                                <TabsContent
                                    value="recovery"
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="recovery_code">
                                            Recovery Code
                                        </Label>
                                        <Input
                                            id="recovery_code"
                                            type="text"
                                            value={data.recovery_code}
                                            onChange={(e) =>
                                                setData(
                                                    'recovery_code',
                                                    e.target.value,
                                                )
                                            }
                                            autoComplete="one-time-code"
                                            placeholder="abcd-efgh-ijkl"
                                        />
                                        {errors.recovery_code && (
                                            <p className="text-sm text-destructive">
                                                {errors.recovery_code}
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? 'Verifying...' : 'Verify'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}
