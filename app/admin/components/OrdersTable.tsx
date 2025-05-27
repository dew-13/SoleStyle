"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Eye,
  Search,
  Download,
  Calendar,
  User,
  Package,
  DollarSign,
  Filter,
  RefreshCw,
  Phone,
  Edit,
  X,
} from "lucide-react"

export default function OrdersTable() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const orderStatuses = [
    { value: "pending", label: "Order received and pending payment" },
    { value: "payment_received", label: "Full Payment received" },
    { value: "installment_received", label: "Installment received and pending installments" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
        setFilteredOrders(data)
      } else {
        // Fallback data if API fails
        const fallbackOrders = [
          {
            _id: "1",
            orderId: "OG001234",
            customerName: "John Doe",
            customerContact: "+1-416-555-0123",
            customerEmail: "john.doe@example.com",
            shoe: { name: "Air Jordan 1 Retro High", brand: "Nike" },
            size: "10",
            quantity: 1,
            totalPrice: 170,
            status: "pending",
            createdAt: new Date().toISOString(),
            shippingAddress: {
              street: "123 Main St",
              city: "Toronto",
              state: "ON",
              zipCode: "M5V 2K7",
            },
            paymentMethod: "full",
          },
          {
            _id: "2",
            orderId: "OG001235",
            customerName: "Jane Smith",
            customerContact: "+1-647-555-0456",
            customerEmail: "jane.smith@example.com",
            shoe: { name: "Yeezy Boost 350 V2", brand: "Adidas" },
            size: "8.5",
            quantity: 1,
            totalPrice: 220,
            status: "payment_received",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            shippingAddress: {
              street: "456 Elm St",
              city: "Toronto",
              state: "ON",
              zipCode: "M6G 1H5",
            },
            paymentMethod: "full",
          },
          {
            _id: "3",
            orderId: "OG001236",
            customerName: "Mike Johnson",
            customerContact: "+1-905-555-0789",
            customerEmail: "mike.johnson@example.com",
            shoe: { name: "Chuck 70 High Top", brand: "Converse" },
            size: "9",
            quantity: 2,
            totalPrice: 170,
            status: "shipped",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            shippingAddress: {
              street: "789 Oak St",
              city: "Toronto",
              state: "ON",
              zipCode: "M4W 2S8",
            },
            paymentMethod: "full",
          },
        ]
        setOrders(fallbackOrders)
        setFilteredOrders(fallbackOrders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
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
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shoe?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerContact?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toDateString() === filterDate.toDateString()
      })
    }

    setFilteredOrders(filtered)
  }, [searchTerm, statusFilter, dateFilter, orders])

  const refreshOrders = async () => {
    setRefreshing(true)
    await fetchOrders()
  }

  const updateOrderStatus = async (orderId, newStatus) => {
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
        setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)))
        setShowEditModal(false)
        setEditingOrder(null)
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const exportOrders = () => {
    const csvContent = [
      ["Order ID", "Customer Name", "Phone", "Shoe", "Brand", "Size", "Quantity", "Amount", "Status", "Date"].join(","),
      ...filteredOrders.map((order) =>
        [
          order.orderId,
          order.customerName,
          order.customerContact,
          `"${order.shoe.name}"`,
          order.shoe.brand,
          order.size,
          order.quantity,
          order.totalPrice,
          order.status,
          new Date(order.createdAt).toLocaleDateString(),
        ].join(","),
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

  const getStatusColor = (status) => {
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

  const getStatusLabel = (status) => {
    const statusObj = orderStatuses.find((s) => s.value === status)
    return statusObj ? statusObj.label : status
  }

  if (loading) {
    return (
      <div className="bg-gray-900 border border-yellow-400/20 rounded-lg p-6">
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
        className="bg-gray-900 border border-yellow-400/20 rounded-lg p-6"
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
              {orderStatuses.map((status) => (
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
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Total Value</span>
            </div>
            <p className="text-xl font-bold text-green-400">
              LKR  {filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-black/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Customers</span>
            </div>
            <p className="text-xl font-bold text-purple-400">
              {new Set(filteredOrders.map((order) => order.customerName)).size}
            </p>
          </div>
          <div className="bg-black/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Avg. Order</span>
            </div>
            <p className="text-xl font-bold text-yellow-400">
              LKR  {filteredOrders.length > 0
                ? Math.round( filteredOrders.reduce(( sum, order) => sum + order.totalPrice, 0) / filteredOrders.length)
                : 0}
            </p>
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
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
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
                          {order.orderId}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{order.customerName}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <p className="text-sm text-gray-400">{order.customerContact}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{order.shoe.name}</p>
                        <p className="text-sm text-gray-400">{order.shoe.brand}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p>
                          Size: <span className="font-medium">{order.size}</span>
                        </p>
                        <p>
                          Qty: <span className="font-medium">{order.quantity}</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                       
                        <span className="font-semibold text-yellow-400">LK {order.totalPrice}</span>
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
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
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
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-600 rounded hover:bg-gray-800 transition-colors text-sm">
                Previous
              </button>
              <button className="px-3 py-1 bg-yellow-400 text-black rounded font-medium text-sm">1</button>
              <button className="px-3 py-1 border border-gray-600 rounded hover:bg-gray-800 transition-colors text-sm">
                Next
              </button>
            </div>
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
                        <span className="text-gray-400">Order ID:</span> {selectedOrder.orderId}
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
                        <span className="text-gray-400">Name:</span> {selectedOrder.customerName}
                      </p>
                      <p>
                        <span className="text-gray-400">Phone:</span> {selectedOrder.customerContact}
                      </p>
                      <p>
                        <span className="text-gray-400">Email:</span> {selectedOrder.customerEmail}
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-yellow-400">Product Details</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-400">Product:</span> {selectedOrder.shoe.name}
                      </p>
                      <p>
                        <span className="text-gray-400">Brand:</span> {selectedOrder.shoe.brand}
                      </p>
                      <p>
                        <span className="text-gray-400">Size:</span> {selectedOrder.size}
                      </p>
                      <p>
                        <span className="text-gray-400">Quantity:</span> {selectedOrder.quantity}
                      </p>
                      <p>
                        <span className="text-gray-400">Total:</span>{" "}
                        <span className="text-yellow-400 font-bold">
                          LKR {selectedOrder.totalPrice.toLocaleString()}
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
              className="bg-gray-900 border border-yellow-400/20 rounded-lg w-full max-w-md"
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
                  <p className="text-sm text-gray-400 mb-2">Order: {editingOrder.orderId}</p>
                  <p className="font-medium">{editingOrder.shoe.name}</p>
                  <p className="text-sm text-gray-400">{editingOrder.customerName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Order Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                  >
                    {orderStatuses.map((status) => (
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
