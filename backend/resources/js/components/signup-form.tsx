import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">
                                    Create your account
                                </h1>
                                <p className="text-sm text-balance text-muted-foreground">
                                    Enter your details below to create your
                                    account
                                </p>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    autoFocus
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                                <FieldDescription>
                                    We&apos;ll use this to contact you. We will
                                    not share your email with anyone else.
                                </FieldDescription>
                            </Field>
                            <Field>
                                <Field className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="password">
                                            Password
                                        </FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
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
                                                setData(
                                                    'password_confirmation',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </Field>
                                </Field>
                                <FieldDescription>
                                    Must be at least 8 characters long.
                                </FieldDescription>
                            </Field>
                            <Field>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Creating Account...'
                                        : 'Create Account'}
                                </Button>
                            </Field>
                            <FieldDescription className="text-center">
                                Already have an account?{' '}
                                <Link
                                    href={route('login')}
                                    className="underline"
                                >
                                    Sign in
                                </Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="relative hidden bg-muted md:block">
                        <img
                            src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=1965&auto=format&fit=crop"
                            alt="Delivery service"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
