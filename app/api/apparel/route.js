import { NextResponse } from "next/server"
import { connectToDatabase } from "../../lib/mongodb"

export async function GET(request) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get("brand")
    const size = searchParams.get("size")
    const search = searchParams.get("search")
    const filter = {}
    if (brand) filter.brand = brand
    if (size) filter.sizes = { $in: [size] }
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } }
    ]
    const apparel = await db.collection("apparel").find(filter).toArray()
    return NextResponse.json(apparel)
  } catch (error) {
    console.error("Error fetching apparel:", error)
    // Fallback data
    const fallbackApparel = [
      {
        _id: "1",
        name: "OG Vault Tee",
        brand: "OG Vault",
        price: 40,
        image: "/placeholder.svg?height=300&width=400",
        sizes: ["S", "M", "L", "XL", "XXL"],
        description: "Premium cotton t-shirt with OG Vault branding.",
        featured: true,
      },
      {
        _id: "2",
        name: "Classic Logo Shirt",
        brand: "OG Vault",
        price: 35,
        image: "/placeholder.svg?height=300&width=400",
        sizes: ["S", "M", "L", "XL"],
        description: "Classic fit t-shirt with logo print.",
        featured: true,
      },
    ]
    return NextResponse.json(fallbackApparel)
  }
} 