"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  showPreview?: boolean
  maxSize?: number // in MB
}

export default function ImageUpload({
  value,
  onChange,
  placeholder = "Enter image URL or upload file",
  className = "",
  showPreview = true,
  maxSize = 5
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUrlChange = async (url: string) => {
    if (!url.trim()) {
      onChange("")
      return
    }

    setIsUploading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl: url }),
      })

      if (response.ok) {
        onChange(url)
        toast.success("Image URL validated successfully!")
      } else {
        const error = await response.json()
        toast.error(error.message || "Invalid image URL")
      }
    } catch (error) {
      console.error("URL validation error:", error)
      toast.error("Failed to validate image URL")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`)
      return
    }

    setIsUploading(true)
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onChange(data.imageUrl)
        toast.success("Image uploaded successfully!")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to upload image")
      }
    } catch (error) {
      console.error("File upload error:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const clearImage = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Upload Mode Toggle */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setUploadMode("url")}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            uploadMode === "url"
              ? "bg-yellow-400 text-black"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          <LinkIcon className="w-4 h-4 inline mr-1" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setUploadMode("file")}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            uploadMode === "file"
              ? "bg-yellow-400 text-black"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          <Upload className="w-4 h-4 inline mr-1" />
          File
        </button>
      </div>

      {/* URL Input Mode */}
      {uploadMode === "url" && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={value}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 pl-10 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
              disabled={isUploading}
            />
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            {value && (
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {isUploading && (
            <div className="text-sm text-yellow-400">Validating image URL...</div>
          )}
        </div>
      )}

      {/* File Upload Mode */}
      {uploadMode === "file" && (
        <div className="space-y-2">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              value
                ? "border-yellow-400/50 bg-yellow-400/5"
                : "border-gray-600 hover:border-yellow-400/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!value ? (
              <div className="space-y-3">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm text-gray-400">
                    Drag and drop an image here, or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-yellow-400 hover:text-yellow-300 underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max size: {maxSize}MB • Supported: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <ImageIcon className="w-8 h-8 text-yellow-400 mx-auto" />
                <p className="text-sm text-gray-400">Image uploaded successfully!</p>
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-red-400 hover:text-red-300 text-sm underline"
                >
                  Remove image
                </button>
              </div>
            )}
            
            {isUploading && (
              <div className="text-sm text-yellow-400">Uploading image...</div>
            )}
          </div>
        </div>
      )}

      {/* Image Preview */}
      {showPreview && value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="aspect-square border border-yellow-400/20 rounded-lg overflow-hidden">
            <Image
              src={value}
              alt="Preview"
              width={200}
              height={200}
              className="w-full h-full object-cover"
              onError={() => {
                toast.error("Failed to load image preview")
              }}
            />
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 bg-black/80 rounded-full text-white hover:bg-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  )
} 