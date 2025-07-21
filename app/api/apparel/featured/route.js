import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const featuredApparel = await db.collection("apparel")
      .find({ featured: true, hidden: { $ne: true } })
      .limit(8)
      .toArray()
    
    return NextResponse.json(featuredApparel)
  } catch (error) {
    console.error("Error fetching featured apparel:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 