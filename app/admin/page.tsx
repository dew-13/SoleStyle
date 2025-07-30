"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Package, Users, ShoppingBag, BarChart3, Settings, Shirt } from "lucide-react"
import Header from "../components/Header"
import AdminStats from "./components/AdminStats"
import AddShoeModal from "./components/AddShoeModal"
import AddApparelModal from "./components/AddApparelModal"
import OrdersTable from "./components/OrdersTable"
import ShoesTable from "./components/ShoesTable"
import ApparelTable from "./components/ApparelTable"
import type { User } from "app/types"

// Add a simple ShoeIcon SVG component
const ShoeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 17h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z" />
    <path d="M17 17V7a2 2 0 0 0-2-2H7.5a2 2 0 0 0-1.7 1l-3.3 6a2 2 0 0 0 1.7 3h13.8z" />
    <path d="M6 10h.01" />
  </svg>
)

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard") // Default to dashboard
  const [loading, setLoading] = useState(true)
  const [showAddShoeModal, setShowAddShoeModal] = useState(false)
  const [showAddApparelModal, setShowAddApparelModal] = useState(false)
  const [apparelTableKey, setApparelTableKey] = useState(0)

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      if (tabParam === 'shoes' || tabParam === 'apparel' || tabParam === 'orders' || tabParam === 'dashboard') {
        setActiveTab(tabParam)
      }
    }
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
    { id: "shoes", label: "Manage Shoes", icon: ShoeIcon }, // Use ShoeIcon here
    { id: "apparel", label: "Manage Apparel", icon: Shirt },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Header user={user} setUser={setUser} />

      <div className="pt-16 sm:pt-20 px-2 sm:px-4">
        <div className="container mx-auto max-w-full sm:max-w-5xl xl:max-w-7xl">
          {/* Page Header */}
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage your OG Vault store</p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-wrap gap-2 bg-black p-1 sm:p-2 rounded-lg border border-yellow-400/20">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-all text-xs sm:text-sm ${
                      activeTab === tab.id
                        ? "bg-yellow-400 text-black"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden xs:inline sm:inline">{tab.label}</span>
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <h2 className="text-xl sm:text-2xl font-semibold">Manage Shoes</h2>
                  <motion.button
                    onClick={() => setShowAddShoeModal(true)}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 sm:px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
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
            {activeTab === "apparel" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <h2 className="text-xl sm:text-2xl font-semibold">Manage Apparel</h2>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => setShowAddApparelModal(true)}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 sm:px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Apparel</span>
                    </motion.button>
                  </div>
                </div>
                <ApparelTable key={apparelTableKey} />
              </div>
            )}
            {activeTab === "orders" && <OrdersTable />}
            {activeTab === "settings" && (
              <div className="bg-black border border-yellow-400/20 rounded-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Settings</h2>
                <p className="text-gray-400 text-sm sm:text-base">Settings panel coming soon...</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add Shoe Modal */}
      {showAddShoeModal && <AddShoeModal isOpen={showAddShoeModal} onClose={() => setShowAddShoeModal(false)} />}
      
      {/* Add Apparel Modal */}
      {showAddApparelModal && <AddApparelModal isOpen={showAddApparelModal} onClose={() => setShowAddApparelModal(false)} onAdded={() => { setApparelTableKey(k => k + 1); setActiveTab('apparel'); }} />}
    </div>
  )
}
