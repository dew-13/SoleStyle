"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, Users, TrendingUp, ShoppingBag, Calendar, DollarSign } from 'lucide-react'
import type { Order } from "app/types"

export default function AdminStatsComponent() {
  const [stats, setStats] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper function to get order total with fallback
  const getOrderTotal = (order: Order): number => {
    return order.total || order.totalPrice || (order.shoe?.price * order.quantity) || 0
  }

  // Helper function to get order profit
  const getOrderProfit = (order: Order): number => {
    const profit = order.shoe?.profit || 0
    return profit * order.quantity
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          // Ensure order totals are calculated correctly
          if (data.recentOrders) {
            data.recentOrders = data.recentOrders.map((order: Order) => ({
              ...order,
              total: getOrderTotal(order),
            }))
          }
          setStats(data)
        } else {
          // Fallback stats with proper totals and profit
          const fallbackStats = {
            totalShoes: 25,
            totalOrders: 156,
            totalUsers: 89,
            totalRevenue: 2450000,
            totalProfit: 485000,
            monthlyRevenue: 485000,
            featuredShoes: 8,
            recentOrders: [
              {
                _id: "1",
                userId: "user1",
                shoeId: "shoe1",
                orderId: "OG001234",
                customerName: "John Doe",
                customerPhone: "+94-77-123-4567",
                customerEmail: "john.doe@example.com",
                shoe: {
                  _id: "shoe1",
                  name: "Air Jordan 1 Retro High",
                  brand: "Nike",
                  price: 28500,
                  profit: 8500,
                  retailPrice: 20000,
                  description: "Classic basketball shoe",
                  image: "/placeholder.svg?height=400&width=400",
                  sizes: ["8", "9", "10", "11"],
                  featured: true,
                  createdAt: new Date().toISOString(),
                },
                size: "10",
                quantity: 1,
                total: 28500,
                status: "pending",
                paymentMethod: "full",
                createdAt: new Date().toISOString(),
                shippingAddress: {
                  street: "123 Main St",
                  city: "Colombo",
                  state: "Western",
                  zipCode: "00100",
                  country: "Sri Lanka",
                },
              },
              {
                _id: "2",
                userId: "user2",
                shoeId: "shoe2",
                orderId: "OG001235",
                customerName: "Jane Smith",
                customerPhone: "+94-77-234-5678",
                customerEmail: "jane.smith@example.com",
                shoe: {
                  _id: "shoe2",
                  name: "Yeezy Boost 350 V2",
                  brand: "Adidas",
                  price: 36800,
                  profit: 12800,
                  retailPrice: 24000,
                  description: "Modern lifestyle sneaker",
                  image: "/placeholder.svg?height=400&width=400",
                  sizes: ["7", "8", "8.5", "9"],
                  featured: true,
                  createdAt: new Date().toISOString(),
                },
                size: "8.5",
                quantity: 1,
                total: 36800,
                status: "payment_received",
                paymentMethod: "full",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                shippingAddress: {
                  street: "456 Elm St",
                  city: "Kandy",
                  state: "Central",
                  zipCode: "20000",
                  country: "Sri Lanka",
                },
              },
              {
                _id: "3",
                userId: "user3",
                shoeId: "shoe3",
                orderId: "OG001236",
                customerName: "Mike Johnson",
                customerPhone: "+94-77-345-6789",
                customerEmail: "mike.johnson@example.com",
                shoe: {
                  _id: "shoe3",
                  name: "Chuck 70 High Top",
                  brand: "Converse",
                  price: 22500,
                  profit: 7500,
                  retailPrice: 15000,
                  description: "Classic canvas sneaker",
                  image: "/placeholder.svg?height=400&width=400",
                  sizes: ["8", "9", "10", "11"],
                  featured: false,
                  createdAt: new Date().toISOString(),
                },
                size: "9",
                quantity: 2,
                total: 45000,
                status: "shipped",
                paymentMethod: "full",
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                shippingAddress: {
                  street: "789 Oak St",
                  city: "Galle",
                  state: "Southern",
                  zipCode: "80000",
                  country: "Sri Lanka",
                },
              },
              {
                _id: "4",
                userId: "user4",
                shoeId: "shoe4",
                orderId: "OG001237",
                customerName: "Sarah Wilson",
                customerPhone: "+94-77-456-7890",
                customerEmail: "sarah.wilson@example.com",
                shoe: {
                  _id: "shoe4",
                  name: "Air Force 1 Low",
                  brand: "Nike",
                  price: 18500,
                  profit: 5500,
                  retailPrice: 13000,
                  description: "Classic lifestyle sneaker",
                  image: "/placeholder.svg?height=400&width=400",
                  sizes: ["7", "8", "9", "10"],
                  featured: false,
                  createdAt: new Date().toISOString(),
                },
                size: "8",
                quantity: 1,
                total: 18500,
                status: "delivered",
                paymentMethod: "full",
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                shippingAddress: {
                  street: "321 Pine St",
                  city: "Negombo",
                  state: "Western",
                  zipCode: "11500",
                  country: "Sri Lanka",
                },
              },
              {
                _id: "5",
                userId: "user5",
                shoeId: "shoe5",
                orderId: "OG001238",
                customerName: "David Brown",
                customerPhone: "+94-77-567-8901",
                customerEmail: "david.brown@example.com",
                shoe: {
                  _id: "shoe5",
                  name: "Stan Smith",
                  brand: "Adidas",
                  price: 16800,
                  profit: 4800,
                  retailPrice: 12000,
                  description: "Classic tennis shoe",
                  image: "/placeholder.svg?height=400&width=400",
                  sizes: ["8", "9", "10", "11"],
                  featured: false,
                  createdAt: new Date().toISOString(),
                },
                size: "9",
                quantity: 1,
                total: 16800,
                status: "payment_received",
                paymentMethod: "installments",
                createdAt: new Date(Date.now() - 345600000).toISOString(),
                shippingAddress: {
                  street: "654 Cedar St",
                  city: "Matara",
                  state: "Southern",
                  zipCode: "81000",
                  country: "Sri Lanka",
                },
              },
            ],
            topShoes: [
              {
                _id: "shoe1",
                name: "Air Jordan 1 Retro High",
                brand: "Nike",
                price: 28500,
                profit: 8500,
                retailPrice: 20000,
                description: "Classic basketball shoe",
                image: "/placeholder.svg?height=400&width=400",
                sizes: ["8", "9", "10", "11"],
                featured: true,
                createdAt: new Date().toISOString(),
                orderCount: 45,
              },
              {
                _id: "shoe2",
                name: "Yeezy Boost 350 V2",
                brand: "Adidas",
                price: 36800,
                profit: 12800,
                retailPrice: 24000,
                description: "Modern lifestyle sneaker",
                image: "/placeholder.svg?height=400&width=400",
                sizes: ["7", "8", "8.5", "9"],
                featured: true,
                createdAt: new Date().toISOString(),
                orderCount: 32,
              },
            ],
          }
          setStats(fallbackStats)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-400/20 text-yellow-400"
      case "payment_received":
        return "bg-green-400/20 text-green-400"
      case "installment_received":
        return "bg-blue-400/20 text-blue-400"
      case "shipped":
        return "bg-purple-400/20 text-purple-400"
      case "delivered":
        return "bg-emerald-400/20 text-emerald-400"
      case "cancelled":
        return "bg-red-400/20 text-red-400"
      default:
        return "bg-gray-400/20 text-gray-400"
    }
  }

  // Calculate total profit from recent orders
  const calculateTotalProfit = (): number => {
    if (!stats?.recentOrders) return 0
    return stats.recentOrders.reduce((total: number, order: Order) => {
      return total + getOrderProfit(order)
    }, 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-black border border-yellow-400/20 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-black border border-yellow-400/20 rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-black border border-yellow-400/20 rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load statistics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Shoes</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.totalShoes}</p>
            </div>
            <Package className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-blue-400">{stats.totalOrders}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-green-400">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-400">LKR {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Profit</p>
              <p className="text-2xl font-bold text-emerald-400">LKR {calculateTotalProfit().toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-400" />
          </div>
        </motion.div>
      </div>

      {/* Recent Orders and Top Shoes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders - Show only 5 */}
        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-yellow-400" />
            <span>Recent Orders (Latest 5)</span>
          </h3>
          <div className="space-y-3">
            {stats.recentOrders.slice(0, 5).map((order: Order, index: number) => {
              const orderTotal = getOrderTotal(order)
              const orderProfit = getOrderProfit(order)
              return (
                <div key={order._id} className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{order.orderId || order._id}</p>
                    <p className="text-xs text-gray-400">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.shoe?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-400 text-sm">LKR {orderTotal.toLocaleString()}</p>
                    <p className="font-semibold text-emerald-400 text-xs">Profit: LKR {orderProfit.toLocaleString()}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Top Shoes */}
        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span>Top Selling Shoes</span>
          </h3>
          <div className="space-y-3">
            {stats.topShoes.map((shoe: any, index: number) => (
              <div key={shoe._id} className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={shoe.image || "/placeholder.svg"}
                    alt={shoe.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">{shoe.name}</p>
                    <p className="text-xs text-gray-400">{shoe.brand}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-yellow-400 text-sm">LKR {shoe.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{shoe.orderCount} orders</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
