"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Edit, Trash2, Search, Star, Package, X } from "lucide-react"
import Image from "next/image"
import type { Apparel } from "app/types"
import toast, { Toaster } from "react-hot-toast"
import ImageUpload from "../../components/ImageUpload"

export default function ApparelTable() {
  const [apparel, setApparel] = useState<Apparel[]>([])
  const [filteredApparel, setFilteredApparel] = useState<Apparel[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [brandFilter, setBrandFilter] = useState<string>("")
  const [editingApparel, setEditingApparel] = useState<Apparel | null>(null)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)

  useEffect(() => {
    const fetchApparel = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/admin/apparel", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data: Apparel[] = await response.json()
          setApparel(data || [])
          setFilteredApparel(data || [])
        }
      } catch (error) {
        console.error("Error fetching apparel:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApparel()
  }, [])

  // Filter apparel based on search term and brand
  useEffect(() => {
    let filtered = [...apparel]

    if (searchTerm) {
      filtered = filtered.filter(
        (item: Apparel) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (brandFilter) {
      filtered = filtered.filter((item: Apparel) => item.brand === brandFilter)
    }

    setFilteredApparel(filtered)
  }, [searchTerm, brandFilter, apparel])

  const toggleFeatured = async (apparelId: string, currentFeatured: boolean): Promise<void> => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/apparel/${apparelId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      })

      if (response.ok) {
        setApparel((prev: Apparel[]) =>
          prev.map((item: Apparel) => (item._id === apparelId ? { ...item, featured: !currentFeatured } : item)),
        )
      }
    } catch (error) {
      console.error("Error updating apparel:", error)
    }
  }

  const deleteApparel = async (apparelId: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this apparel item?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/apparel/${apparelId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setApparel((prev: Apparel[]) => prev.filter((item: Apparel) => item._id !== apparelId))
      }
    } catch (error) {
      console.error("Error deleting apparel:", error)
    }
  }

  const openEditModal = (item: Apparel): void => {
    setEditingApparel({
      ...item,
      images: item.images || [item.image || ""],
    })
    setShowEditModal(true)
  }

  const updateApparel = async (): Promise<void> => {
    if (!editingApparel) return

    try {
      const token = localStorage.getItem("token")
      // Ensure numbers
      const retail = Number(editingApparel.retailPrice) || 0
      const profit = Number(editingApparel.profit) || 0
      const price = retail + profit
      const response = await fetch(`/api/admin/apparel/${editingApparel._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingApparel.name,
          brand: editingApparel.brand,
          retailPrice: retail,
          profit: profit,
          price: price,
          description: editingApparel.description,
          image: editingApparel.image,
          images: editingApparel.images,
          sizes: editingApparel.sizes,
          featured: editingApparel.featured,
          hidden: editingApparel.hidden,
        }),
      })

      if (response.ok) {
        const updatedApparel: Apparel = await response.json()
        setApparel((prev: Apparel[]) => prev.map((item: Apparel) => (item._id === editingApparel._id ? updatedApparel : item)))
        setShowEditModal(false)
        setEditingApparel(null)
        toast.success("Apparel updated successfully!")
      } else {
        const error = await response.json()
        toast.error(`Error updating apparel: ${error.message}`)
      }
    } catch (error) {
      console.error("Error updating apparel:", error)
      toast.error("Error updating apparel. Please try again.")
    }
  }

  const uniqueBrands = [...new Set(apparel.map((item: Apparel) => item.brand).filter(Boolean))]

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
        className="bg-black border border-yellow-400/20 rounded-lg p-2 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Toaster position="top-right" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search apparel..."
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

        {/* Apparel Table for md+ */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
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
              {filteredApparel.length > 0 ? (
                filteredApparel.map((item: Apparel, index: number) => (
                  <motion.tr
                    key={item._id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name || "Apparel"}
                          width={50}
                          height={50}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{item.name || "N/A"}</p>
                          <p className="text-sm text-gray-400 truncate max-w-xs">{item.description || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium">{item.brand || "N/A"}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-yellow-400">LKR {(item.price || 0).toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(item.sizes || []).slice(0, 3).map((size: string) => (
                          <span key={size} className="px-2 py-1 bg-gray-800 text-xs rounded">
                            {size}
                          </span>
                        ))}
                        {(item.sizes || []).length > 3 && (
                          <span className="px-2 py-1 bg-gray-800 text-xs rounded">
                            +{(item.sizes || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFeatured(item._id, item.featured || false)}
                          className={`p-1 rounded transition-colors ${
                            item.featured ? "text-yellow-400 hover:bg-yellow-400/20" : "text-gray-400 hover:bg-gray-700"
                          }`}
                          title={item.featured ? "Remove from featured" : "Add to featured"}
                        >
                          <Star className={`w-4 h-4 ${item.featured ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                        <button
                          onClick={() => deleteApparel(item._id)}
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
                    No apparel found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Apparel Card List for mobile */}
        <div className="block md:hidden space-y-2">
          {filteredApparel.length > 0 ? (
            filteredApparel.map((item: Apparel) => (
              <div
                key={item._id}
                className="bg-black border border-yellow-400/20 rounded-lg p-2 xs:p-3 flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3"
              >
                <div className="flex-shrink-0 flex items-center justify-center">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name || "Apparel"}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover w-12 h-12 xs:w-[50px] xs:h-[50px]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={item.name || "N/A"}>{item.name || "N/A"}</p>
                  <p className="text-xs text-gray-400 truncate max-w-full" title={item.description || "N/A"}>{item.description || "N/A"}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="font-semibold text-yellow-400 text-xs">LKR {(item.price || 0).toLocaleString()}</span>
                    <span className="font-medium text-xs">{item.brand || "N/A"}</span>
                    <span className="text-xs">{(item.sizes || []).length} sizes</span>
                    {item.featured && <span className="text-yellow-400 text-xs">★ Featured</span>}
                  </div>
                </div>
                <div className="flex xs:flex-col flex-row gap-1 xs:space-y-1 xs:space-x-0 space-x-1 xs:gap-0">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center"
                    aria-label="Edit Apparel"
                  >
                    <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                  <button
                    onClick={() => deleteApparel(item._id)}
                    className="p-1 hover:bg-red-500/20 rounded-lg transition-colors flex items-center justify-center"
                    aria-label="Delete Apparel"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400">No apparel found</div>
          )}
        </div>

        {/* Summary */}
        {filteredApparel.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 sm:mt-6 gap-2 sm:gap-0">
            <p className="text-xs sm:text-sm text-gray-400">
              Showing {filteredApparel.length} of {apparel.length} apparel items
            </p>
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Package className="w-4 h-4" />
                <span>Total: {apparel.length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Featured: {apparel.filter((item: Apparel) => item.featured).length}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingApparel && (
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
                <h2 className="text-2xl font-semibold">Edit Apparel</h2>
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
                        value={editingApparel.name || ""}
                        onChange={(e) => setEditingApparel({ ...editingApparel, name: e.target.value })}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Brand</label>
                      <input
                        type="text"
                        value={editingApparel.brand || ""}
                        onChange={(e) => setEditingApparel({ ...editingApparel, brand: e.target.value })}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Retail Price (LKR)</label>
                      <input
                        type="number"
                        value={editingApparel.retailPrice || 0}
                        onChange={(e) => {
                          const retail = Number.parseFloat(e.target.value) || 0
                          const profit = Number.parseFloat(editingApparel.profit?.toString() || "0")
                          setEditingApparel({
                            ...editingApparel,
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
                        value={editingApparel.profit || 0}
                        onChange={(e) => {
                          const profit = Number.parseFloat(e.target.value) || 0
                          const retail = Number.parseFloat(editingApparel.retailPrice?.toString() || "0")
                          setEditingApparel({
                            ...editingApparel,
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
                        value={editingApparel.price || 0}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-800 border border-yellow-400/20 rounded-lg cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={editingApparel.description || ""}
                        onChange={(e) => setEditingApparel({ ...editingApparel, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Available Sizes</label>
                      <div className="grid grid-cols-4 gap-2">
                        {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size: string) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              const sizes = editingApparel.sizes || []
                              const newSizes = sizes.includes(size)
                                ? sizes.filter((s) => s !== size)
                                : [...sizes, size]
                              setEditingApparel({ ...editingApparel, sizes: newSizes })
                            }}
                            className={`py-2 px-3 border rounded-lg transition-all ${
                              (editingApparel.sizes || []).includes(size)
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
                          checked={editingApparel.featured || false}
                          onChange={(e) => setEditingApparel({ ...editingApparel, featured: e.target.checked })}
                          className="rounded border-yellow-400/20 text-yellow-400 focus:ring-yellow-400"
                        />
                        <span>Featured</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!editingApparel.hidden}
                          onChange={(e) => setEditingApparel({ ...editingApparel, hidden: !e.target.checked })}
                          className="rounded border-yellow-400/20 text-yellow-400 focus:ring-yellow-400"
                        />
                        <span>Visible on website</span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column - Images */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Image</label>
                      <ImageUpload
                        value={editingApparel.image || ""}
                        onChange={(url) => setEditingApparel({ ...editingApparel, image: url })}
                        placeholder="Enter primary image URL or upload file"
                        showPreview={true}
                        maxSize={5}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Images</label>
                      <div className="space-y-4">
                        {(editingApparel.images || []).map((img: string, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Image {index + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = [...(editingApparel.images || [])]
                                  newImages.splice(index, 1)
                                  setEditingApparel({ ...editingApparel, images: newImages })
                                }}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                            <ImageUpload
                              value={img || ""}
                              onChange={(url) => {
                                const newImages = [...(editingApparel.images || [])]
                                newImages[index] = url
                                setEditingApparel({ ...editingApparel, images: newImages })
                              }}
                              placeholder={`Enter URL or upload image ${index + 1}`}
                              showPreview={true}
                              maxSize={5}
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = [...(editingApparel.images || []), ""]
                            setEditingApparel({ ...editingApparel, images: newImages })
                          }}
                          className="w-full px-4 py-2 border border-yellow-400/20 text-yellow-400 rounded-lg hover:bg-yellow-400/10 transition-all"
                        >
                          Add Another Image
                        </button>
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
                    onClick={updateApparel}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
                  >
                    Update Apparel
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