import { NextResponse } from "next/server"
import { connectToDatabase } from "../../lib/mongodb"

export async function GET(request) {
  try {
    // Connect to database
    const { db } = await connectToDatabase()

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get("brand")
    const size = searchParams.get("size")
    const search = searchParams.get("search")

    // Build filter object
    const filter = {}

    if (brand) {
      filter.brand = brand
    }

    if (size) {
      filter.sizes = { $in: [size] }
    }

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { brand: { $regex: search, $options: "i" } }]
    }

    // Fetch shoes from database
    const shoes = await db.collection("shoes").find(filter).toArray()

    return NextResponse.json(shoes)
  } catch (error) {
    console.error("Error fetching shoes:", error)

    // Return fallback data if database connection fails
    const fallbackShoes = [
      {
        _id: "1",
        name: "Air Max 270",
        brand: "Nike",
        price: 150,
        image: "/placeholder.svg?height=300&width=400",
        sizes: ["8", "8.5", "9", "9.5", "10", "10.5", "11"],
        description: "The Nike Air Max 270 delivers visible cushioning under every step.",
        featured: true,
      },
      {
        _id: "2",
        name: "Ultra Boost 22",
        brand: "Adidas",
        price: 180,
        image: "/placeholder.svg?height=300&width=400",
        sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10"],
        description: "Experience endless energy with Adidas Ultra Boost 22.",
        featured: true,
      },
      {
        _id: "3",
        name: "Chuck Taylor All Star",
        brand: "Converse",
        price: 65,
        image: "/placeholder.svg?height=300&width=400",
        sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9"],
        description: "Classic Converse style that never goes out of fashion.",
        featured: true,
      },
      {
        _id: "4",
        name: "Air Force 1",
        brand: "Nike",
        price: 90,
        image: "/placeholder.svg?height=300&width=400",
        sizes: ["8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5"],
        description: "The iconic Nike Air Force 1 with timeless style.",
      },
      {
        _id: "5",
        name: "Stan Smith",
        brand: "Adidas",
        price: 80,
        image: "/placeholder.svg?height=300&width=400",
        sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5"],
        description: "Clean and classic Adidas Stan Smith sneakers.",
      },
      {
        _id: "6",
        name: "Old Skool",
        brand: "Vans",
        price: 60,
        image: "/placeholder.svg?height=300&width=400",
        sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5"],
        description: "Vans Old Skool with the iconic side stripe.",
      },
    ]

    return NextResponse.json(fallbackShoes)
  }
}
