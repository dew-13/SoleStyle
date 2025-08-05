"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Star, Truck } from "lucide-react"

const confidenceData = [
  {
    _id: "1",
    title: "Verified Authentic",
    icon: <ShieldCheck className="w-12 h-12 text-yellow-400" />,
    description: "Every item is rigorously checked by our team of experts.",
  },
  {
    _id: "2",
    title: "Rave Reviews",
    icon: <Star className="w-12 h-12 text-yellow-400" />,
    description: "4.9/5 stars from over 10,000 satisfied customers.",
  },
  {
    _id: "3",
    title: "Fast & Secure Shipping",
    icon: <Truck className="w-12 h-12 text-yellow-400" />,
    description: "Tracked and insured delivery, right to your doorstep.",
  },
]

export default function CustomerConfidence() {
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
            You're in Good Hands
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {confidenceData.map((item, index) => (
            <motion.div
              key={item._id}
              className="bg-gray-900 border border-yellow-400/20 rounded-lg p-6 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col items-center">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
