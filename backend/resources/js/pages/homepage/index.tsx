import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { CategoryFilter } from './components/category-filter';
import { FeatureSection } from './components/feature-section';
import { Footer } from './components/footer';
import { HeroSection } from './components/hero-section';
import { Navbar } from './components/navbar';
import { ProductCard } from './components/product-card';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
    category?: string | null;
    stock?: number;
    is_featured?: boolean;
}

interface HomepageProps {
    products: Product[];
    categories: string[];
    featured: Product[];
}

export default function Homepage({
    products,
    categories,
    featured,
}: HomepageProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null,
    );

    const filteredProducts = selectedCategory
        ? products.filter((p) => p.category === selectedCategory)
        : products;

    return (
        <PublicLayout>
            <Head title="Raja Ikan - Premium Seafood" />

            <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
                <Navbar />

                <main>
                    <HeroSection />

                    <CategoryFilter
                        categories={categories}
                        onCategoryChange={setSelectedCategory}
                    />

                    <section className="container mx-auto px-4 pb-24">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-x-8">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
                                <p>No products found in this category.</p>
                            </div>
                        )}
                    </section>

                    <FeatureSection />
                </main>

                <Footer />
            </div>
        </PublicLayout>
    );
}
