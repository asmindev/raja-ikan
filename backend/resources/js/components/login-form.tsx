import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form onSubmit={submit} className="p-6 md:p-8">
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">
                                    Selamat datang kembali
                                </h1>
                                <p className="text-balance text-muted-foreground">
                                    Masuk ke akun pengiriman Anda
                                </p>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="anda@contoh.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                    autoFocus
                                    autoComplete="username"
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">
                                        Password
                                    </FieldLabel>
                                    <Link
                                        href={route('password.request')}
                                        className="ml-auto text-sm underline-offset-2 hover:underline"
                                    >
                                        Lupa password Anda?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                    autoComplete="current-password"
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </Field>
                            <Field>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'remember',
                                                checked as boolean,
                                            )
                                        }
                                    />
                                    <FieldLabel
                                        htmlFor="remember"
                                        className="cursor-pointer text-sm font-normal"
                                    >
                                        Ingat saya
                                    </FieldLabel>
                                </div>
                            </Field>
                            <Field>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing ? 'Sedang masuk...' : 'Masuk'}
                                </Button>
                            </Field>
                            <FieldDescription className="text-center">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href={route('register')}
                                    className="underline"
                                >
                                    Daftar
                                </Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="relative hidden bg-muted md:block">
                        <img
                            src="https://images.unsplash.com/photo-1605902711834-8b11c3e3ef2f?w=800&auto=format&fit=crop&q=80"
                            alt="Delivery"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                Dengan mengklik lanjutkan, Anda menyetujui{' '}
                <a href="#" className="underline">
                    Ketentuan Layanan
                </a>{' '}
                dan{' '}
                <a href="#" className="underline">
                    Kebijakan Privasi
                </a>{' '}
                kami.
            </FieldDescription>
        </div>
    );
}
