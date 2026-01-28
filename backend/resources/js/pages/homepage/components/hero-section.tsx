import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        <section className="relative overflow-hidden px-4 py-12 lg:py-24">
            <div className="relative container mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 px-4 py-16 shadow-2xl lg:px-12 lg:py-24 dark:from-black dark:via-zinc-900 dark:to-blue-950">
                {/* Abstract Shapes */}
                <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute top-1/2 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/20 blur-3xl" />

                <div className="relative mx-auto max-w-4xl text-center">
                    <Badge
                        variant="secondary"
                        className="mb-6 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-blue-100 backdrop-blur-md"
                    >
                        ✨ Seafood Kualitas Ekspor
                    </Badge>

                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
                        Laut Segar di <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-teal-200 to-blue-200 bg-clip-text text-transparent">
                            Setiap Gigitan.
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100/80 sm:text-xl">
                        Langsung dari nelayan lokal pilihan. Jaminan kualitas
                        premium, dikirim segar setiap hari untuk keluarga Anda.
                    </p>

                    <div className="mt-10 flex items-center justify-center">
                        <div className="relative w-full max-w-lg transition-transform duration-300 hover:-translate-y-1">
                            <div className="group relative flex items-center overflow-hidden rounded-full bg-white/10 p-2 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl focus-within:bg-white/20 focus-within:ring-white/50">
                                <div className="flex shrink-0 items-center justify-center pr-2 pl-4">
                                    <Search className="h-5 w-5 text-blue-200" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full bg-transparent px-2 py-3 text-lg text-white placeholder:text-blue-200/50 focus:outline-none"
                                    placeholder="Cari ikan, udang, kepiting..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                {hasActiveSearch && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="mr-2 rounded-full p-1 text-blue-200 transition-colors hover:bg-white/10"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                                <Button
                                    onClick={handleSearch}
                                    className="hidden shrink-0 rounded-full bg-white px-6 py-2 font-semibold text-blue-900 transition-all hover:bg-blue-50 sm:flex"
                                >
                                    Cari
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-blue-200/60 sm:gap-x-12">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                            100% Segar
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                            Garansi Uang Kembali
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                            Pengiriman Cepat
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
