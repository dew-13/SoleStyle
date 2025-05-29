"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "../components/Header"
import Footer from "../components/Footer"
import type { User, CartItem } from "app/types"
import toast, { Toaster } from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const [user, setUser] = useState<User | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const response = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }

    // Load cart items from localStorage
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error parsing cart data:", error)
        setCartItems([])
      }
    }

    checkAuth()
    setLoading(false)
  }, [])

  const updateQuantity = (itemId: string, size: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId, size)
      return
    }

    const updatedCart = cartItems.map((item) =>
      item.id === itemId && item.size === size ? { ...item, quantity: newQuantity } : item,
    )

    setCartItems(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
    toast.success("Cart updated!")
  }

  const removeItem = (itemId: string, size: string) => {
    const updatedCart = cartItems.filter((item) => !(item.id === itemId && item.size === size))

    setCartItems(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
    toast.success("Item removed from cart!")
  }

  const getTotalPrice = (): number => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const proceedToCheckout = () => {
    if (!user) {
      toast.error("Please login to proceed with checkout")
      setTimeout(() => {
        window.location.href = "/auth/login"
      }, 1200)
      return
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    // Store cart details and redirect to checkout
    localStorage.setItem("checkoutItems", JSON.stringify(cartItems))
    toast.success("Proceeding to checkout...")
    setTimeout(() => {
      router.push("/order-confirmation")
    }, 1200)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-right" />
      <Header user={user} setUser={setUser} />

      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Page Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/shop">
              <button className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors mb-4">
                <ArrowLeft className="w-5 h-5" />
                <span>Continue Shopping</span>
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            <p className="text-gray-400">Review your items before checkout</p>
          </motion.div>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.size}`}
                    className="bg-black border border-yellow-400/20 rounded-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={120}
                        height={120}
                        className="rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                        <p className="text-gray-400 mb-2">{item.brand}</p>
                        <p className="text-sm text-gray-400 mb-2">Size: {item.size}</p>
                        <p className="text-yellow-400 font-bold">LKR {item.price?.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="w-8 h-8 border border-gray-600 rounded hover:border-gray-500 transition-colors flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="w-8 h-8 border border-gray-600 rounded hover:border-gray-500 transition-colors flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <motion.div
                className="bg-black border border-yellow-400/20 rounded-lg p-6 h-fit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items):</span>
                    <span>LKR {getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-yellow-400">LKR {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">(Including Shipping + Clearance Tax)</p>
                  </div>
                </div>

                <button
                  onClick={proceedToCheckout}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Proceed to Checkout</span>
                </button>
              </motion.div>
            </div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-8">Add some shoes to get started!</p>
              <Link href="/shop">
                <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all">
                  Start Shopping
                </button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
