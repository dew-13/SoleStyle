import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    // Verify token and get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { db } = await connectToDatabase()

    // Check if user exists and is admin
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    // Get real stats from database
    const totalShoes = await db.collection("shoes").countDocuments()
    const totalOrders = await db.collection("orders").countDocuments()
    const totalUsers = await db.collection("users").countDocuments()

    // Calculate total revenue
    const orders = await db.collection("orders").find({}).toArray()
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)

    // Get recent orders
    const recentOrders = await db.collection("orders").find({}).sort({ createdAt: -1 }).limit(5).toArray()

    return NextResponse.json({
      totalShoes,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ message: "Error fetching stats" }, { status: 500 })
  }
}
