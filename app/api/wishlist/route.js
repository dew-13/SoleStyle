import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { shoeId } = await request.json()

    const { db } = await connectToDatabase()

    // Check if item already in wishlist
    const existingItem = await db.collection("wishlist").findOne({
      userId: new ObjectId(decoded.userId),
      shoeId: new ObjectId(shoeId),
    })

    if (existingItem) {
      return NextResponse.json({ message: "Item already in wishlist" }, { status: 400 })
    }

    // Add to wishlist
    await db.collection("wishlist").insertOne({
      userId: new ObjectId(decoded.userId),
      shoeId: new ObjectId(shoeId),
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Added to wishlist" })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { shoeId } = await request.json()

    const { db } = await connectToDatabase()

    await db.collection("wishlist").deleteOne({
      userId: new ObjectId(decoded.userId),
      shoeId: new ObjectId(shoeId),
    })

    return NextResponse.json({ message: "Removed from wishlist" })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
