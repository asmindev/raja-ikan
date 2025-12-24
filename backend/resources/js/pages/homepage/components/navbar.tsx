import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { Link, usePage } from '@inertiajs/react';
import { Fish, ShoppingBag } from 'lucide-react';

export function Navbar() {
    const { props } = usePage();
    const user = props.auth?.user;
    const { openCart, items } = useCart();

    return (
        <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
                >
                    <Fish className="h-5 w-5" />
                    <span>Raja Ikan</span>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                        onClick={openCart}
                    >
                        <ShoppingBag className="h-5 w-5" />
                        {items.length > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                                {items.length}
                            </span>
                        )}
                    </Button>

                    <ModeToggle />

                    {user ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                            <Link
                                href={
                                    user.role === 'admin'
                                        ? '/admin/dashboard'
                                        : '/customer/dashboard'
                                }
                            >
                                Dashboard
                            </Link>
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                            >
                                Login
                            </Link>
                            <Button
                                size="sm"
                                asChild
                                className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                <Link href="/register">Get Started</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
