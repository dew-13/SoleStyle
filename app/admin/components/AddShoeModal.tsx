"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Search, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

export default function AddShoeModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1) // 1: Search, 2: Details, 3: Confirmation
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedShoe, setSelectedShoe] = useState(null)
  const [loading, setLoading] = useState(false)
  const [shoeDetails, setShoeDetails] = useState({
    name: "",
    brand: "",
    price: "",
    description: "",
    sizes: [],
    featured: false,
    images: ["", "", "", ""], // Support up to 4 images
  })

  const availableSizes = ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"]

  // Canadian basketball shoe stores
  const canadianStores = [
    { name: "Nike Canada", url: "https://www.nike.com/ca/" },
    { name: "Adidas Canada", url: "https://www.adidas.ca/" },
    { name: "Puma Canada", url: "https://ca.puma.com/" },
    { name: "Reebok Canada", url: "https://www.reebok.ca/" },
    { name: "Foot Locker Canada", url: "https://www.footlocker.ca/" },
    { name: "Champs Sports Canada", url: "https://www.champssports.ca/" },
    { name: "Sport Chek", url: "https://www.sportchek.ca/" },
  ]

  // Mock shoe search API for Canadian stores
  const searchShoes = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      // Simulate API call - replace with real Canadian store APIs
      const mockResults = [
        {
          id: 1,
          name: "Air Jordan 1 Retro High OG",
          brand: "Nike",
          image: "/placeholder.svg?height=200&width=200",
          price: 230,
          description:
            "The Air Jordan 1 Retro High OG remakes the classic sneaker, giving you a fresh take on what you know best.",
          store: "Nike Canada",
        },
        {
          id: 2,
          name: "Yeezy Boost 350 V2",
          brand: "Adidas",
          image: "/placeholder.svg?height=200&width=200",
          price: 280,
          description: "The Yeezy Boost 350 V2 features an upper composed of re-engineered Primeknit.",
          store: "Adidas Canada",
        },
        {
          id: 3,
          name: "Puma Clyde All-Pro",
          brand: "Puma",
          image: "/placeholder.svg?height=200&width=200",
          price: 140,
          description: "Built for the modern game, the Clyde All-Pro delivers performance and style.",
          store: "Puma Canada",
        },
        {
          id: 4,
          name: "Reebok Question Mid",
          brand: "Reebok",
          image: "/placeholder.svg?height=200&width=200",
          price: 160,
          description: "The iconic Question Mid returns with classic basketball heritage.",
          store: "Reebok Canada",
        },
      ].filter(
        (shoe) =>
          shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shoe.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      setSearchResults(mockResults)
    } catch (error) {
      console.error("Error searching shoes:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectShoe = (shoe) => {
    setSelectedShoe(shoe)
    setShoeDetails({
      name: shoe.name,
      brand: shoe.brand,
      price: shoe.price.toString(),
      description: shoe.description,
      sizes: [],
      featured: false,
      images: [shoe.image, "", "", ""],
    })
    setStep(2)
  }

  const handleSizeToggle = (size) => {
    setShoeDetails((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }))
  }

  const handleImageChange = (index, value) => {
    setShoeDetails((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }))
  }

  const removeImage = (index) => {
    setShoeDetails((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? "" : img)),
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      // Filter out empty images
      const validImages = shoeDetails.images.filter((img) => img.trim() !== "")

      const response = await fetch("/api/admin/shoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...shoeDetails,
          image: validImages[0] || "/placeholder.svg", // Primary image
          images: validImages, // All images
        }),
      })

      if (response.ok) {
        setStep(3)
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 2000)
      } else {
        alert("Failed to add shoe")
      }
    } catch (error) {
      console.error("Error adding shoe:", error)
      alert("Error adding shoe")
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep(1)
    setSearchQuery("")
    setSearchResults([])
    setSelectedShoe(null)
    setShoeDetails({
      name: "",
      brand: "",
      price: "",
      description: "",
      sizes: [],
      featured: false,
      images: ["", "", "", ""],
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 border border-yellow-400/20 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-semibold">Add New Shoe</h2>
              <button
                onClick={() => {
                  resetModal()
                  onClose()
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Search */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Search Canadian Basketball Stores</h3>
                    <div className="flex space-x-4 mb-4">
                      <input
                        type="text"
                        placeholder="Search by name or brand..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                        onKeyPress={(e) => e.key === "Enter" && searchShoes()}
                      />
                      <button
                        onClick={searchShoes}
                        disabled={loading}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                      >
                        <Search className="w-4 h-4" />
                        <span>{loading ? "Searching..." : "Search"}</span>
                      </button>
                    </div>

                    {/* Store Links */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-400 mb-3">Quick links to Canadian stores:</p>
                      <div className="flex flex-wrap gap-2">
                        {canadianStores.map((store) => (
                          <a
                            key={store.name}
                            href={store.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-lg text-sm hover:border-yellow-400/50 transition-all"
                          >
                            {store.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((shoe) => (
                        <motion.div
                          key={shoe.id}
                          className="bg-black border border-yellow-400/20 rounded-lg p-4 hover:border-yellow-400/50 transition-all cursor-pointer"
                          whileHover={{ y: -5 }}
                          onClick={() => selectShoe(shoe)}
                        >
                          <Image
                            src={shoe.image || "/placeholder.svg"}
                            alt={shoe.name}
                            width={200}
                            height={200}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h4 className="font-semibold mb-1">{shoe.name}</h4>
                          <p className="text-gray-400 text-sm mb-2">{shoe.brand}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-yellow-400 font-bold">${shoe.price} CAD</p>
                            <p className="text-xs text-gray-500">{shoe.store}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Manual Entry Option */}
                  <div className="border-t border-gray-700 pt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="w-full border border-yellow-400/20 text-yellow-400 py-3 rounded-lg font-semibold hover:bg-yellow-400/10 transition-all"
                    >
                      Or add shoe manually
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Shoe Details</h3>
                    <button
                      onClick={() => setStep(1)}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      ← Back to search
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input
                          type="text"
                          value={shoeDetails.name}
                          onChange={(e) => setShoeDetails({ ...shoeDetails, name: e.target.value })}
                          className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Brand</label>
                        <input
                          type="text"
                          value={shoeDetails.brand}
                          onChange={(e) => setShoeDetails({ ...shoeDetails, brand: e.target.value })}
                          className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Price (CAD $)</label>
                        <input
                          type="number"
                          value={shoeDetails.price}
                          onChange={(e) => setShoeDetails({ ...shoeDetails, price: e.target.value })}
                          className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={shoeDetails.description}
                          onChange={(e) => setShoeDetails({ ...shoeDetails, description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none resize-none"
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={shoeDetails.featured}
                          onChange={(e) => setShoeDetails({ ...shoeDetails, featured: e.target.checked })}
                          className="rounded border-yellow-400/20 text-yellow-400 focus:ring-yellow-400"
                        />
                        <label htmlFor="featured" className="text-sm font-medium">
                          Featured shoe
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Available Sizes</label>
                        <div className="grid grid-cols-4 gap-2">
                          {availableSizes.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleSizeToggle(size)}
                              className={`py-2 px-3 border rounded-lg transition-all ${
                                shoeDetails.sizes.includes(size)
                                  ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                                  : "border-gray-600 hover:border-gray-500"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Images */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Product Images (up to 4)</label>
                        <div className="space-y-3">
                          {shoeDetails.images.map((image, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="url"
                                placeholder={`Image ${index + 1} URL`}
                                value={image}
                                onChange={(e) => handleImageChange(index, e.target.value)}
                                className="flex-1 px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                              />
                              {image && (
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Image Previews */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Image Previews</label>
                        <div className="grid grid-cols-2 gap-3">
                          {shoeDetails.images.map((image, index) => (
                            <div key={index} className="aspect-square">
                              {image ? (
                                <Image
                                  src={image || "/placeholder.svg"}
                                  alt={`Preview ${index + 1}`}
                                  width={150}
                                  height={150}
                                  className="w-full h-full object-cover rounded-lg border border-yellow-400/20"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center">
                                  <Plus className="w-8 h-8 text-gray-600" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !shoeDetails.name || !shoeDetails.brand || !shoeDetails.price}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all disabled:opacity-50"
                    >
                      {loading ? "Adding..." : "Add Shoe"}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="text-center py-8">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Shoe Added Successfully!</h3>
                  <p className="text-gray-400">The shoe has been added to your inventory.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
