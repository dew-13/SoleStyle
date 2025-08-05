"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Header from "./components/Header"
import FeaturedShoes from "./components/FeaturedShoes"
import FeaturedApparel from "./components/FeaturedApparel"
import CustomerConfidence from "./components/CustomerConfidence"
import Footer from "./components/Footer"
import { User } from "./types"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

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

  const starSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      version="1.1"
      style={{ shapeRendering: "geometricPrecision", textRendering: "geometricPrecision", imageRendering: "auto", fillRule: "evenodd", clipRule: "evenodd" }}
      viewBox="0 0 784.11 815.53"
    >
      <g>
        <path
          className="fil0"
          d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"
        ></path>
      </g>
    </svg>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <Header user={user} setUser={setUser} />

      {/* Hero Section */}
      <motion.section
        className="relative h-screen flex items-center justify-center bg-black overflow-hidden"
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
            OG VAULT
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl mb-8 text-gray-300"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Unlock the Legacy - Sealed for Greatness
          </motion.p>
          <motion.button
            className="vault-btn mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            onClick={() => (window.location.href = "/shop")}
            type="button"
          >
            Enter the Vault
            <div className="star-1">{starSVG}</div>
            <div className="star-2">{starSVG}</div>
            <div className="star-3">{starSVG}</div>
            <div className="star-4">{starSVG}</div>
            <div className="star-5">{starSVG}</div>
            <div className="star-6">{starSVG}</div>
          </motion.button>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
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

      {/* Featured Shoes Section - Reduced top padding */}
      <div className="-mt-16 relative z-30">
        <FeaturedShoes />
      </div>

      {/* Featured Apparel Section */}
      <FeaturedApparel />

      {/* Customer Confidence Section */}
      <CustomerConfidence />

      <Footer />
    </div>
  )
}
