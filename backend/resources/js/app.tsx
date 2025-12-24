import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { CartProvider } from './contexts/cart-context';
import { MessagesProvider } from './contexts/messages-context';
import { initializeTheme } from './hooks/use-appearance';
// --- TAMBAHKAN BAGIAN INI ---
import { Toaster } from 'sonner';
import { route as routeFn } from 'ziggy-js';
import { Ziggy } from './ziggy'; // Pastikan file ini ada (hasil generate artisan)

// Tempelkan ke window agar browser mengenalnya
(window as any).route = routeFn;
(window as any).Ziggy = Ziggy;
// ----------------------------

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <CartProvider>
                <MessagesProvider>
                    <Toaster position="top-right" />
                    <App {...props} />
                </MessagesProvider>
            </CartProvider>,
        );
    },
    progress: {
        color: 'var(--primary)',
    },
});

// This will set light / dark mode on load...
initializeTheme();
