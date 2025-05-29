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
import type { User, OrderDetails, ShippingAddress, CartItem, Shoe } from "app/types"
import toast, { Toaster } from "react-hot-toast"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
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

    const storedOrderDetails = localStorage.getItem("orderDetails")
    const storedCheckoutItems = localStorage.getItem("checkoutItems")

    if (storedOrderDetails) {
      try {
        setOrderDetails(JSON.parse(storedOrderDetails))
      } catch (error) {
        console.error("Error parsing order details:", error)
        router.push("/shop")
      }
    } else if (storedCheckoutItems) {
      try {
        const items = JSON.parse(storedCheckoutItems)
        setCheckoutItems(items)
      } catch (error) {
        console.error("Error parsing cart items:", error)
        router.push("/shop")
      }
    } else {
      router.push("/shop")
    }

    checkAuth()
  }, [router])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value })
  }

  const handleConfirmOrder = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Session expired. Please login again.")
      router.push("/auth/login")
      return
    }

    setLoading(true)

    try {
      // Update user address
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

      const shippingAddressForOrder = {
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        phone: shippingAddress.phone,
      }

      if (orderDetails) {
        // Pre-order: single shoe
        const response = await fetch("/api/orders/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shoeId: orderDetails.shoe._id,
            size: orderDetails.size,
            quantity: orderDetails.quantity,
            totalPrice: orderDetails.totalPrice,
            shippingAddress: shippingAddressForOrder,
            paymentMethod,
            customerName: shippingAddress.fullName,
            customerEmail: user?.email,
          }),
        })

        if (response.ok) {
          localStorage.removeItem("orderDetails")
          setOrderPlaced(true)
          toast.success("Order placed successfully!")
        } else {
          const errorData = await response.json().catch(() => ({}))
          toast.error(errorData.message || "Failed to place order.")
        }
      } else if (checkoutItems.length > 0) {
        // Cart: multiple items
        const response = await fetch("/api/orders/bulk-create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: checkoutItems.map((item) => ({
              shoeId: item.id,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
            })),
            totalPrice: checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
            shippingAddress: shippingAddressForOrder,
            paymentMethod,
            customerName: shippingAddress.fullName,
            customerEmail: user?.email,
          }),
        })

        if (response.ok) {
          localStorage.removeItem("checkoutItems")
          setOrderPlaced(true)
          toast.success("Order placed successfully!")
        } else {
          const errorData = await response.json().catch(() => ({}))
          toast.error(errorData.message || "Failed to place order.")
        }
      }
    } catch (error) {
      console.error("Order creation error:", error)
      toast.error("An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppContact = () => {
    const total = orderDetails
      ? orderDetails.totalPrice
      : checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const message = `Hi! I've placed an order. Order total: LKR ${total.toLocaleString()}. Please let me know the next steps for payment.`
    const whatsappUrl = `https://wa.me/+14376611999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if ((!orderDetails && checkoutItems.length === 0) || !user) {
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
        <div className="pt-20 px-4 text-center">
          <motion.div
            className="py-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-green-500/10 border border-green-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">
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
              <span>Send your Payment Receipt on WhatsApp</span>
            </motion.button>
            <Link href="/shop">
              <button className="mt-8 border border-yellow-400 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400/10 transition-all">
                Continue Shopping
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  // You can now use either orderDetails (pre-order) or checkoutItems (cart)
  // Below this point, reuse your existing render logic accordingly

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-right" />
      <Header user={user} setUser={setUser} />
      <div className="pt-20 px-4">
        {/* RENDER UI as before — check if orderDetails exists, otherwise use checkoutItems to render order summary */}
        {/* You can reuse the existing JSX you had for the page layout */}
        {/* Let me know if you'd like me to continue this JSX part fully built-out as well */}
      </div>
      <Footer />
    </div>
  )
}
