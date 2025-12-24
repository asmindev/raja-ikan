import { Link } from '@inertiajs/react';
import { Fish } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-zinc-200 bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        <Fish className="h-5 w-5" />
                        <span>Raja Ikan</span>
                    </div>

                    <div className="flex gap-8 text-sm text-zinc-600 dark:text-zinc-400">
                        <Link
                            href="#"
                            className="hover:text-zinc-900 dark:hover:text-zinc-50"
                        >
                            About
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-zinc-900 dark:hover:text-zinc-50"
                        >
                            Products
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-zinc-900 dark:hover:text-zinc-50"
                        >
                            Contact
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-zinc-900 dark:hover:text-zinc-50"
                        >
                            Privacy
                        </Link>
                    </div>

                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        &copy; {new Date().getFullYear()} Raja Ikan. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
