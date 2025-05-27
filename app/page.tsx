"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Header from "./components/Header"
import FeaturedShoes from "./components/FeaturedShoes"
import PopularBrands from "./components/PopularBrands"
import Footer from "./components/Footer"

export default function HomePage() {
  const [user, setUser] = useState(null)

  // Check if user is logged in
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
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <Header user={user} setUser={setUser} />

      {/* Hero Section */}
      <motion.section
        className="relative h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-black overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            
          
          <motion.img
            src="/body-logo.png"
            alt="OG Vault Logo"
            className="mx-auto mb-4 w-24 h-24 md:w-32 md:h-32 object-contain"
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 3, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          /> 
           
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl mb-8 text-gray-300"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            
          </motion.p>
          <motion.button
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-full font-semibold text-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            onClick={() => (window.location.href = "/shop")}
          >
            Shop Now
          </motion.button>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-20"
              style={{
                left: `LKR {Math.random() * 100}%`,
                top: `LKR {Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.section>

      {/* Featured Shoes Section */}
      <FeaturedShoes />

      {/* Popular Brands Section */}
      <PopularBrands />

      <Footer />
    </div>
  )
}
