"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import type { CartItem } from "app/types"

type CartContextType = {
  cartItems: CartItem[]
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string, size: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) setCartItems(JSON.parse(savedCart))
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.id === item.id && i.size === item.size
      )
      if (idx > -1) {
        const updated = [...prev]
        updated[idx].quantity += item.quantity
        return updated
      }
      return [...prev, item]
    })
  }

  const removeFromCart = (id: string, size: string) => {
    setCartItems((prev) => prev.filter((i) => !(i.id === id && i.size === size)))
  }

  const clearCart = () => setCartItems([])

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}