import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Key } from 'lucide-react';
import { FormEventHandler } from 'react';

export function PasswordUpdateForm() {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle>Update Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Change Your Password
                        </h3>

                        <div className="space-y-4">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label htmlFor="current_password">
                                    Current Password *
                                </Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) =>
                                        setData(
                                            'current_password',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    placeholder="Enter your current password"
                                />
                                {errors.current_password && (
                                    <p className="text-sm text-red-500">
                                        {errors.current_password}
                                    </p>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                    placeholder="Enter new password"
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm New Password *
                                </Label>
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
                                    placeholder="Confirm new password"
                                />
                                {errors.password_confirmation && (
                                    <p className="text-sm text-red-500">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Password must be at least 8 characters long
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t pt-6">
                        {recentlySuccessful && (
                            <p className="text-sm text-green-600">
                                Password updated successfully!
                            </p>
                        )}
                        <Button
                            type="submit"
                            className="ml-auto gap-2"
                            disabled={processing}
                        >
                            <Key className="h-4 w-4" />
                            {processing ? 'Updating...' : 'Update Password'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
