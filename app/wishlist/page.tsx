"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function WishlistPage() {
  const [user, setUser] = useState(null)
  const [wishlistItems, setWishlistItems] = useState([])
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
          fetchWishlist(token)
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

  const fetchWishlist = async (token) => {
    try {
      const response = await fetch("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data)
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (shoeId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shoeId }),
      })

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item._id !== shoeId))
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-black rounded-lg p-4">
                    <div className="h-48 bg-gray-800 rounded mb-4"></div>
                    <div className="h-6 bg-gray-800 rounded mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-20"></div>
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
            <Link href="/shop">
              <button className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Shop</span>
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
              <Heart className="w-8 h-8 text-yellow-400" />
              <span>My Wishlist</span>
            </h1>
            <p className="text-gray-400">Your saved shoes ({wishlistItems.length} items)</p>
          </motion.div>

          {/* Wishlist Items */}
          {wishlistItems.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {wishlistItems.map((shoe, index) => (
                <motion.div
                  key={shoe._id}
                  className="bg-black border border-yellow-400/20 rounded-lg overflow-hidden hover:border-yellow-400/50 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={(shoe.images && shoe.images[0]) || shoe.image || "/placeholder.svg"}
                      alt={shoe.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <button
                      onClick={() => removeFromWishlist(shoe._id)}
                      className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500/50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1 text-white group-hover:text-yellow-400 transition-colors">
                      {shoe.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">{shoe.brand}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-yellow-400">${shoe.price}</span>
                      <div className="flex space-x-2">
                        <Link href={`/product/${shoe._id}`}>
                          <motion.button
                            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1.5 rounded-lg font-semibold text-sm hover:from-yellow-500 hover:to-yellow-700 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View
                          </motion.button>
                        </Link>
                      </div>
                    </div>
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
              <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-gray-400">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Start adding shoes you love to your wishlist</p>
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
