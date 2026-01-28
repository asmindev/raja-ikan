import { Clock, ShieldCheck, Truck } from 'lucide-react';

export function FeatureSection() {
    const features = [
        {
            icon: Truck,
            title: 'Pengiriman Cepat',
            description: 'Segar sampai ke pintu Anda',
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            icon: ShieldCheck,
            title: 'Kualitas Terjamin',
            description: 'Dipanen harian',
            color: 'text-teal-500',
            bg: 'bg-teal-50 dark:bg-teal-900/20',
        },
        {
            icon: Clock,
            title: 'Segar Setiap Hari',
            description: 'Hasil tangkapan pagi',
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
        },
    ];

    return (
        <section className="border-t border-zinc-100 bg-white/50 py-24 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group flex flex-col items-center text-center transition-colors"
                        >
                            <div
                                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.bg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                            >
                                <feature.icon
                                    className={`h-8 w-8 ${feature.color}`}
                                />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                {feature.title}
                            </h3>
                            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
