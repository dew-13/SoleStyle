import { NextResponse } from "next/server"
import { connectToDatabase } from "../../lib/mongodb"

export async function GET() {
  try {
    // Connect to database
    const { db } = await connectToDatabase()

    // Fetch brands from database
    const brands = await db.collection("brands").find({}).toArray()

    return NextResponse.json(brands)
  } catch (error) {
    console.error("Error fetching brands:", error)

    // Return fallback data if database connection fails
    const fallbackBrands = [
      { _id: "1", name: "Nike" },
      { _id: "2", name: "Adidas" },
      { _id: "3", name: "Converse" },
      { _id: "4", name: "Vans" },
      { _id: "5", name: "Puma" },
      { _id: "6", name: "New Balance" },
    ]

    return NextResponse.json(fallbackBrands)
  }
}
