"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const hardcodedBrands = [
  { _id: "1", name: "Nike", logo: "/nike.svg" },
  { _id: "2", name: "Adidas", logo: "/adidas.svg" },
  { _id: "3", name: "Converse", logo: "/converse.svg" },
  { _id: "4", name: "Puma", logo: "/puma.svg" },
  { _id: "5", name: "Vans", logo: "/vans.svg" },
  { _id: "6", name: "New Balance", logo: "/nb.svg" },
]

export default function PopularBrands() {
  // Set brands directly, no loading state or useEffect needed
  const brands = hardcodedBrands

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
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Popular Brands
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {brands.map((brand, index) => (
            <motion.div
              key={brand._id}
              className="bg-white border border-yellow-400/20 rounded-lg p-6 hover:border-yellow-400/50 transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              onClick={() => (window.location.href = `/shop?brand=${brand.name}`)}
            >
              <div className="flex flex-col items-center">
                <Image
                  src={brand.logo || "/placeholder.svg"}
                  alt={brand.name}
                  width={80}
                  height={80}
                  className="mb-4 group-hover:scale-110 transition-transform duration-300"
                />
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-yellow-400 transition-colors">
                  {brand.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}