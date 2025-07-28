"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, CreditCard, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "../components/Header"
import Footer from "../components/Footer"
import type { User, ShippingAddress, CartItem } from "app/types"
import toast, { Toaster } from "react-hot-toast"
import { useCart } from "../context/CartContext"

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([])
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<string>("full")
  const [loading, setLoading] = useState<boolean>(false)
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false)
  const { clearCart } = useCart()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          // Pre-fill shipping address if user has saved address
          if (userData.address) {
            setShippingAddress({
              fullName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
              address: userData.address.street || "",
              city: userData.address.city || "",
              state: userData.address.state || "",
              zipCode: userData.address.zipCode || "",
              phone: userData.phone || "",
            })
          }
        } else {
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/auth/login")
      }
    }

    // Get checkout items from localStorage
    const storedCheckoutItems = localStorage.getItem("checkoutItems")
    if (storedCheckoutItems) {
      try {
        setCheckoutItems(JSON.parse(storedCheckoutItems))
      } catch (error) {
        console.error("Error parsing checkout items:", error)
        router.push("/cart")
      }
    } else {
      router.push("/cart")
    }

    checkAuth()
  }, [router])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    })
  }

  const handleConfirmOrder = async () => {
    if (!checkoutItems || checkoutItems.length === 0) {
      toast.error("Cart is empty.")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Session expired. Please login again.")
        router.push("/auth/login")
        return
      }

      // Save the shipping address to user profile
      await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: shippingAddress.phone,
          address: {
            street: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
          },
        }),
      })

      // Prepare shipping address for order (exclude fullName)
      const shippingAddressForOrder = {
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        phone: shippingAddress.phone,
      }

      // Create a single order with multiple items
      const orderItems = checkoutItems.map((item) => {
        const orderItem = {
          size: item.size,
          quantity: item.quantity,
          retailPrice: item.retailPrice,
          profit: item.profit,
          totalPrice: item.price * item.quantity,
          type: item.type || "shoe",
        }
        if (item.type === "apparel") {
          orderItem.apparelId = item._id
        } else {
          orderItem.shoeId = item.id || item._id
        }
        return orderItem
      })

      const orderBody = {
        items: orderItems,
        shippingAddress: shippingAddressForOrder,
        paymentMethod,
        customerName: shippingAddress.fullName,
        customerEmail: user?.email,
      }

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Order API error:", errorData)
        toast.error(errorData.message || "Failed to place order. Please try again.")
        return
      }

      // Clear the cart after successful order placement
      clearCart()

      setOrderPlaced(true)
      localStorage.removeItem("checkoutItems")
      toast.success("Orders placed successfully!")
    } catch (error) {
      console.error("Order creation error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppContact = () => {
    if (!checkoutItems || checkoutItems.length === 0) return

    const totalPrice = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemsList = checkoutItems.map((item) => `${item.name} (Size: ${item.size}, Qty: ${item.quantity})`).join(", ")

    const message = `Hi! I've placed orders for: ${itemsList}. Total: LKR ${totalPrice.toLocaleString()}. Please let me know the next steps for payment.`
    const phoneNumber = "+14376611999" // Replace with actual contact number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const totalPrice = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!checkoutItems || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Toaster position="top-right" />
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Toaster position="top-right" />
        <Header user={user} setUser={setUser} />

        <div className="pt-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-green-500/10 border border-green-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Orders Placed Successfully!
              </h1>

              <p className="text-gray-300 mb-8 text-lg">
                Thank you for your orders. Please contact our team with your payment receipt to proceed.
              </p>

              <motion.button
                onClick={handleWhatsAppContact}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center space-x-3 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="w-6 h-6" />
                <span>Send your Payment Receipt on WhatsApp</span>
              </motion.button>

              <div className="mt-8 p-6 bg-black border border-yellow-400/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 text-left">
                  {checkoutItems.map((item, index) => (
                    <div key={index} className="flex justify-between border-b border-gray-700 pb-2">
                      <span>
                        {item.name} (Size: {item.size}, Qty: {item.quantity})
                      </span>
                      <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{paymentMethod === "full" ? "Full Payment" : "Installments"}</span>
                  </div>
                  <div className="flex justify-between font-bold text-yellow-400 border-t border-gray-700 pt-2">
                    <span>Total:</span>
                    <span>LKR {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link href="/shop">
                <button className="mt-8 border border-yellow-400 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400/10 transition-all">
                  Continue Shopping
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-right" />
      <Header user={user} setUser={setUser} />

      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/cart">
              <button className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Cart</span>
              </button>
            </Link>
          </motion.div>

          {/* Page Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Checkout
            </h1>
            <p className="text-gray-400">Please review your order and provide shipping details</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Order Summary */}
            <motion.div
              className="bg-black border border-yellow-400/20 rounded-lg p-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {checkoutItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-400">{item.brand}</p>
                      <p className="text-sm text-gray-400">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                      <p className="text-yellow-400 font-semibold">
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-700 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>LKR {totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-gray-400 text-sm">(Including shipping and Tax clearance to SL)</p>
                <div className="flex justify-between font-bold text-lg text-yellow-400 border-t border-gray-700 pt-3">
                  <span>Total:</span>
                  <span>LKR {totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-gray-400 text-sm">
                  By placing this order, you agree to our{" "}
                  <a href="#" className="text-yellow-400 underline">
                    Terms of Service.
                  </a>
                </p>
              </div>
            </motion.div>

            {/* Shipping and Payment */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Shipping Address */}
              <div className="bg-black border border-yellow-400/20 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={shippingAddress.fullName}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={shippingAddress.address}
                    onChange={handleAddressChange}
                    className="md:col-span-2 w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="District"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={shippingAddress.zipCode}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-black border border-yellow-400/20 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <CreditCard className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="full"
                      checked={paymentMethod === "full"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-yellow-400 focus:ring-yellow-400"
                    />
                    <span>Full Payment (LKR {totalPrice.toLocaleString()})</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="installments"
                      checked={paymentMethod === "installments"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-yellow-400 focus:ring-yellow-400"
                    />
                    <span>
                      Installments (3 payments of LKR {Math.round(totalPrice / 3).toLocaleString()})
                      <br /> For balance payment, timely completion is required to secure your pair.
                    </span>
                  </label>
                </div>
              </div>

              {/* Confirm Order Button */}
              <motion.button
                onClick={handleConfirmOrder}
                disabled={loading || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-4 rounded-lg font-semibold text-lg hover:from-yellow-500 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? "Processing..." : "Confirm Order"}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
