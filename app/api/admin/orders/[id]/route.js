import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "../../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request, { params }) {
  try {
    const { id } = params

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify token and check admin status
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { db } = await connectToDatabase()

    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    // Get update data from request body
    const updateData = await request.json()

    // Update order
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Order updated successfully" })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
