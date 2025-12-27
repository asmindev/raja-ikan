import { router } from '@inertiajs/react';
import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useState,
} from 'react';
import { toast } from 'sonner';

export interface Product {
    id: number;
    name: string;
    price: number;
    image: string | null;
    category?: string | null;
    stock?: number;
}

export interface CartItem {
    id?: number; // Cart ID (only for auth users)
    product_id: number;
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    openCart: () => void;
    closeCart: () => void;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    checkout: () => void;
    clearCart: () => void;
    isLoading: boolean;
    total: number;
    isBouncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isBouncing, setIsBouncing] = useState(false);

    const total = items.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0,
    );

    // Initialize cart from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Ensure product_id exists for each item
                const validated = parsed
                    .map((item: any) => ({
                        ...item,
                        product_id: item.product_id || item.product?.id,
                    }))
                    .filter((item: any) => item.product_id);
                setItems(validated);
            } catch (e) {
                console.error('Failed to parse cart from localStorage:', e);
                localStorage.removeItem('cart');
            }
        }
        setIsInitialized(true);
    }, []);

    // Persist to local storage whenever items change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    const addToCart = (product: Product, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find(
                (item) => item.product_id === product.id,
            );
            if (existing) {
                return prev.map((item) =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item,
                );
            }
            return [...prev, { product_id: product.id, product, quantity }];
        });

        // Trigger bounce animation
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 600);
    };

    const removeFromCart = (productId: number) => {
        setItems((prev) =>
            prev.filter((item) => item.product_id !== productId),
        );
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity < 1) return;
        setItems((prev) =>
            prev.map((item) =>
                item.product_id === productId ? { ...item, quantity } : item,
            ),
        );
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem('cart');
    };

    const checkout = () => {
        // Check if user is logged in by trying to access the page props
        // This will work because checkout is called from a component inside Inertia tree
        setIsLoading(true);

        // Sync local cart to server before checkout
        router.post(
            '/customer/cart/sync',
            {
                items: items.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                })),
            },
            {
                onSuccess: () => {
                    setIsLoading(false);
                    setIsOpen(false);
                    // Keep cart data for orders/create page
                    // Will be cleared after order is successfully created
                },
                onError: () => {
                    setIsLoading(false);
                    toast.error('Gagal memproses pesanan');
                },
            },
        );
    };

    return (
        <CartContext.Provider
            value={{
                items,
                isOpen,
                setIsOpen,
                openCart,
                closeCart,
                addToCart,
                removeFromCart,
                updateQuantity,
                checkout,
                clearCart,
                isLoading,
                total,
                isBouncing,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
