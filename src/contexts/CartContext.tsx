import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "../types/api";

export interface CartItem extends Product {
  quantity: number;
  addedAt: Date;
  isPreorder?: boolean;
  preorderMessage?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  addToCart: (product: Product, quantity?: number) => void;
  addPreorderToCart: (product: Product, message?: string, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  getCartItem: (productId: number) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          ...product,
          quantity,
          addedAt: new Date(),
        };
        return [...prevItems, newItem];
      }
    });
  };

  const addPreorderToCart = (product: Product, message: string = "", quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((item) =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                isPreorder: true,
                preorderMessage: message || item.preorderMessage
              }
            : item
        );
      } else {
        // Add new preorder item to cart
        const newItem: CartItem = {
          ...product,
          quantity,
          addedAt: new Date(),
          isPreorder: true,
          preorderMessage: message,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (productId: number) => {
    return items.some((item) => item.id === productId);
  };

  const getCartItem = (productId: number) => {
    return items.find((item) => item.id === productId);
  };

  const value: CartContextType = {
    items,
    totalItems,
    addToCart,
    addPreorderToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
