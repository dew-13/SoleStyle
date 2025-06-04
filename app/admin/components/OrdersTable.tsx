"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, Search, Download, Calendar, User, Package, Filter, RefreshCw, Phone, Edit, X, DollarSign } from 'lucide-react'
import type { Order } from "app/types"

interface OrderStatus {
  value: string
  label: string
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const orderStatuses: OrderStatus[] = [
    { value: "pending", label: "Pending Payment" },
    { value: "payment_received", label: "Payment Received" },
    { value: "installment_received", label: "Installment Received" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ]

  // Helper function to get order total with fallback
  const getOrderTotal = (order: Order): number => {
    return order.total || order.totalPrice || (order.shoe?.price * order.quantity) || 0
  }

  // Helper function to get order profit
  const getOrderProfit = (order: Order): number => {
    const profit = order.shoe?.profit || 0
    return profit * order.quantity
  }

  const fetchOrders = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data: Order[] = await response.json()
        const ordersWithTotals = data.map((order) => ({
          ...order,
          total: getOrderTotal(order),
        }))
        setOrders(ordersWithTotals || [])
        setFilteredOrders(ordersWithTotals || [])
      } else {
        // Fallback data with proper totals and profit
        const fallbackOrders: Order[] = [
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
            totalPrice: 28500,
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
            totalPrice: 36800,
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
            totalPrice: 45000,
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
        ]
        setOrders(fallbackOrders)
        setFilteredOrders(fallbackOrders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setOrders([])
      setFilteredOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter orders based on search term, status, and date
  useEffect(() => {
    let filtered = [...orders]

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order: Order) =>
          order.orderId?.toLowerCase().includes(searchLower) ||
          order.customerName?.toLowerCase().includes(searchLower) ||
          order.shoe?.name?.toLowerCase().includes(searchLower) ||
          order.customerPhone?.toLowerCase().includes(searchLower) ||
          order.customerEmail?.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((order: Order) => order.status === statusFilter)
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter((order: Order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toDateString() === filterDate.toDateString()
      })
    }

    setFilteredOrders(filtered)
  }, [searchTerm, statusFilter, dateFilter, orders])

  const refreshOrders = async (): Promise<void> => {
    setRefreshing(true)
    await fetchOrders()
  }

  const updateOrderStatus = async (orderId: string, newStatus: string): Promise<void> => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders((prev: Order[]) =>
          prev.map((order: Order) =>
            order._id === orderId ? { ...order, status: newStatus as Order["status"] } : order
          )
        )
        setShowEditModal(false)
        setEditingOrder(null)
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const exportOrders = (): void => {
    const csvContent = [
      ["Order ID", "Customer Name", "Phone", "Shoe", "Brand", "Size", "Quantity", "Amount", "Profit", "Status", "Date"].join(","),
      ...filteredOrders.map((order: Order) =>
        [
          order.orderId || "",
          order.customerName || "",
          order.customerPhone || "",
          `"${order.shoe?.name || ""}"`,
          order.shoe?.brand || "",
          order.size || "",
          order.quantity || 0,
          getOrderTotal(order),
          getOrderProfit(order),
          order.status || "",
          new Date(order.createdAt).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `og-vault-orders-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

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

  const getStatusLabel = (status: string): string => {
    const statusObj = orderStatuses.find((s: OrderStatus) => s.value === status)
    return statusObj ? statusObj.label : status
  }

  // Calculate total profit instead of total value
  const calculateTotalProfit = (): number => {
    return filteredOrders.reduce((sum: number, order: Order) => sum + getOrderProfit(order), 0)
  }

  const calculateAverageOrder = (): number => {
    if (filteredOrders.length === 0) return 0
    const totalValue = filteredOrders.reduce((sum: number, order: Order) => sum + getOrderTotal(order), 0)
    return Math.round(totalValue / filteredOrders.length)
  }

  if (loading) {
    return (
      <div className="bg-black border border-yellow-400/20 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-800 rounded w-1/4"></div>
            <div className="h-10 bg-gray-800 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-800 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        className="bg-black border border-yellow-400/20 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <h2 className="text-2xl font-semibold flex items-center space-x-2">
            <Package className="w-6 h-6 text-yellow-400" />
            <span>Order Management</span>
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={refreshOrders}
              disabled={refreshing}
              className="bg-gray-800 border border-yellow-400/20 text-yellow-400 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400/10 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportOrders}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none text-sm"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none text-sm appearance-none"
            >
              <option value="">All Status</option>
              {orderStatuses.map((status: OrderStatus) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none text-sm"
            />
          </div>

          <button
            onClick={() => {
              setSearchTerm("")
              setStatusFilter("")
              setDateFilter("")
            }}
            className="px-4 py-2 border border-yellow-400/20 text-yellow-400 rounded-lg hover:bg-yellow-400/10 transition-all text-sm"
          >
            Clear Filters
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Total Orders</span>
            </div>
            <p className="text-xl font-bold text-blue-400">{filteredOrders.length}</p>
          </div>
          <div className="bg-black/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-400">Total Profit</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">LKR {calculateTotalProfit().toLocaleString()}</p>
          </div>
          <div className="bg-black/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Customers</span>
            </div>
            <p className="text-xl font-bold text-purple-400">
              {new Set(filteredOrders.map((order: Order) => order.customerName)).size}
            </p>
          </div>
          <div className="bg-black/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Avg. Order</span>
            </div>
            <p className="text-xl font-bold text-yellow-400">LKR {calculateAverageOrder().toLocaleString()}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold">Customer</th>
                <th className="text-left py-3 px-4 font-semibold">Product</th>
                <th className="text-left py-3 px-4 font-semibold">Details</th>
                <th className="text-left py-3 px-4 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 font-semibold">Profit</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order: Order, index: number) => {
                  const orderTotal = getOrderTotal(order)
                  const orderProfit = getOrderProfit(order)
                  return (
                    <motion.tr
                      key={order._id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-yellow-400" />
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowOrderDetails(true)
                            }}
                            className="font-mono text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors underline"
                          >
                            {order.orderId || order._id}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{order.customerName || "N/A"}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <p className="text-sm text-gray-400">{order.customerPhone || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{order.shoe?.name || "N/A"}</p>
                          <p className="text-sm text-gray-400">{order.shoe?.brand || "N/A"}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p>
                            Size: <span className="font-medium">{order.size || "N/A"}</span>
                          </p>
                          <p>
                            Qty: <span className="font-medium">{order.quantity || 0}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-400">LKR</span>
                          <span className="font-semibold text-yellow-400">{orderTotal.toLocaleString()}</span>
                        </div>
                        {orderTotal === 0 && <p className="text-xs text-red-400 mt-1">Amount missing</p>}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-400">LKR</span>
                          <span className="font-semibold text-emerald-400">{orderProfit.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingOrder(order)
                              setShowEditModal(true)
                            }}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowOrderDetails(true)
                            }}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-gray-400 hover:text-white" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-lg">No orders found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-400">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        )}
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && selectedOrder && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-black border border-yellow-400/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-2xl font-semibold">Order Details</h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-black/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-yellow-400">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-400">Order ID:</span> {selectedOrder.orderId || selectedOrder._id}
                      </p>
                      <p>
                        <span className="text-gray-400">Date:</span>{" "}
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="text-gray-400">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusLabel(selectedOrder.status)}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-400">Payment:</span>{" "}
                        {selectedOrder.paymentMethod === "full" ? "Full Payment" : "Installments"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-yellow-400">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-400">Name:</span> {selectedOrder.customerName || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-400">Phone:</span> {selectedOrder.customerPhone || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-400">Email:</span> {selectedOrder.customerEmail || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-yellow-400">Product Details</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-400">Product:</span> {selectedOrder.shoe?.name || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-400">Brand:</span> {selectedOrder.shoe?.brand || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-400">Size:</span> {selectedOrder.size || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-400">Quantity:</span> {selectedOrder.quantity || 0}
                      </p>
                      <p>
                        <span className="text-gray-400">Unit Price:</span>{" "}
                        <span className="text-white">LKR {(selectedOrder.shoe?.price || 0).toLocaleString()}</span>
                      </p>
                      <p>
                        <span className="text-gray-400">Total:</span>{" "}
                        <span className="text-yellow-400 font-bold text-lg">
                          LKR {getOrderTotal(selectedOrder).toLocaleString()}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-400">Profit:</span>{" "}
                        <span className="text-emerald-400 font-bold text-lg">
                          LKR {getOrderProfit(selectedOrder).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div className="bg-black/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-yellow-400">Shipping Address</h3>
                    <div className="text-sm">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                        {selectedOrder.shippingAddress.zipCode}
                      </p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Order Status Modal */}
      <AnimatePresence>
        {showEditModal && editingOrder && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-black border border-yellow-400/20 rounded-lg w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Update Order Status</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Order: {editingOrder.orderId || editingOrder._id}</p>
                  <p className="font-medium">{editingOrder.shoe?.name || "N/A"}</p>
                  <p className="text-sm text-gray-400">{editingOrder.customerName || "N/A"}</p>
                  <p className="text-sm text-yellow-400 font-semibold">
                    Amount: LKR {getOrderTotal(editingOrder).toLocaleString()}
                  </p>
                  <p className="text-sm text-emerald-400 font-semibold">
                    Profit: LKR {getOrderProfit(editingOrder).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Order Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as Order["status"] })}
                    className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                  >
                    {orderStatuses.map((status: OrderStatus) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateOrderStatus(editingOrder._id, editingOrder.status)}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
