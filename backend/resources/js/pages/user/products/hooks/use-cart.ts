import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CartItem, Product } from '../types';

interface UseCartReturn {
    cart: CartItem[];
    total: number;
    isDrawerOpen: boolean;
    setIsDrawerOpen: (open: boolean) => void;
    isOrderDialogOpen: boolean;
    setIsOrderDialogOpen: (open: boolean) => void;
    addToCart: (product: Product) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    removeItem: (productId: number) => void;
    openOrderDialog: () => void;
    itemCount: number;
    getCartData: () => { product_id: number; quantity: number }[];
}

export function useCart(): UseCartReturn {
    const [cart, setCart] = useState<CartItem[]>(() => {
        // Load cart from localStorage on init
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('cart');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    return [];
                }
            }
        }
        return [];
    });
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart]);

    // Calculate total
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(
                (item) => item.product.id === product.id,
            );

            if (existingItem) {
                // Increment quantity if product already in cart
                return prevCart.map((item) =>
                    item.product.id === product.id
                        ? {
                              ...item,
                              quantity: item.quantity + 1,
                              subtotal:
                                  (item.quantity + 1) * item.product.price,
                          }
                        : item,
                );
            } else {
                // Add new product to cart
                const newItem: CartItem = {
                    id: product.id, // Use product.id as temporary cart item id
                    product,
                    quantity: 1,
                    subtotal: product.price,
                };
                return [...prevCart, newItem];
            }
        });
    };

    const updateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.product.id === productId
                    ? {
                          ...item,
                          quantity: newQuantity,
                          subtotal: newQuantity * item.product.price,
                      }
                    : item,
            ),
        );
    };

    const removeItem = (productId: number) => {
        if (confirm('Hapus produk dari keranjang?')) {
            setCart((prevCart) =>
                prevCart.filter((item) => item.product.id !== productId),
            );
        }
    };

    const openOrderDialog = () => {
        if (cart.length === 0) {
            alert('Keranjang kosong');
            return;
        }
        // Redirect to checkout page instead of opening modal
        router.visit('/customer/orders/create');
    };

    // Get cart data in format ready for backend
    const getCartData = () => {
        return cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
        }));
    };

    return {
        cart,
        total,
        isDrawerOpen,
        setIsDrawerOpen,
        isOrderDialogOpen,
        setIsOrderDialogOpen,
        addToCart,
        updateQuantity,
        removeItem,
        openOrderDialog,
        itemCount,
        getCartData,
    };
}
