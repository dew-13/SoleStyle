"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Package, Users, BarChart3, Settings } from "lucide-react"
import Header from "../components/Header"
import AdminStats from "./components/AdminStats"
import AddShoeModal from "./components/AddShoeModal"
import OrdersTable from "./components/OrdersTable"
import ShoesTable from "./components/ShoesTable"
import type { User } from "app/types"

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard") // Default to dashboard
  const [loading, setLoading] = useState(true)
  const [showAddShoeModal, setShowAddShoeModal] = useState(false)

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
          if (!userData.isAdmin) {
            window.location.href = "/"
            return
          }
          setUser(userData)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return null
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "shoes", label: "Manage Shoes", icon: Package },
    { id: "orders", label: "Orders", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Header user={user} setUser={setUser} />

      <div className="pt-20 px-4">
        <div className="container mx-auto">
          {/* Page Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Manage your OG Vault store</p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-wrap gap-2 bg-black p-2 rounded-lg border border-yellow-400/20">
              {tabs.map((tab) => {
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
                    <span className="hidden sm:inline">{tab.label}</span>
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
            {activeTab === "dashboard" && <AdminStats />}
            {activeTab === "shoes" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Manage Shoes</h2>
                  <motion.button
                    onClick={() => setShowAddShoeModal(true)}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Shoe</span>
                  </motion.button>
                </div>
                <ShoesTable />
              </div>
            )}
            {activeTab === "orders" && <OrdersTable />}
            {activeTab === "settings" && (
              <div className="bg-black border border-yellow-400/20 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Settings</h2>
                <p className="text-gray-400">Settings panel coming soon...</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add Shoe Modal */}
      {showAddShoeModal && <AddShoeModal isOpen={showAddShoeModal} onClose={() => setShowAddShoeModal(false)} />}
    </div>
  )
}
