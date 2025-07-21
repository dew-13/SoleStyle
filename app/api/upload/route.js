import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if it's a file upload or URL validation
    const contentType = request.headers.get("content-type")
    
    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData()
      const file = formData.get("image")
      
      if (!file) {
        return NextResponse.json({ message: "No image file provided" }, { status: 400 })
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ message: "File must be an image" }, { status: 400 })
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        return NextResponse.json({ message: "File size must be less than 5MB" }, { status: 400 })
      }

      // Convert file to base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

      return NextResponse.json({
        message: "Image uploaded successfully",
        imageUrl: base64,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })
    } else {
      // Handle URL validation
      const { imageUrl } = await request.json()
      
      if (!imageUrl) {
        return NextResponse.json({ message: "Image URL is required" }, { status: 400 })
      }

      // Validate URL format
      try {
        new URL(imageUrl)
      } catch {
        return NextResponse.json({ message: "Invalid URL format" }, { status: 400 })
      }

      // Optional: Validate that the URL is accessible
      try {
        const response = await fetch(imageUrl, { method: "HEAD" })
        if (!response.ok) {
          return NextResponse.json({ message: "Image URL is not accessible" }, { status: 400 })
        }
        
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.startsWith("image/")) {
          return NextResponse.json({ message: "URL does not point to a valid image" }, { status: 400 })
        }
      } catch (error) {
        console.warn("Could not validate image URL:", error)
        // Don't fail the request, just warn
      }

      return NextResponse.json({
        message: "Image URL validated successfully",
        imageUrl: imageUrl
      })
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 