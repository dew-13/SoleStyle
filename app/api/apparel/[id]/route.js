import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params
    
    const apparel = await db.collection("apparel").findOne({ 
      _id: new ObjectId(id),
      hidden: { $ne: true }
    })
    
    if (!apparel) {
      return NextResponse.json({ message: "Apparel not found" }, { status: 404 })
    }

    return NextResponse.json(apparel)
  } catch (error) {
    console.error("Error fetching apparel:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 