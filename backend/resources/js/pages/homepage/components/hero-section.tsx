import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function HeroSection() {
    const [search, setSearch] = useState('');

    return (
        <section className="relative py-24 lg:py-32">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
                        Premium Seafood, <br />
                        <span className="text-zinc-500 dark:text-zinc-400">
                            Delivered Fresh.
                        </span>
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                        Experience the finest selection of ocean-fresh catch,
                        sourced daily from local fishermen. Quality you can
                        taste, freshness you can trust.
                    </p>

                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <div className="relative w-full max-w-md">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search
                                    className="h-5 w-5 text-zinc-400"
                                    aria-hidden="true"
                                />
                            </div>
                            <Input
                                type="text"
                                className="block w-full rounded-full border-0 bg-zinc-100 py-4 pl-10 text-zinc-900 ring-1 ring-zinc-300 ring-inset placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:focus:ring-zinc-500"
                                placeholder="Search for salmon, tuna, shrimp..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
