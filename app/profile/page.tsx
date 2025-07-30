"use client"

import type React from "react"
import toast, { Toaster } from "react-hot-toast"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Package, Heart, Edit } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import Header from "../components/Header"
import Footer from "../components/Footer"
import type { User as UserType, Order, WishlistItem, ProfileData } from "app/types"

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<UserType | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [activeTab, setActiveTab] = useState<string>("profile")
  const [loading, setLoading] = useState<boolean>(true)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  })

  useEffect(() => {
    // Check for tab parameter in URL
    const tab = searchParams.get("tab")
    if (tab && ["profile", "orders", "wishlist"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    console.log("Orders state updated:", orders)
  }, [orders])

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
          setProfileData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || {
              street: "",
              city: "",
              state: "",
              zipCode: "",
            },
          })

          // Fetch user orders and wishlist
          fetchUserOrders(userData.id)
          fetchUserWishlist(userData.id)
        } else {
          window.location.href = "/auth/login"
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        window.location.href = "/auth/login"
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const fetchUserOrders = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/orders/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const ordersData = await response.json()
        setOrders(ordersData)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Could not fetch order history.")
    }
  }

  const fetchUserWishlist = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/wishlist/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const wishlistData = await response.json()
        setWishlist(wishlistData)
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      toast.error("Could not fetch wishlist.")
    }
  }

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        setEditMode(false)
        toast.success("Profile updated successfully!")
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error updating profile")
    }
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
      default:
        return "bg-gray-400/20 text-gray-400"
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "pending":
        return "Order received and pending payment"
      case "payment_received":
        return "Full Payment received"
      case "installment_received":
        return "Installment received and pending installments"
      case "shipped":
        return "Shipped"
      case "delivered":
        return "Delivered"
      default:
        return status
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1]
      setProfileData({
        ...profileData,
        address: {
          ...profileData.address,
          [addressField]: value,
        },
      })
    } else {
      setProfileData({
        ...profileData,
        [name]: value,
      })
    }
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-400">Manage your account and view your orders</p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-wrap gap-2 bg-black p-2 rounded-lg border border-yellow-400/20">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "orders", label: "Orders", icon: Package },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-yellow-400 text-black"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === "profile" && (
              <div className="bg-black border border-yellow-400/20 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Profile Information</h2>
                  <button
                    onClick={() => (editMode ? updateProfile() : setEditMode(true))}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{editMode ? "Save Changes" : "Edit Profile"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled={true}
                      className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="address.street"
                        placeholder="Street Address"
                        value={profileData.address.street}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none disabled:opacity-50"
                      />
                      <input
                        type="text"
                        name="address.city"
                        placeholder="City"
                        value={profileData.address.city}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none disabled:opacity-50"
                      />
                      <input
                        type="text"
                        name="address.state"
                        placeholder="State"
                        value={profileData.address.state}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none disabled:opacity-50"
                      />
                      <input
                        type="text"
                        name="address.zipCode"
                        placeholder="ZIP Code"
                        value={profileData.address.zipCode}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-black border border-yellow-400/20 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-6">Order History</h2>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="bg-black/50 rounded-lg p-4 border border-gray-700">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">Order ID: {order.orderId}</h3>
                            <p className="text-sm text-gray-500">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 font-bold text-xl">
                              LKR {(order.totalPrice || order.total || 0).toLocaleString()}
                            </p>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                        </div>
                        <div className="border-t border-gray-700 pt-4">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-4 mb-4">
                                <Image
                                  src={item.item?.image || "/placeholder.svg"}
                                  alt={item.item?.name || "Product Image"}
                                  width={80}
                                  height={80}
                                  className="rounded-lg"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold">{item.item?.name}</h4>
                                  <p className="text-gray-400 text-sm">{item.item?.brand}</p>
                                  <p className="text-gray-400 text-sm">
                                    Size: {item.size} | Qty: {item.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-yellow-400 font-semibold">
                                    LKR {(item.totalPrice || 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center space-x-4 mb-4">
                              <Image
                                src={order.shoe?.image || order.apparel?.image || "/placeholder.svg"}
                                alt={order.shoe?.name || order.apparel?.name || "Product Image"}
                                width={80}
                                height={80}
                                className="rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold">{order.shoe?.name || order.apparel?.name}</h4>
                                <p className="text-gray-400 text-sm">{order.shoe?.brand || order.apparel?.brand}</p>
                                <p className="text-gray-400 text-sm">
                                  Size: {order.size} | Qty: {order.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-yellow-400 font-semibold">
                                  LKR {(order.total || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                          <div>
                            <span className="text-gray-400">Payment:</span>
                            <p className="font-medium">
                              {order.paymentMethod === "full" ? "Full Payment" : "Installments"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                    <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
                    <a
                      href="/shop"
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
                    >
                      Shop Now
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-black border border-yellow-400/20 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-6">My Wishlist</h2>
                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div
                        key={item._id || item.shoe?._id}
                        className="bg-black/50 rounded-lg overflow-hidden border border-gray-700 hover:border-yellow-400/50 transition-all"
                      >
                        <Image
                          src={item.shoe?.image || "/placeholder.svg"}
                          alt={item.shoe?.name || "Shoe"}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <div className="h-14 mb-2">
                            <h3 className="font-semibold line-clamp-2 leading-7">{item.shoe?.name}</h3>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{item.shoe?.brand}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-yellow-400 font-bold">
                              LKR {item.shoe?.price ? item.shoe.price.toLocaleString() : (item.price || 0).toLocaleString()}
                            </span>
                            {item.shoe ? (
                              <a
                                href={`/product/${item.shoe._id}`}
                                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1.5 rounded-lg font-semibold text-sm hover:from-yellow-500 hover:to-yellow-700 transition-all"
                              >
                                View
                              </a>
                            ) : (
                              <a
                                href={`/apparel/${item._id}`}
                                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1.5 rounded-lg font-semibold text-sm hover:from-yellow-500 hover:to-yellow-700 transition-all"
                              >
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-400 mb-6">Add items to your wishlist to save them for later</p>
                    <a
                      href="/shop"
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
                    >
                      Browse Shoes
                    </a>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
