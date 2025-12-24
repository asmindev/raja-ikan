import { CartDrawer } from '@/components/cart-drawer';
import { PropsWithChildren } from 'react';

export default function PublicLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            {children}
            <CartDrawer />
        </div>
    );
}
