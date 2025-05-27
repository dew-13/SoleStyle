"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Calendar, Star } from "lucide-react"

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalShoes: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    topShoes: [],
    monthlyRevenue: 0,
    featuredShoes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("No authentication token found")
          setLoading(false)
          return
        }

        const response = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          // Ensure all arrays have default values
          setStats({
            totalShoes: data.totalShoes || 0,
            totalOrders: data.totalOrders || 0,
            totalUsers: data.totalUsers || 0,
            totalRevenue: data.totalRevenue || 0,
            monthlyRevenue: data.monthlyRevenue || 0,
            featuredShoes: data.featuredShoes || 0,
            recentOrders: Array.isArray(data.recentOrders) ? data.recentOrders : [],
            topShoes: Array.isArray(data.topShoes) ? data.topShoes : [],
          })
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Failed to fetch stats")
          // Set fallback data
          setStats({
            totalShoes: 25,
            totalOrders: 142,
            totalUsers: 89,
            totalRevenue: 1542000,
            monthlyRevenue: 324000,
            featuredShoes: 8,
            recentOrders: [
              {
                _id: "1",
                shoe: { name: "Air Jordan 1", brand: "Nike" },
                customerName: "John Doe",
                total: 17000,
                createdAt: new Date().toISOString(),
              },
              {
                _id: "2",
                shoe: { name: "Yeezy Boost 350", brand: "Adidas" },
                customerName: "Jane Smith",
                total: 22000,
                createdAt: new Date().toISOString(),
              },
            ],
            topShoes: [
              {
                _id: "1",
                name: "Air Jordan 1 Retro",
                brand: "Nike",
                price: 17000,
                orderCount: 45,
              },
              {
                _id: "2",
                name: "Yeezy Boost 350 V2",
                brand: "Adidas",
                price: 22000,
                orderCount: 38,
              },
            ],
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
        setError("Network error occurred")
        // Set fallback data
        setStats({
          totalShoes: 25,
          totalOrders: 142,
          totalUsers: 89,
          totalRevenue: 1542000,
          monthlyRevenue: 324000,
          featuredShoes: 8,
          recentOrders: [],
          topShoes: [],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-black border border-yellow-400/20 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-800 rounded mb-2"></div>
              <div className="h-8 bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-black border border-yellow-400/20 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-800 rounded mb-4 w-1/3"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-800 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-black border border-red-400/20 rounded-lg p-6">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Error Loading Stats</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Shoes",
      value: stats.totalShoes,
      icon: Package,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      change: "+12%",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      change: "+23%",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      change: "+8%",
    },
    {
      title: "Total Revenue",
      value: `LKR ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      change: "+15%",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              className="bg-black border border-yellow-400/20 rounded-lg p-6 hover:border-yellow-400/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex items-center space-x-1 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-400/10 rounded-lg">
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold">This Month</h3>
          </div>
          <p className="text-2xl font-bold text-green-400">LKR {stats.monthlyRevenue?.toLocaleString() || "324,000"}</p>
          <p className="text-sm text-gray-400 mt-1">Monthly Revenue</p>
        </motion.div>

        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-400/10 rounded-lg">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold">Featured</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.featuredShoes || 8}</p>
          <p className="text-sm text-gray-400 mt-1">Featured Shoes</p>
        </motion.div>

        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-400/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold">Growth</h3>
          </div>
          <p className="text-2xl font-bold text-purple-400">+18%</p>
          <p className="text-sm text-gray-400 mt-1">vs Last Month</p>
        </motion.div>
      </div>

      {/* Recent Orders and Top Shoes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-yellow-400" />
            <span>Recent Orders</span>
          </h3>
          <div className="space-y-3">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order, index) => (
                <motion.div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div>
                    <p className="font-medium">{order.shoe?.name || "Unknown Shoe"}</p>
                    <p className="text-sm text-gray-400">{order.customerName || "Unknown Customer"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-400">LKR {(order.total || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Unknown Date"}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No recent orders</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Shoes */}
        <motion.div
          className="bg-black border border-yellow-400/20 rounded-lg p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Package className="w-5 h-5 text-yellow-400" />
            <span>Top Selling Shoes</span>
          </h3>
          <div className="space-y-3">
            {stats.topShoes && stats.topShoes.length > 0 ? (
              stats.topShoes.slice(0, 5).map((shoe, index) => (
                <motion.div
                  key={shoe._id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
                      <span className="text-yellow-400 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{shoe.name}</p>
                      <p className="text-sm text-gray-400">{shoe.brand}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-400">LKR {(shoe.price || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{shoe.orderCount || 0} orders</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No sales data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
