"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, CreditCard, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "../components/Header"
import type { User, OrderDetails, ShippingAddress } from "app/types"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
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

    // Get order details from localStorage
    const storedOrderDetails = localStorage.getItem("orderDetails")
    if (storedOrderDetails) {
      try {
        setOrderDetails(JSON.parse(storedOrderDetails))
      } catch (error) {
        console.error("Error parsing order details:", error)
        router.push("/shop")
      }
    } else {
      router.push("/shop")
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
    if (!orderDetails) return

    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      // First, save the shipping address to user profile
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

      // Then create the order
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shoe: orderDetails.shoe,
          size: orderDetails.size,
          quantity: orderDetails.quantity,
          totalPrice: orderDetails.totalPrice,
          shippingAddress,
          paymentMethod,
        }),
      })

      if (response.ok) {
        setOrderPlaced(true)
        // Clear order details from localStorage
        localStorage.removeItem("orderDetails")
      } else {
        alert("Failed to place order. Please try again.")
      }
    } catch (error) {
      console.error("Order creation error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppContact = () => {
    if (!orderDetails) return

    const message = `Hi! I've placed an order for ${orderDetails.shoe.name} (Size: ${orderDetails.size}). Order total: LKR ${orderDetails.totalPrice.toLocaleString()}. Please let me know the next steps for payment.`
    const phoneNumber = "+94771234567" // Replace with actual contact number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (!orderDetails || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-black text-white">
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
                Order Placed Successfully!
              </h1>

              <p className="text-gray-300 mb-8 text-lg">
                Thank you for your order. Please contact our team with your payment receipt to proceed.
              </p>

              <motion.button
                onClick={handleWhatsAppContact}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center space-x-3 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="w-6 h-6" />
                <span>Contact Person1 on WhatsApp</span>
              </motion.button>

              <div className="mt-8 p-6 bg-black border border-yellow-400/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span>{orderDetails.shoe.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{orderDetails.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{orderDetails.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{paymentMethod === "full" ? "Full Payment" : "Installments"}</span>
                  </div>
                  <div className="flex justify-between font-bold text-yellow-400 border-t border-gray-700 pt-2">
                    <span>Total:</span>
                    <span>LKR {orderDetails.totalPrice.toLocaleString()}</span>
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
            <Link href={`/product/${orderDetails.shoe._id}`}>
              <button className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Product</span>
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
              Order Confirmation
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

              <div className="flex items-center space-x-4 mb-6">
                <Image
                  src={orderDetails.shoe.image || "/placeholder.svg"}
                  alt={orderDetails.shoe.name}
                  width={100}
                  height={100}
                  className="rounded-lg"
                />
                <div>
                  <h3 className="text-lg font-semibold">{orderDetails.shoe.name}</h3>
                  <p className="text-gray-400">{orderDetails.shoe.brand}</p>
                  <p className="text-sm text-gray-400">Size: {orderDetails.size}</p>
                  <p className="text-sm text-gray-400">Quantity: {orderDetails.quantity}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-700 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>LKR {orderDetails.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-yellow-400 border-t border-gray-700 pt-3">
                  <span>Total:</span>
                  <span>LKR {orderDetails.totalPrice.toLocaleString()}</span>
                </div>
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
                    placeholder="State"
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
                    <span>Full Payment (LKR {orderDetails.totalPrice.toLocaleString()})</span>
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
                      Installments (3 payments of LKR {Math.round(orderDetails.totalPrice / 3).toLocaleString()})
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
    </div>
  )
}
