"use client"

import type React from "react"
import toast, { Toaster } from "react-hot-toast"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Trash2 } from "lucide-react"
import ImageUpload from "../../components/ImageUpload"

interface AddApparelModalProps {
  isOpen: boolean
  onClose: () => void
  onAdded?: () => void // new prop
}

interface ApparelDetails {
  name: string
  brand: string
  retailPrice: string
  profit: string
  price: string
  description: string
  sizes: string[]
  featured: boolean
  images: string[]
}

export default function AddApparelModal({ isOpen, onClose, onAdded }: AddApparelModalProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [apparelDetails, setApparelDetails] = useState<ApparelDetails>({
    name: "",
    brand: "",
    retailPrice: "",
    profit: "",
    price: "",
    description: "",
    sizes: [],
    featured: false,
    images: ["", "", "", ""], // Support up to 4 images
  })

  const availableSizes: string[] = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]

  const handleSizeToggle = (size: string): void => {
    setApparelDetails((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }))
  }

  const handleImageChange = (index: number, value: string): void => {
    setApparelDetails((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }))
  }

  const removeImage = (index: number): void => {
    setApparelDetails((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? "" : img)),
    }))
  }

  const handleSubmit = async (): Promise<void> => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      // Filter out empty images
      const validImages = apparelDetails.images.filter((img) => img.trim() !== "")

      // Ensure price is always a number and up-to-date
      const retail = Number(apparelDetails.retailPrice) || 0
      const profit = Number(apparelDetails.profit) || 0
      const price = retail + profit

      const response = await fetch("/api/admin/apparel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...apparelDetails,
          retailPrice: retail,
          profit: profit,
          price: price,
          image: validImages[0] || "/placeholder.svg", // Primary image
          images: validImages, // All images
        }),
      })

      if (response.ok) {
        toast.success("Apparel added successfully!")
        setTimeout(() => {
          onClose()
          if (onAdded) onAdded()
        }, 1000)
      } else {
        toast.error("Failed to add apparel")
      }
    } catch (error) {
      console.error("Error adding apparel:", error)
      toast.error("Error adding apparel")
    } finally {
      setLoading(false)
    }
  }

  const resetModal = (): void => {
    setApparelDetails({
      name: "",
      brand: "",
      retailPrice: "",
      profit: "",
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-black border border-yellow-400/20 rounded-lg w-full max-w-md sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 sm:pb-6 border-b border-gray-700">
              <Toaster position="top-right" />
              <h2 className="text-lg sm:text-2xl font-semibold">Add New Apparel</h2>
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
            <div className="py-4 sm:py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={apparelDetails.name}
                      onChange={(e) => setApparelDetails({ ...apparelDetails, name: e.target.value })}
                      placeholder="Enter apparel name"
                      className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Brand</label>
                    <input
                      type="text"
                      value={apparelDetails.brand}
                      onChange={(e) => setApparelDetails({ ...apparelDetails, brand: e.target.value })}
                      placeholder="Enter brand name"
                      className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Retail Price (LKR)</label>
                    <input
                      type="number"
                      value={apparelDetails.retailPrice ?? ""}
                      onChange={(e) => {
                        const retail = e.target.value
                        const profit = apparelDetails.profit
                        const total = (Number(retail) || 0) + (Number(profit) || 0)
                        setApparelDetails({
                          ...apparelDetails,
                          retailPrice: retail,
                          price: total.toString(),
                        })
                      }}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Profit (LKR)</label>
                    <input
                      type="number"
                      value={apparelDetails.profit ?? ""}
                      onChange={(e) => {
                        const profit = e.target.value
                        const retail = apparelDetails.retailPrice
                        const total = (Number(retail) || 0) + (Number(profit) || 0)
                        setApparelDetails({
                          ...apparelDetails,
                          profit: profit,
                          price: total.toString(),
                        })
                      }}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price (LKR)</label>
                    <input
                      type="number"
                      value={apparelDetails.price}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-800 border border-yellow-400/20 rounded-lg cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={apparelDetails.description}
                      onChange={(e) => setApparelDetails({ ...apparelDetails, description: e.target.value })}
                      placeholder="Enter product description"
                      rows={3}
                      className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none resize-none"
                    />
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
                            apparelDetails.sizes.includes(size)
                              ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={apparelDetails.featured}
                        onChange={(e) => setApparelDetails({ ...apparelDetails, featured: e.target.checked })}
                        className="rounded border-yellow-400/20 text-yellow-400 focus:ring-yellow-400"
                      />
                      <span>Featured</span>
                    </label>
                  </div>
                </div>

                {/* Right Column - Images */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Images (up to 4)</label>
                    <div className="space-y-4">
                      {apparelDetails.images.map((image, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Image {index + 1}</span>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <ImageUpload
                            value={image}
                            onChange={(url) => handleImageChange(index, url)}
                            placeholder={`Enter URL or upload image ${index + 1}`}
                            showPreview={true}
                            maxSize={5}
                          />
                        </div>
                      ))}
                      {apparelDetails.images.filter(img => img.trim()).length < 4 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = [...apparelDetails.images, ""]
                            setApparelDetails({ ...apparelDetails, images: newImages })
                          }}
                          className="w-full px-4 py-2 border border-yellow-400/20 text-yellow-400 rounded-lg hover:bg-yellow-400/10 transition-all"
                        >
                          Add Another Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => {
                    resetModal()
                    onClose()
                  }}
                  className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !apparelDetails.name || !apparelDetails.brand || !apparelDetails.price}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding..." : "Add Apparel"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 