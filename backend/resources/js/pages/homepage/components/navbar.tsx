import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/cart-context';
import { Link, usePage } from '@inertiajs/react';
import { Fish, ShoppingBag, User } from 'lucide-react';

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
                <div className="flex items-center gap-2 md:gap-4">
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

                    {/* Desktop Auth */}
                    <div className="hidden items-center gap-2 md:flex">
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
                                    Dasbor
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                                >
                                    Masuk
                                </Link>
                                <Button
                                    size="sm"
                                    asChild
                                    className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                >
                                    <Link href="/register">Mulai</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Auth Dropdown */}
                    <div className="md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {user ? (
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={
                                                user.role === 'admin'
                                                    ? '/admin/dashboard'
                                                    : '/customer/dashboard'
                                            }
                                            className="w-full cursor-pointer"
                                        >
                                            Dasbor
                                        </Link>
                                    </DropdownMenuItem>
                                ) : (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/login"
                                                className="w-full cursor-pointer"
                                            >
                                                Masuk
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/register"
                                                className="w-full cursor-pointer"
                                            >
                                                Mulai
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    );
}
