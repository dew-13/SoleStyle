import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
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

    // Get all orders with customer information
    const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray()

    // Enrich orders with customer information
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const customer = await db.collection("users").findOne({ _id: order.userId })
        return {
          ...order,
          orderId: order._id.toString().slice(-8).toUpperCase(),
          customerName: customer ? `${customer.firstName} ${customer.lastName}` : "Unknown",
          customerContact: customer ? customer.email : "Unknown",
        }
      }),
    )

    return NextResponse.json(enrichedOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
