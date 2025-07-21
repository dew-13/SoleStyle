"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import type { Shoe } from "app/types"

export default function FeaturedShoes() {
  const [featuredShoes, setFeaturedShoes] = useState<Shoe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedShoes = async () => {
      try {
        const response = await fetch("/api/shoes/featured")
        if (response.ok) {
          const data = await response.json()
          setFeaturedShoes(data)
        }
      } catch (error) {
        console.error("Error fetching featured shoes:", error)
     
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedShoes()
  }, [])

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-800 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-black rounded-lg p-6 animate-pulse border border-yellow-400/20">
                <div className="h-48 bg-gray-800 rounded mb-4"></div>
                <div className="h-6 bg-gray-800 rounded mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-800 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-black">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Featured Shoes
          </h2>
          <p className="text-gray-400 text-lg">Discover our handpicked selection original footwear</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredShoes.map((shoe, index) => (
            <div className="card" key={shoe._id}>
              <div className="card2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {/* Product Image */}
                  <Link href={`/product/${shoe._id}`}>
                    <div className="aspect-square relative overflow-hidden rounded-2xl">
                      <div className="card-blur">
                        <Image
                          src={shoe.image || "/placeholder.svg"}
                          alt={shoe.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-2xl" />
                      </div>
                      <button className="card-button bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-2 px-0 min-w-0 w-auto rounded-lg font-semibold text-sm hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 text-center whitespace-nowrap">
                        More Info
                      </button>
                    </div>
                  </Link>
                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {shoe.name}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">{shoe.brand}</p>
                    </div>
                    <div className="flex items-center justify-between relative">
                      <span className="text-yellow-400 font-bold text-sm sm:text-base">
                        LKR {shoe.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Shoes Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link href="/shop?tab=shoes">
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
