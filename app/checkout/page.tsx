// app/checkout/page.tsx

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, CreditCard, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { useRouter } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"

import type { User, ShippingAddress, CartItem } from "app/types"

export default function CheckoutPage() {
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
  const [paymentMethod, setPaymentMethod] = useState("full")
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error()
        const userData = await res.json()
        setUser(userData)

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
      } catch {
        router.push("/auth/login")
      }
    }

    const stored = localStorage.getItem("checkoutItems")
    if (stored) {
      try {
        setCheckoutItems(JSON.parse(stored))
      } catch {
        toast.error("Cart data is corrupted")
        router.push("/cart")
      }
    } else {
      toast.error("No items to checkout")
      router.push("/cart")
    }

    fetchUser()
  }, [router])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    })
  }

  const handleConfirmCartOrder = async () => {
    if (!checkoutItems || checkoutItems.length === 0) {
      toast.error("Cart is empty")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Please log in again")
      router.push("/auth/login")
      return
    }

    setLoading(true)

    try {
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

      for (const item of checkoutItems) {
        const payload = {
          shoeId: item.id,
          size: item.size,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          shippingAddress: {
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            phone: shippingAddress.phone,
          },
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
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err.message || "Order failed.")
        }
      }

      toast.success("Order placed successfully!")
      setOrderPlaced(true)
      localStorage.removeItem("checkoutItems")
      localStorage.removeItem("cart")
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!user || checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Toaster />
        <div className="animate-spin h-24 w-24 border-t-2 border-b-2 border-yellow-400 rounded-full" />
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Toaster />
        <Header user={user} setUser={setUser} />
        <div className="pt-20 text-center max-w-2xl mx-auto">
          <motion.div
            className="py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">
              Order Successfully Placed!
            </h1>
            <p className="text-gray-300 mb-6">Please share your payment receipt to confirm the order.</p>
            <motion.button
              onClick={() => window.open("https://wa.me/+14376611999", "_blank")}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Send Payment Receipt</span>
            </motion.button>
            <Link href="/shop">
              <button className="mt-8 border border-yellow-400 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400/10">
                Continue Shopping
              </button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster />
      <Header user={user} setUser={setUser} />
      <div className="pt-20 px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Checkout
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Address Form */}
          <div className="bg-black border border-yellow-400/20 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span>Shipping Details</span>
            </h2>
            {["fullName", "phone", "address", "city", "state", "zipCode"].map((field, idx) => (
              <input
                key={idx}
                type={field === "phone" ? "tel" : "text"}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
                value={(shippingAddress as any)[field]}
                onChange={handleAddressChange}
                className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:outline-none"
                required
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-black border border-yellow-400/20 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-yellow-400" />
              <span>Order & Payment</span>
            </h2>
            {checkoutItems.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm border-b border-gray-800 py-2">
                <span>{item.name} (Size {item.size}) x {item.quantity}</span>
                <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold border-t border-gray-700 pt-2 text-yellow-400">
              <span>Total:</span>
              <span>LKR {totalPrice.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="full"
                  checked={paymentMethod === "full"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Full Payment</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="installments"
                  checked={paymentMethod === "installments"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Installments (3 x LKR {(totalPrice / 3).toFixed(0)})</span>
              </label>
            </div>

            <motion.button
              onClick={handleConfirmCartOrder}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? "Processing..." : "Confirm Order"}
            </motion.button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
