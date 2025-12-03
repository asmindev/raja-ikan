import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatRupiah } from '@/lib/currency';
import { Clock, Shield, Star, Truck } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
}

interface HomepageProps {
    products: Product[];
}

export default function Homepage({ products }: HomepageProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="space-y-6 text-center">
                    <Badge variant="secondary" className="px-4 py-2 text-sm">
                        🚀 Fast & Reliable Delivery
                    </Badge>
                    <h1 className="text-4xl leading-tight font-bold text-gray-900 md:text-6xl">
                        Deliver Your Products
                        <span className="block text-blue-600">
                            With Confidence
                        </span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600">
                        Streamline your delivery process with our advanced
                        platform. Track orders, manage inventory, and delight
                        your customers.
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                        <Button size="lg" className="px-8 py-3 text-lg">
                            Get Started
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="px-8 py-3 text-lg"
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-gray-900">
                        Why Choose Our Platform?
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-600">
                        Everything you need to manage your delivery business
                        efficiently
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="text-center transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <Truck className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">
                                Fast Delivery
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Lightning-fast delivery with real-time tracking
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <Clock className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="text-lg">
                                Real-time Updates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Get instant notifications on order status
                                changes
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-lg">
                                Secure & Safe
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Your data is protected with enterprise-grade
                                security
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                                <Star className="h-6 w-6 text-yellow-600" />
                            </div>
                            <CardTitle className="text-lg">Top Rated</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Trusted by thousands of businesses worldwide
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Products Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-gray-900">
                        Our Products
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-600">
                        Discover our wide range of quality products available
                        for delivery
                    </p>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                        {products.map((product) => (
                            <Card
                                key={product.id}
                                className="m-0 overflow-hidden p-0 transition-shadow hover:shadow-lg"
                            >
                                <CardContent className="mt-0 p-0">
                                    <div className="relative h-40 overflow-hidden">
                                        <img
                                            src={
                                                product.image ||
                                                'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png'
                                            }
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform hover:scale-105"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src =
                                                    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png';
                                            }}
                                        />
                                    </div>
                                    <div className="p-2">
                                        <h3 className="mb-1 line-clamp-1 text-sm font-semibold">
                                            {product.name}
                                        </h3>
                                        <p className="mb-2 line-clamp-2 text-xs text-gray-600">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-blue-600">
                                                {formatRupiah(product.price)}
                                            </span>
                                            <Button
                                                size="sm"
                                                className="h-7 px-2 text-xs"
                                                onClick={() => {
                                                    const message = `Halo, saya ingin memesan produk:\n\n*${product.name}*\nHarga: ${formatRupiah(product.price)}\n\nMohon informasi lebih lanjut untuk proses pemesanan.`;
                                                    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
                                                    window.open(
                                                        whatsappUrl,
                                                        '_blank',
                                                    );
                                                }}
                                            >
                                                Order via WA
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-gray-500">Loading products...</p>
                    </div>
                )}

                {products.length > 0 && (
                    <div className="mt-8 text-center">
                        <Button variant="outline" size="lg">
                            View All Products
                        </Button>
                    </div>
                )}
            </section>

            <Separator className="my-16" />

            {/* Stats Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-blue-600">
                            10K+
                        </div>
                        <p className="text-gray-600">Happy Customers</p>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-green-600">
                            50K+
                        </div>
                        <p className="text-gray-600">Deliveries Completed</p>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-purple-600">
                            99.9%
                        </div>
                        <p className="text-gray-600">Uptime Guarantee</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-16 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-4 text-3xl font-bold">
                        Ready to Get Started?
                    </h2>
                    <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
                        Join thousands of businesses that trust our platform for
                        their delivery needs.
                    </p>
                    <Button
                        size="lg"
                        variant="secondary"
                        className="px-8 py-3 text-lg"
                    >
                        Start Your Free Trial
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-8 text-white">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        © 2025 App Delivery. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
