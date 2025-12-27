import { Clock, ShieldCheck, Truck } from 'lucide-react';

export function FeatureSection() {
    const features = [
        {
            icon: Truck,
            title: 'Pengiriman Cepat',
            description: 'Segar sampai ke pintu Anda',
        },
        {
            icon: ShieldCheck,
            title: 'Kualitas Terjamin',
            description: 'Dipanen harian',
        },
        {
            icon: Clock,
            title: 'Segar Setiap Hari',
            description: 'Hasil tangkapan pagi',
        },
    ];

    return (
        <section className="border-t border-zinc-100 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center"
                        >
                            <feature.icon className="mb-4 h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {feature.title}
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
