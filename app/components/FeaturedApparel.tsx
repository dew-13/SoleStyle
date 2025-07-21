"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, ShoppingCart, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Apparel } from "app/types"

export default function FeaturedApparel() {
  const [featuredApparel, setFeaturedApparel] = useState<Apparel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedApparel = async () => {
      try {
        const response = await fetch("/api/apparel/featured")
        if (response.ok) {
          const data = await response.json()
          setFeaturedApparel(data)
        }
      } catch (error) {
        console.error("Error fetching featured apparel:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedApparel()
  }, [])

  if (loading) {
    return (
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-gray-800 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (featuredApparel.length === 0) {
    return null
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Featured T-Shirts
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Discover our collection of premium t-shirts from top brands
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {featuredApparel.map((apparel, index) => (
            <div className="card" key={apparel._id}>
              <div className="card2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {/* Product Image */}
                  <Link href={`/product/${apparel._id}`}>
                    <div className="aspect-square relative overflow-hidden rounded-2xl">
                      <div className="card-blur">
                        <Image
                          src={apparel.image || "/placeholder.svg"}
                          alt={apparel.name || "Apparel"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-2xl" />
                      </div>
                      <button className="card-button bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-2 px-1 min-w-0 w-auto rounded-lg font-semibold text-sm hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 text-center whitespace-nowrap">
                        More Info
                      </button>
                    </div>
                  </Link>
                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {apparel.name}
                      </h3>
                      {/* Add description above brand name */}
                      {apparel.description && (
                        <p className="text-gray-300 text-xs sm:text-sm mb-1 line-clamp-2">{apparel.description}</p>
                      )}
                      <p className="text-gray-400 text-xs sm:text-sm">{apparel.brand}</p>
                    </div>
                    <div className="flex items-center justify-between relative">
                      <span className="text-yellow-400 font-bold text-sm sm:text-base">
                        LKR {apparel.price?.toLocaleString()}
                      </span>
                      {apparel.retailPrice && apparel.retailPrice > apparel.price && (
                        <span className="text-gray-500 text-xs line-through">
                          LKR {apparel.retailPrice?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {/* Removed sizes and cart icon */}
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 sm:mt-12"
        >
          <Link
            href="/shop?tab=apparel"
          >
            <button className="learn-more">
              <span className="circle" aria-hidden="true">
                <span className="icon arrow"></span>
              </span>
              <span className="button-text">Shop Now</span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
} 