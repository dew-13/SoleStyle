"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Target,
  Award,
  Globe,
  Heart,
  Truck,
  Shield,
  CheckCircle,
  Star,
  Package,
  CreditCard,
  Headphones,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "../components/Header"
import Footer from "../components/Footer"
import type { User } from "app/types"
import { Toaster } from "react-hot-toast"

export default function AboutPage() {
  const [user, setUser] = useState<User | null>(null)

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

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      image: "/placeholder.svg?height=300&width=300",
      description: "Passionate sneakerhead with 10+ years in the footwear industry.",
    },
    {
      name: "Sarah Chen",
      role: "Head of Operations",
      image: "/placeholder.svg?height=300&width=300",
      description: "Expert in international logistics and customer experience.",
    },
    {
      name: "Marcus Williams",
      role: "Product Curator",
      image: "/placeholder.svg?height=300&width=300",
      description: "Basketball enthusiast who sources the latest and greatest kicks.",
    },
  ]

  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "100% Authentic Guarantee",
      description: "Every pair verified with original receipts from Canadian retailers. No fakes, ever.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Direct Canadian Import",
      description: "Sourced directly from Nike Canada, Foot Locker CA, Sport Chek, and other authorized retailers.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Sri Lanka Focused",
      description: "Designed specifically for Sri Lankan basketball community with local payment options.",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Full Service Import",
      description: "We handle customs, taxes, insurance, and door-to-door delivery across Sri Lanka.",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-right" />
      <Header user={user} setUser={setUser} />

      <div className="pt-20 px-4">
        <div className="container mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              About Us
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Sri Lanka's premier destination for authentic basketball sneakers imported directly from Canada. We bridge
              the gap where no official branded outlets exist, bringing you the latest releases at competitive prices.
            </p>
          </motion.div>

          {/* Story Section */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-yellow-400">Our Story</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Founded in 2023, our journey began with a simple observation: basketball enthusiasts in Sri Lanka were
                  struggling to access the latest and most sought-after sneakers due to the absence of official branded
                  outlets in the country.
                </p>
                <p>
                  As passionate basketball fans ourselves, we understood the frustration of missing out on limited
                  releases, dealing with unreliable sellers, and paying excessive markups. The lack of Nike, Adidas,
                  Jordan, and other premium basketball shoe retailers in Sri Lanka created a significant gap in the
                  market.
                </p>
                <p>
                  That's when we decided to establish direct partnerships with trusted Canadian retailers, ensuring 100%
                  authentic products, competitive pricing, and reliable delivery. Today, we're proud to be the bridge
                  that connects Sri Lankan basketball enthusiasts with the global sneaker market.
                </p>
                <p>
                  Every pair we deliver comes with our authenticity guarantee, complete with original packaging,
                  receipts, and documentation from Canadian stores. We handle all customs clearance, shipping insurance,
                  and delivery logistics so you can focus on what matters most - your game.
                </p>
              </div>
            </div>
            <div className="bg-black border border-yellow-400/20 rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Our Story"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Mission & Vision */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-black border border-yellow-400/20 rounded-lg p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-bold">Our Mission</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                To democratize access to premium basketball sneakers in Sri Lanka by providing authentic, competitively
                priced footwear sourced directly from Canadian retailers, while delivering exceptional customer service
                and building a community of basketball enthusiasts.
              </p>
            </div>
            <div className="bg-black border border-yellow-400/20 rounded-lg p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-bold">Our Vision</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                To become the most trusted and preferred platform for basketball sneakers in Sri Lanka, known for our
                authenticity guarantee, customer-first approach, and contribution to the growth of basketball culture in
                the region.
              </p>
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  className="bg-black border border-yellow-400/20 rounded-lg p-6 text-center hover:border-yellow-400/50 transition-all"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-yellow-400 mb-4 flex justify-center">{value.icon}</div>
                  <h4 className="text-lg font-semibold mb-3">{value.title}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust & Security Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="w-10 h-10" />,
                  title: "Secure Transactions",
                  description:
                    "Bank-level security for all payments with multiple secure payment options including installments.",
                },
                {
                  icon: <CheckCircle className="w-10 h-10" />,
                  title: "Verified Retailers",
                  description:
                    "Partnerships only with authorized Canadian retailers like Nike Canada, Adidas CA, and Sport Chek.",
                },
                {
                  icon: <Star className="w-10 h-10" />,
                  title: "Premium Quality",
                  description: "Original packaging, tags, and documentation. Every shoe passes our quality inspection.",
                },
                {
                  icon: <Package className="w-10 h-10" />,
                  title: "Insured Shipping",
                  description:
                    "Full insurance coverage during transit with real-time tracking from Canada to your doorstep.",
                },
                {
                  icon: <CreditCard className="w-10 h-10" />,
                  title: "Flexible Payments",
                  description:
                    "Pay in full or choose our 3-installment plan. Local bank transfers and online payments accepted.",
                },
                {
                  icon: <Headphones className="w-10 h-10" />,
                  title: "24/7 Support",
                  description:
                    "Dedicated customer support via WhatsApp, phone, and email. We're here when you need us.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-black border border-yellow-400/20 rounded-lg p-6 hover:border-yellow-400/50 transition-all"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-yellow-400 mb-4">{feature.icon}</div>
                  <h4 className="text-lg font-semibold mb-3">{feature.title}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Import Process Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Our Import Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "You Order",
                  description: "Browse our collection and place your order with secure payment options.",
                },
                {
                  step: "02",
                  title: "We Source",
                  description: "We purchase from verified Canadian retailers and get original receipts.",
                },
                {
                  step: "03",
                  title: "We Ship",
                  description: "Secure packaging and insured shipping from Canada with full tracking.",
                },
                {
                  step: "04",
                  title: "You Receive",
                  description: "Door-to-door delivery across Sri Lanka with all customs handled by us.",
                },
              ].map((process, index) => (
                <motion.div key={index} className="text-center" whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {process.step}
                  </div>
                  <h4 className="text-lg font-semibold mb-3">{process.title}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{process.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  className="bg-black border border-yellow-400/20 rounded-lg p-6 text-center hover:border-yellow-400/50 transition-all"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={200}
                    height={200}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-2 border-yellow-400/20"
                  />
                  <h4 className="text-xl font-semibold mb-2">{member.name}</h4>
                  <p className="text-yellow-400 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {[
              { number: "2000+", label: "Shoes Imported" },
              { number: "500+", label: "Happy Customers" },
              { number: "100%", label: "Authenticity Rate" },
              { number: "7-14", label: "Days Delivery" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Step Up Your Game?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for their basketball sneaker needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <motion.button
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:from-yellow-500 hover:to-yellow-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Shop Now
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  className="border border-yellow-400 text-yellow-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-400/10 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Us
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
