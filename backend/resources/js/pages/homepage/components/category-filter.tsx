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
            <div className="flex flex-wrap items-center justify-center gap-6 border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <button
                    onClick={() => handleSelect(null)}
                    className={cn(
                        'text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100',
                        selected === null
                            ? 'text-zinc-900 dark:text-zinc-100'
                            : 'text-zinc-500 dark:text-zinc-400',
                    )}
                >
                    Semua Produk
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleSelect(category)}
                        className={cn(
                            'text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100',
                            selected === category
                                ? 'text-zinc-900 dark:text-zinc-100'
                                : 'text-zinc-500 dark:text-zinc-400',
                        )}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
