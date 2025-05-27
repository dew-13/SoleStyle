"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, X, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "../components/Header"
import Footer from "../components/Footer"
import type { User, Shoe } from "app/types"

export default function ShopPage() {
  const [user, setUser] = useState<User | null>(null)
  const [shoes, setShoes] = useState<Shoe[]>([])
  const [filteredShoes, setFilteredShoes] = useState<Shoe[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [wishlist, setWishlist] = useState<string[]>([])

  // Famous basketball brands
  const basketballBrands = [
    "Nike",
    "Adidas",
    "Puma",
    "Anta",
    "Under Armour",
    "Peak",
    "Reebok",
    "Li-Ning",
    "Jordan",
    "Converse",
    "New Balance",
    "Vans",
    "FILA",
    "Champion",
  ]

  // Available shoe sizes
  const sizes = ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const response = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
            // Load user's wishlist
            loadWishlist(userData.id)
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }
    checkAuth()
  }, [])

  const loadWishlist = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/wishlist/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const wishlistData = await response.json()
        setWishlist(wishlistData.map((item: any) => item.shoeId))
      }
    } catch (error) {
      console.error("Error loading wishlist:", error)
    }
  }

  const toggleWishlist = async (shoeId: string) => {
    if (!user) {
      alert("Please login to add items to wishlist")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const isInWishlist = wishlist.includes(shoeId)

      const response = await fetch("/api/wishlist", {
        method: isInWishlist ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shoeId }),
      })

      if (response.ok) {
        if (isInWishlist) {
          setWishlist((prev) => prev.filter((id) => id !== shoeId))
        } else {
          setWishlist((prev) => [...prev, shoeId])
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch shoes
        const shoesResponse = await fetch("/api/shoes")
        if (shoesResponse.ok) {
          const shoesData = await shoesResponse.json()
          setShoes(shoesData)
          setFilteredShoes(shoesData)
        } else {
          // Fallback data for shoes
          const fallbackShoes: Shoe[] = [
            {
              _id: "1",
              name: "Air Max 270",
              brand: "Nike",
              price: 150,
              image: "/placeholder.svg?height=300&width=400",
              sizes: ["8", "8.5", "9", "9.5", "10", "10.5", "11"],
              description: "Comfortable running shoe",
              featured: false,
              createdAt: new Date().toISOString(),
            },
            {
              _id: "2",
              name: "Ultra Boost 22",
              brand: "Adidas",
              price: 180,
              image: "/placeholder.svg?height=300&width=400",
              sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10"],
              description: "Premium running shoe",
              featured: false,
              createdAt: new Date().toISOString(),
            },
          ]
          setShoes(fallbackShoes)
          setFilteredShoes(fallbackShoes)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter shoes based on search term, brand, and size
  useEffect(() => {
    let filtered = shoes

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (shoe) =>
          shoe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shoe.brand.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by brand
    if (selectedBrand) {
      filtered = filtered.filter((shoe) => shoe.brand === selectedBrand)
    }

    // Filter by size
    if (selectedSize) {
      filtered = filtered.filter((shoe) => shoe.sizes && shoe.sizes.includes(selectedSize))
    }

    setFilteredShoes(filtered)
  }, [searchTerm, selectedBrand, selectedSize, shoes])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedBrand("")
    setSelectedSize("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header user={user} setUser={setUser} />
        <div className="pt-20 px-4">
          <div className="container mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-800 rounded w-32 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-lg p-4">
                    <div className="h-48 bg-gray-800 rounded mb-4"></div>
                    <div className="h-6 bg-gray-800 rounded mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-800 rounded w-16"></div>
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
          {/* Page Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Shop Shoes
            </h1>
            <p className="text-gray-400">Discover our complete collection of premium basketball footwear</p>
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div
            className="mb-8 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search shoes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none text-white"
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center space-x-2 bg-black border border-yellow-400/20 px-4 py-2 rounded-lg"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              {/* Clear Filters */}
              {(selectedBrand || selectedSize || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300"
                >
                  <X className="w-4 h-4" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            {/* Filter Options */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${showFilters ? "block" : "hidden md:grid"}`}>
              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-black border border-yellow-400/20 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none text-white"
              >
                <option value="">All Brands</option>
                {basketballBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              {/* Size Filter */}
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="bg-black border border-yellow-400/20 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none text-white"
              >
                <option value="">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    Size {size}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-gray-400">
              Showing {filteredShoes.length} of {shoes.length} shoes
            </p>
          </motion.div>

          {/* Shoes Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {filteredShoes.map((shoe, index) => (
              <motion.div
                key={shoe._id}
                className="bg-black border border-yellow-400/20 rounded-lg overflow-hidden hover:border-yellow-400/50 transition-all duration-300 group relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(shoe._id)}
                  className="absolute top-3 right-3 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      wishlist.includes(shoe._id) ? "text-red-500 fill-current" : "text-white hover:text-red-500"
                    }`}
                  />
                </button>

                <div className="relative overflow-hidden">
                  <Image
                    src={shoe.image || "/placeholder.svg"}
                    alt={shoe.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1 text-white group-hover:text-yellow-400 transition-colors">
                    {shoe.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">{shoe.brand}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-yellow-400">LKR {shoe.price.toLocaleString()}</span>
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
              </motion.div>
            ))}
          </motion.div>

          {/* No Results */}
          {filteredShoes.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-gray-400">No shoes found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
