import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { userId } = params

    // Verify user can access this wishlist
    if (decoded.userId !== userId) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    const { db } = await connectToDatabase()

    const wishlistItems = await db
      .collection("wishlist")
      .find({ userId: new ObjectId(userId) })
      .toArray()

    // Get shoe details for each wishlist item
    const wishlistWithShoes = await Promise.all(
      wishlistItems.map(async (item) => {
        const shoe = await db.collection("shoes").findOne({ _id: item.shoeId })
        return {
          ...item,
          shoe,
        }
      }),
    )

    return NextResponse.json(wishlistWithShoes)
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
