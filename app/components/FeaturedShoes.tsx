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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredShoes.map((shoe, index) => (
          <Link href={`/product/${shoe._id}`} key={shoe._id} className="block group">
            <motion.div
              key={shoe._id}
              className="bg-black border border-yellow-400/20 rounded-lg overflow-hidden hover:border-yellow-400/50 transition-all duration-300 group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="relative overflow-hidden">
                <Image
                  src={shoe.image || "/placeholder.svg"}
                  alt={shoe.name}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-6">
                {/* Fixed height container for shoe name - always 2 lines */}
                <div className="h-14 mb-2">
                  <h3 className="text-xl font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2 leading-7">
                    {shoe.name}
                  </h3>
                </div>
                <p className="text-gray-400 mb-3">{shoe.brand}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-yellow-400">LKR {shoe.price?.toLocaleString()}</span>
                 
                    <motion.button
                      className=" text-gray-400 px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Details
                    </motion.button>
                  
                </div>
              </div>
            </motion.div>
          </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
