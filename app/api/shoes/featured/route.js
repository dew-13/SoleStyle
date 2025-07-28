import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"

export async function GET() {
  try {
    // Connect to database
    const { db } = await connectToDatabase()

    // Fetch featured shoes from database
    const featuredShoes = await db.collection("shoes").find({ featured: true }).limit(6).toArray()

    return NextResponse.json(featuredShoes)
  } catch (error) {
    console.error("Error fetching featured shoes:", error)

    // Return fallback data if database connection fails
    const fallbackFeaturedShoes = [
      {
        _id: "1",
        name: "Air Max 270",
        brand: "Nike",
        price: 150,
        image: "/placeholder.svg?height=300&width=400",
        featured: true,
      },
      {
        _id: "2",
        name: "Ultra Boost 22",
        brand: "Adidas",
        price: 180,
        image: "/placeholder.svg?height=300&width=400",
        featured: true,
      },
      {
        _id: "3",
        name: "Chuck Taylor All Star",
        brand: "Converse",
        price: 65,
        image: "/placeholder.svg?height=300&width=400",
        featured: true,
      },
    ]

    return NextResponse.json(fallbackFeaturedShoes)
  }
}