"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, Calendar, DollarSign, ArrowLeft, Eye } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function OrdersPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/auth/login"
          return
        }

        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          fetchOrders(token)
        } else {
          window.location.href = "/auth/login"
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        window.location.href = "/auth/login"
      }
    }
    checkAuth()
  }, [])

  const fetchOrders = async (token) => {
    try {
      const response = await fetch("/api/orders/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400/20 text-yellow-400"
      case "payment_received":
        return "bg-blue-400/20 text-blue-400"
      case "installment_received":
        return "bg-purple-400/20 text-purple-400"
      case "shipped":
        return "bg-green-400/20 text-green-400"
      case "delivered":
        return "bg-green-600/20 text-green-600"
      case "cancelled":
        return "bg-red-400/20 text-red-400"
      default:
        return "bg-gray-400/20 text-gray-400"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Order Received - Pending Payment"
      case "payment_received":
        return "Full Payment Received"
      case "installment_received":
        return "Installment Received - Pending Installments"
      case "shipped":
        return "Shipped"
      case "delivered":
        return "Delivered"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header user={user} setUser={setUser} />
        <div className="pt-20 px-4">
          <div className="container mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-800 rounded w-32 mb-8"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-lg p-6">
                    <div className="h-6 bg-gray-800 rounded mb-4"></div>
                    <div className="h-20 bg-gray-800 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header user={user} setUser={setUser} />

      <div className="pt-20 px-4">
        <div className="container mx-auto">
          {/* Back Button */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <button className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </Link>
          </motion.div>

          {/* Page Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent flex items-center space-x-3">
              <Package className="w-8 h-8 text-yellow-400" />
              <span>My Orders</span>
            </h1>
            <p className="text-gray-400">Track your order history ({orders.length} orders)</p>
          </motion.div>

          {/* Orders List */}
          {orders.length > 0 ? (
            <motion.div
              className="space-y-6 mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  className="bg-black border border-yellow-400/20 rounded-lg p-6 hover:border-yellow-400/50 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 mb-2 md:mb-0">
                      <Package className="w-5 h-5 text-yellow-400" />
                      <h3 className="text-lg font-semibold">Order #{order._id.slice(-8).toUpperCase()}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${order.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={(order.shoe.images && order.shoe.images[0]) || order.shoe.image || "/placeholder.svg"}
                          alt={order.shoe.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{order.shoe.name}</h4>
                          <p className="text-gray-400">{order.shoe.brand}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span>Size: <span className="font-medium">{order.size}</span></span>
                            <span>Qty: <span className="font-medium">{order.quantity}</span></span>
                            <span>Payment: <span className="font-medium">{order.paymentMethod === 'full' ? 'Full Payment' : 'Installments'}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-black/50 rounded-lg p-4">
                      <h5 className="font-semibold mb-2">Shipping Address</h5>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        {order.shippingAddress.phone && (
                          <p>Phone: {order.shippingAddress.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="flex justify-end mt-4">
                    <Link href={`/orders/${order._id}`}>
                      <button className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all">
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-gray-400">No orders yet</h3>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
              <Link href="/shop">
                <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all">
                  Browse Shoes
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
