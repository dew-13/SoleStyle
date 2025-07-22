"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import type { User, Apparel, CartItem } from "app/types"
import toast, { Toaster } from "react-hot-toast"
import { useCart } from "app/context/CartContext"

export default function ApparelPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [apparel, setApparel] = useState<Apparel | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const { addToCart } = useCart()

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

  useEffect(() => {
    const fetchApparel = async () => {
      if (params.id) {
        try {
          const response = await fetch(`/api/apparel/${params.id}`)
          if (response.ok) {
            const data = await response.json()
            setApparel(data)
            setSelectedImage(data.image || "")
          } else {
            router.push("/shop")
          }
        } catch (error) {
          console.error("Error fetching apparel:", error)
          router.push("/shop")
        } finally {
          setLoading(false)
        }
      }
    }
    fetchApparel()
  }, [params.id, router])

  const handleAddToCart = () => {
    if (!apparel) return
    if (!selectedSize) {
      toast.error("Please select a size.")
      return
    }

    const cartItem: CartItem = {
      _id: apparel._id,
      name: apparel.name,
      brand: apparel.brand,
      price: apparel.price,
      image: apparel.image,
      size: selectedSize,
      quantity,
      type: "apparel",
    }
    addToCart(cartItem)
    toast.success(`${apparel.name} added to cart!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!apparel) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-4">Apparel not found</h2>
        <Link href="/shop" className="text-yellow-400 hover:underline">
          Go back to shop
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-black text-white">
      <Toaster position="top-right" />
      <Header user={user} setUser={setUser} />
      <div className="container mx-auto px-4 py-8 pt-24 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Shop</span>
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <motion.div
                className="relative aspect-square rounded-lg overflow-hidden mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Image
                  src={selectedImage}
                  alt={apparel.name}
                  fill
                  className="object-cover"
                />
              </motion.div>
              <div className="grid grid-cols-4 gap-2">
                {apparel.images?.map((img, index) => (
                  <motion.div
                    key={index}
                    className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                      selectedImage === img ? "border-yellow-400" : "border-transparent"
                    }`}
                    onClick={() => setSelectedImage(img)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Image
                      src={img}
                      alt={`${apparel.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{apparel.name}</h1>
              <p className="text-lg text-gray-400 mb-4">{apparel.brand}</p>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        apparel.rating && i < apparel.rating ? "fill-current" : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400 ml-2">
                  ({apparel.reviews || 0} reviews)
                </span>
              </div>
              <p className="text-3xl font-bold text-yellow-400 mb-6">
                LKR {apparel.price.toLocaleString()}
              </p>
              <p className="text-gray-300 mb-6">{apparel.description}</p>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {apparel.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        selectedSize === size
                          ? "bg-yellow-400 text-black border-yellow-400"
                          : "bg-gray-800 border-gray-700 hover:border-yellow-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border-2 border-gray-700 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-lg"
                  >
                    -
                  </button>
                  <span className="px-4 text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-lg"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 px-6 rounded-lg font-semibold text-lg hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>Add to Cart</span>
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {apparel.features?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
} 