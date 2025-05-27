import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get popular brands from shoes collection
    const brands = await db
      .collection("shoes")
      .aggregate([
        {
          $group: {
            _id: "$brand",
            count: { $sum: 1 },
            logo: { $first: "$brandLogo" },
          },
        },
        {
          $project: {
            _id: 1,
            name: "$_id",
            count: 1,
            logo: {
              $ifNull: ["$logo", "/placeholder.svg?height=100&width=100"],
            },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ])
      .toArray()

    // If no brands found, return default basketball brands
    if (brands.length === 0) {
      const defaultBrands = [
        { _id: "1", name: "Nike", logo: "/placeholder.svg?height=100&width=100" },
        { _id: "2", name: "Adidas", logo: "/placeholder.svg?height=100&width=100" },
        { _id: "3", name: "Jordan", logo: "/placeholder.svg?height=100&width=100" },
        { _id: "4", name: "Puma", logo: "/placeholder.svg?height=100&width=100" },
        { _id: "5", name: "Under Armour", logo: "/placeholder.svg?height=100&width=100" },
        { _id: "6", name: "New Balance", logo: "/placeholder.svg?height=100&width=100" },
      ]
      return NextResponse.json(defaultBrands)
    }

    return NextResponse.json(brands)
  } catch (error) {
    console.error("Error fetching popular brands:", error)
    // Return fallback data
    const fallbackBrands = [
      { _id: "1", name: "Nike", logo: "/placeholder.svg?height=100&width=100" },
      { _id: "2", name: "Adidas", logo: "/placeholder.svg?height=100&width=100" },
      { _id: "3", name: "Jordan", logo: "/placeholder.svg?height=100&width=100" },
      { _id: "4", name: "Puma", logo: "/placeholder.svg?height=100&width=100" },
      { _id: "5", name: "Under Armour", logo: "/placeholder.svg?height=100&width=100" },
      { _id: "6", name: "New Balance", logo: "/placeholder.svg?height=100&width=100" },
    ]
    return NextResponse.json(fallbackBrands)
  }
}
