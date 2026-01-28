import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CategoryFilterProps {
    categories: string[];
    onCategoryChange?: (category: string | null) => void;
}

export function CategoryFilter({
    categories,
    onCategoryChange,
}: CategoryFilterProps) {
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (category: string | null) => {
        setSelected(category);
        onCategoryChange?.(category);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-zinc-200/50 pb-6 dark:border-zinc-800/50">
                <button
                    onClick={() => handleSelect(null)}
                    className={cn(
                        'rounded-full px-6 py-2 text-sm font-medium transition-all duration-300',
                        selected === null
                            ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 dark:bg-white dark:text-zinc-900'
                            : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-transparent dark:text-zinc-400 dark:hover:text-zinc-200',
                    )}
                >
                    Semua Produk
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleSelect(category)}
                        className={cn(
                            'rounded-full px-6 py-2 text-sm font-medium transition-all duration-300',
                            selected === category
                                ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 dark:bg-white dark:text-zinc-900'
                                : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-transparent dark:text-zinc-400 dark:hover:text-zinc-200',
                        )}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
