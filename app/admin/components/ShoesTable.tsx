"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Edit, Trash2, Search, Star, Package, X } from "lucide-react"
import Image from "next/image"
import type { Shoe } from "app/types"
import toast, { Toaster } from "react-hot-toast"

export default function ShoesTable() {
  const [shoes, setShoes] = useState<Shoe[]>([])
  const [filteredShoes, setFilteredShoes] = useState<Shoe[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [brandFilter, setBrandFilter] = useState<string>("")
  const [editingShoe, setEditingShoe] = useState<Shoe | null>(null)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)

  useEffect(() => {
    const fetchShoes = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/admin/shoes", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data: Shoe[] = await response.json()
          setShoes(data || [])
          setFilteredShoes(data || [])
        }
      } catch (error) {
        console.error("Error fetching shoes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchShoes()
  }, [])

  // Filter shoes based on search term and brand
  useEffect(() => {
    let filtered = [...shoes]

    if (searchTerm) {
      filtered = filtered.filter(
        (shoe: Shoe) =>
          shoe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shoe.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (brandFilter) {
      filtered = filtered.filter((shoe: Shoe) => shoe.brand === brandFilter)
    }

    setFilteredShoes(filtered)
  }, [searchTerm, brandFilter, shoes])

  const toggleFeatured = async (shoeId: string, currentFeatured: boolean): Promise<void> => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/shoes/${shoeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      })

      if (response.ok) {
        setShoes((prev: Shoe[]) =>
          prev.map((shoe: Shoe) => (shoe._id === shoeId ? { ...shoe, featured: !currentFeatured } : shoe)),
        )
      }
    } catch (error) {
      console.error("Error updating shoe:", error)
    }
  }

  const toggleVisibility = async (shoeId: string, currentVisible: boolean): Promise<void> => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/shoes/${shoeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hidden: currentVisible }), // Toggle hidden property
      })

      if (response.ok) {
        setShoes((prev: Shoe[]) =>
          prev.map((shoe: Shoe) => (shoe._id === shoeId ? { ...shoe, hidden: currentVisible } : shoe)),
        )
      }
    } catch (error) {
      console.error("Error updating shoe visibility:", error)
    }
  }

  const deleteShoe = async (shoeId: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this shoe?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/shoes/${shoeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setShoes((prev: Shoe[]) => prev.filter((shoe: Shoe) => shoe._id !== shoeId))
      }
    } catch (error) {
      console.error("Error deleting shoe:", error)
    }
  }

  const openEditModal = (shoe: Shoe): void => {
    setEditingShoe({
      ...shoe,
      images: shoe.images || [shoe.image || ""],
    })
    setShowEditModal(true)
  }

  const updateShoe = async (): Promise<void> => {
    if (!editingShoe) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/shoes/${editingShoe._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingShoe.name,
          brand: editingShoe.brand,
          retailPrice: editingShoe.retailPrice,
          profit: editingShoe.profit,
          price: editingShoe.price,
          description: editingShoe.description,
          image: editingShoe.image,
          images: editingShoe.images,
          sizes: editingShoe.sizes,
          featured: editingShoe.featured,
          hidden: editingShoe.hidden,
        }),
      })

      if (response.ok) {
        const updatedShoe: Shoe = await response.json()
        setShoes((prev: Shoe[]) => prev.map((shoe: Shoe) => (shoe._id === editingShoe._id ? updatedShoe : shoe)))
        setShowEditModal(false)
        setEditingShoe(null)
        toast.success("Shoe updated successfully!")
      } else {
        const error = await response.json()
        toast.error(`Error updating shoe: ${error.message}`)
      }
    } catch (error) {
      console.error("Error updating shoe:", error)
      toast.error("Error updating shoe. Please try again.")
    }
  }

  const uniqueBrands = [...new Set(shoes.map((shoe: Shoe) => shoe.brand).filter(Boolean))]

  if (loading) {
    return (
      <div className="bg-black border border-yellow-400/20 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        className="bg-black border border-yellow-400/20 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Toaster position="top-right" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search shoes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none text-sm"
            />
          </div>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-4 py-2 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none text-sm"
          >
            <option value="">All Brands</option>
            {uniqueBrands.map((brand: string) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm("")
              setBrandFilter("")
            }}
            className="px-4 py-2 border border-yellow-400/20 text-yellow-400 rounded-lg hover:bg-yellow-400/10 transition-all text-sm"
          >
            Clear Filters
          </button>
        </div>

        {/* Shoes Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-semibold">Product</th>
                <th className="text-left py-3 px-4 font-semibold">Brand</th>
                <th className="text-left py-3 px-4 font-semibold">Price</th>
                <th className="text-left py-3 px-4 font-semibold">Sizes</th>
                <th className="text-left py-3 px-4 font-semibold">Featured</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShoes.length > 0 ? (
                filteredShoes.map((shoe: Shoe, index: number) => (
                  <motion.tr
                    key={shoe._id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={shoe.image || "/placeholder.svg"}
                          alt={shoe.name || "Shoe"}
                          width={50}
                          height={50}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{shoe.name || "N/A"}</p>
                          <p className="text-sm text-gray-400 truncate max-w-xs">{shoe.description || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium">{shoe.brand || "N/A"}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-yellow-400">LKR {(shoe.price || 0).toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        className="px-2 py-1 bg-gray-800 text-xs rounded border border-gray-600 max-w-20"
                        disabled
                      >
                        <option>{(shoe.sizes || []).length} sizes</option>
                        {(shoe.sizes || []).map((size: string) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFeatured(shoe._id, shoe.featured || false)}
                          className={`p-1 rounded transition-colors ${
                            shoe.featured ? "text-yellow-400 hover:bg-yellow-400/20" : "text-gray-400 hover:bg-gray-700"
                          }`}
                          title={shoe.featured ? "Remove from featured" : "Add to featured"}
                        >
                          <Star className={`w-4 h-4 ${shoe.featured ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(shoe)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                        <button
                          onClick={() => deleteShoe(shoe._id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No shoes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {filteredShoes.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-400">
              Showing {filteredShoes.length} of {shoes.length} shoes
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Package className="w-4 h-4" />
                <span>Total: {shoes.length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Featured: {shoes.filter((shoe: Shoe) => shoe.featured).length}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingShoe && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-black border border-yellow-400/20 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-2xl font-semibold">Edit Shoe</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={editingShoe.name || ""}
                        onChange={(e) => setEditingShoe({ ...editingShoe, name: e.target.value })}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Brand</label>
                      <input
                        type="text"
                        value={editingShoe.brand || ""}
                        onChange={(e) => setEditingShoe({ ...editingShoe, brand: e.target.value })}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Retail Price (LKR)</label>
                      <input
                        type="number"
                        value={editingShoe.retailPrice || 0}
                        onChange={(e) => {
                          const retail = Number.parseFloat(e.target.value) || 0
                          const profit = Number.parseFloat(editingShoe.profit?.toString() || "0")
                          setEditingShoe({
                            ...editingShoe,
                            retailPrice: retail,
                            price: retail + profit,
                          })
                        }}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Profit (LKR)</label>
                      <input
                        type="number"
                        value={editingShoe.profit || 0}
                        onChange={(e) => {
                          const profit = Number.parseFloat(e.target.value) || 0
                          const retail = Number.parseFloat(editingShoe.retailPrice?.toString() || "0")
                          setEditingShoe({
                            ...editingShoe,
                            profit: profit,
                            price: retail + profit,
                          })
                        }}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Price (LKR)</label>
                      <input
                        type="number"
                        value={editingShoe.price || 0}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-800 border border-yellow-400/20 rounded-lg cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={editingShoe.description || ""}
                        onChange={(e) => setEditingShoe({ ...editingShoe, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Available Sizes</label>
                      <div className="grid grid-cols-4 gap-2">
                        {["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"].map(
                          (size: string) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                const sizes = editingShoe.sizes || []
                                const newSizes = sizes.includes(size)
                                  ? sizes.filter((s) => s !== size)
                                  : [...sizes, size]
                                setEditingShoe({ ...editingShoe, sizes: newSizes })
                              }}
                              className={`py-2 px-3 border rounded-lg transition-all ${
                                (editingShoe.sizes || []).includes(size)
                                  ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                                  : "border-gray-600 hover:border-gray-500"
                              }`}
                            >
                              {size}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingShoe.featured || false}
                          onChange={(e) => setEditingShoe({ ...editingShoe, featured: e.target.checked })}
                          className="rounded border-yellow-400/20 text-yellow-400 focus:ring-yellow-400"
                        />
                        <span>Featured</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!editingShoe.hidden}
                          onChange={(e) => setEditingShoe({ ...editingShoe, hidden: !e.target.checked })}
                          className="rounded border-yellow-400/20 text-yellow-400 focus:ring-yellow-400"
                        />
                        <span>Visible on website</span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column - Images */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Image URL</label>
                      <input
                        type="url"
                        value={editingShoe.image || ""}
                        onChange={(e) => setEditingShoe({ ...editingShoe, image: e.target.value })}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Images</label>
                      <div className="space-y-3">
                        {(editingShoe.images || []).map((img: string, index: number) => (
                          <div key={index} className="space-y-2">
                            <input
                              type="url"
                              placeholder={`Image ${index + 1} URL`}
                              value={img || ""}
                              onChange={(e) => {
                                const newImages = [...(editingShoe.images || [])]
                                newImages[index] = e.target.value
                                setEditingShoe({ ...editingShoe, images: newImages })
                              }}
                              className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                            />
                            {img && (
                              <div className="w-full h-32 border border-yellow-400/20 rounded-lg overflow-hidden">
                                <Image
                                  src={img || "/placeholder.svg"}
                                  alt={`Image ${index + 1}`}
                                  width={200}
                                  height={128}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = [...(editingShoe.images || []), ""]
                            setEditingShoe({ ...editingShoe, images: newImages })
                          }}
                          className="w-full px-4 py-2 border border-yellow-400/20 text-yellow-400 rounded-lg hover:bg-yellow-400/10 transition-all"
                        >
                          Add Image URL
                        </button>
                      </div>
                    </div>

                    {/* Image Preview Grid */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Image Previews</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(editingShoe.images || [])
                          .filter((img) => img.trim())
                          .map((image: string, index: number) => (
                            <div
                              key={index}
                              className="aspect-square border border-yellow-400/20 rounded-lg overflow-hidden"
                            >
                              <Image
                                src={image || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                width={150}
                                height={150}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateShoe}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
                  >
                    Update Shoe
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
