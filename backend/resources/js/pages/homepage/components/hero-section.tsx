import { Input } from '@/components/ui/input';
import { router, usePage } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HeroSection() {
    const { url } = usePage();
    const [search, setSearch] = useState('');

    // Check if there's an active search query
    const hasActiveSearch = new URLSearchParams(url.split('?')[1]).has('q');

    useEffect(() => {
        // Get search query from URL if exists
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get('q');
        if (queryParam) {
            setSearch(queryParam);
        }
    }, [url]);

    const handleSearch = () => {
        if (search.trim()) {
            router.visit(route('home', { q: search.trim() }), {
                method: 'get',
                preserveState: true,
            });
        }
    };

    const handleClearSearch = () => {
        setSearch('');
        router.visit(route('home'), {
            method: 'get',
            preserveState: true,
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <section className="relative px-4 py-18 sm:px-0">
            <div className="container mx-auto rounded-xl bg-blue-100 px-4 py-8 lg:py-12 dark:bg-blue-900">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
                        Seafood Premium, <br />
                        <span className="text-zinc-500 dark:text-zinc-400">
                            Dikirim Segar.
                        </span>
                    </h1>

                    <p className="mt-6 hidden text-lg leading-8 text-zinc-600 sm:block dark:text-zinc-400">
                        Rasakan pilihan terbaik hasil laut segar, dipanen harian
                        dari nelayan lokal. Kualitas yang bisa Anda rasakan,
                        kesegaran yang bisa Anda percaya.
                    </p>

                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <div className="relative mx-auto w-10/12 max-w-md">
                            <Input
                                type="text"
                                className="block w-full rounded-full border-0 bg-zinc-100 py-4 pr-12 pl-6 text-zinc-900 ring-1 ring-zinc-300 ring-inset placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:focus:ring-zinc-500"
                                placeholder="Cari salmon, tuna, udang..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                type="button"
                                onClick={
                                    hasActiveSearch
                                        ? handleClearSearch
                                        : handleSearch
                                }
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            >
                                {hasActiveSearch ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Search className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
