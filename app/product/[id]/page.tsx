"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import type { User, Shoe, CartItem } from "app/types"
import toast, { Toaster } from "react-hot-toast"
import { useCart } from "app/context/CartContext" // <-- FIXED: correct import path

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [shoe, setShoe] = useState<Shoe | null>(null)
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
    const fetchShoe = async () => {
      try {
        const response = await fetch(`/api/shoes/${params.id}`)
        if (response.ok) {
          const shoeData = await response.json()
          setShoe(shoeData)
          // Set the first image as selected
          if (shoeData.images && shoeData.images.length > 0) {
            setSelectedImage(shoeData.images[0])
          } else if (shoeData.image) {
            setSelectedImage(shoeData.image)
          }
        } else {
          console.error("Failed to fetch shoe")
          router.push("/shop")
        }
      } catch (error) {
        console.error("Error fetching shoe:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchShoe()
    } else {
      setLoading(false)
      router.push("/shop")
    }
  }, [params.id])

  // FIXED: Use context-based addToCart
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size")
      return
    }

    if (!shoe) {
      toast.error("Product not found")
      return
    }

    const cartItem: CartItem = {
      id: shoe._id,
      name: shoe.name,
      brand: shoe.brand,
      price: shoe.price,
      image: shoe.image,
      size: selectedSize,
      quantity: quantity,
    }

    addToCart(cartItem)
    toast.success("Item added to cart!")
  }

  const handlePreOrder = () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push("/auth/login")
      return
    }

    if (!selectedSize) {
      toast.error("Please select a size")
      return
    }

    if (!shoe) {
      toast.error("Product not found")
      return
    }

    // Store order details in localStorage and redirect to order confirmation
    const orderDetails = {
      shoe,
      size: selectedSize,
      quantity,
      totalPrice: shoe.price * quantity,
    }
    localStorage.setItem("orderDetails", JSON.stringify(orderDetails))
    router.push("/order-confirmation")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header user={user} setUser={setUser} />
        <div className="pt-20 px-4">
          <div className="container mx-auto">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="h-96 bg-gray-800 rounded"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-800 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-800 rounded w-1/3"></div>
                  <div className="h-32 bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!shoe) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header user={user} setUser={setUser} />
        <div className="pt-20 px-4">
          <div className="container mx-auto text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Shoe not found</h1>
            <Link href="/shop">
              <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold">
                Back to Shop
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-right" />
      <Header user={user} setUser={setUser} />

      <div className="pt-20 px-4">
        <div className="container mx-auto">
          {/* Back Button */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/shop">
              <button className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Shop</span>
              </button>
            </Link>
          </motion.div>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div className="bg-black rounded-lg overflow-hidden border border-yellow-400/20">
                <Image
                  src={selectedImage || shoe.image || "/placeholder.svg"}
                  alt={shoe.name}
                  width={400}
                  height={300}
                  className="w-full h-96 object-cover"
                />
              </div>

              {/* Image Thumbnails */}
              {shoe.images && shoe.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {shoe.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img ? "border-yellow-400" : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`${shoe.name} ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Title and Brand */}
              <div>
                <h1 className="text-xl md:text-4xl font-bold mb-2 text-white">{shoe.name}</h1>
                <p className="text-l text-gray-400 mb-4">{shoe.brand}</p>

                {/* Rating */}
                {shoe.rating && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(shoe.rating!) ? "text-yellow-400 fill-current" : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-400">
                      {shoe.rating} ({shoe.reviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-base font-bold text-yellow-400">LKR {shoe.price?.toLocaleString()}
                <p className="text-sm text-gray-600 leading-relaxed">(Including Shipping + Clearance Tax)</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed">{shoe.description}</p>
              </div>

              {/* Features */}
              {shoe.features && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Features</h3>
                  <ul className="space-y-2">
                    {shoe.features.map((feature, index) => (
                      <li key={index} className="text-gray-300 flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {(shoe.sizes || []).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-4 border rounded-lg transition-all ${
                        selectedSize === size
                          ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  onClick={handlePreOrder}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-4 rounded-lg font-semibold text-lg hover:from-yellow-500 hover:to-yellow-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Buy Now
                </motion.button>

                <button
                  onClick={handleAddToCart}
                  className="w-full border border-yellow-400 text-yellow-400 py-4 rounded-lg font-semibold hover:bg-yellow-400/10 transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
              </div>

              {/* Total Price */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center text-xl">
                  <span>Total:</span>
                  <span className="font-bold text-yellow-400">LKR {(shoe.price * quantity).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">(Including Shipping + Clearance Tax to Sri Lanka)</p>
              </div>
            </motion.div>
          </div>

          <div className="container mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black border border-yellow-400/30 rounded-lg p-6 flex items-center space-x-4 shadow-lg">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7m0 8h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
                <div>
                  <h4 className="text-lg font-semibold mb-1 text-white">100% Authenticity Guarantee</h4>
                  <p className="text-gray-300 text-sm">All products are verified and guaranteed delivery.</p>
                </div>
              </div>
              <div className="bg-black border border-yellow-400/30 rounded-lg p-6 flex items-center space-x-4 shadow-lg">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v3h16v-3c0-2.663-5.33-4-8-4z" />
                </svg>
                <div>
                  <h4 className="text-lg font-semibold mb-1 text-white">Easy Payments Plans</h4>
                  <p className="text-gray-300 text-sm">Make the full payment or installments to secure your purchase.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}