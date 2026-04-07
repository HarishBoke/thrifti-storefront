import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import type { ShopifyCart } from "@shared/shopifyTypes";

interface CartContextType {
  cart: ShopifyCart | null;
  cartId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  totalQuantity: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  goToCheckout: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_ID_KEY = "thrifti_cart_id";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(CART_ID_KEY);
    }
    return null;
  });
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createCartMutation = trpc.cart.create.useMutation();
  const addLinesMutation = trpc.cart.addLines.useMutation();
  const updateLinesMutation = trpc.cart.updateLines.useMutation();
  const removeLinesMutation = trpc.cart.removeLines.useMutation();

  const cartQuery = trpc.cart.get.useQuery(
    { cartId: cartId! },
    { enabled: !!cartId, staleTime: 30_000 }
  );

  useEffect(() => {
    if (cartQuery.data) {
      setCart(cartQuery.data);
    }
  }, [cartQuery.data]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const addToCart = useCallback(
    async (merchandiseId: string, quantity = 1) => {
      setIsLoading(true);
      try {
        if (!cartId) {
          const newCart = await createCartMutation.mutateAsync({
            lines: [{ merchandiseId, quantity }],
          });
          setCart(newCart);
          setCartId(newCart.id);
          localStorage.setItem(CART_ID_KEY, newCart.id);
        } else {
          const updatedCart = await addLinesMutation.mutateAsync({
            cartId,
            lines: [{ merchandiseId, quantity }],
          });
          setCart(updatedCart);
        }
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    },
    [cartId, createCartMutation, addLinesMutation]
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartId) return;
      setIsLoading(true);
      try {
        if (quantity <= 0) {
          const updatedCart = await removeLinesMutation.mutateAsync({
            cartId,
            lineIds: [lineId],
          });
          setCart(updatedCart);
        } else {
          const updatedCart = await updateLinesMutation.mutateAsync({
            cartId,
            lines: [{ id: lineId, quantity }],
          });
          setCart(updatedCart);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cartId, updateLinesMutation, removeLinesMutation]
  );

  const removeFromCart = useCallback(
    async (lineId: string) => {
      if (!cartId) return;
      setIsLoading(true);
      try {
        const updatedCart = await removeLinesMutation.mutateAsync({
          cartId,
          lineIds: [lineId],
        });
        setCart(updatedCart);
      } finally {
        setIsLoading(false);
      }
    },
    [cartId, removeLinesMutation]
  );

  const goToCheckout = useCallback(() => {
    if (cart?.checkoutUrl) {
      window.open(cart.checkoutUrl, "_blank");
    }
  }, [cart]);

  const totalQuantity = cart?.totalQuantity ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        isOpen,
        isLoading,
        totalQuantity,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        goToCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
