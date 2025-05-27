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

    try {
      // Get real statistics from database
      const [totalShoes, totalOrders, totalUsers, orders, shoes, featuredShoesCount] = await Promise.all([
        db.collection("shoes").countDocuments(),
        db.collection("orders").countDocuments(),
        db.collection("users").countDocuments(),
        db.collection("orders").find({}).sort({ createdAt: -1 }).limit(10).toArray(),
        db.collection("shoes").find({}).toArray(),
        db.collection("shoes").countDocuments({ featured: true }),
      ])

      // Calculate total revenue from actual orders
      const allOrders = await db.collection("orders").find({}).toArray()
      const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)

      // Calculate monthly revenue (current month)
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      const monthlyOrders = await db
        .collection("orders")
        .find({
          createdAt: { $gte: currentMonth },
        })
        .toArray()

      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)

      // Get recent orders with customer info
      const recentOrders = await Promise.all(
        orders.map(async (order) => {
          const customer = await db.collection("users").findOne({ _id: order.userId })
          return {
            ...order,
            customerName: customer ? `${customer.firstName} ${customer.lastName}` : "Unknown",
          }
        }),
      )

      // Calculate top selling shoes based on actual order data
      const ordersByShoe = {}
      allOrders.forEach((order) => {
        const shoeId = order.shoe._id || order.shoe.id
        if (shoeId) {
          if (!ordersByShoe[shoeId]) {
            ordersByShoe[shoeId] = {
              shoe: order.shoe,
              orderCount: 0,
              totalRevenue: 0,
            }
          }
          ordersByShoe[shoeId].orderCount += order.quantity || 1
          ordersByShoe[shoeId].totalRevenue += order.totalPrice || 0
        }
      })

      // Convert to array and sort by order count
      const topShoes = Object.values(ordersByShoe)
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5)
        .map((item) => ({
          _id: item.shoe._id || item.shoe.id,
          name: item.shoe.name,
          brand: item.shoe.brand,
          price: item.shoe.price,
          orderCount: item.orderCount,
          revenue: item.totalRevenue,
        }))

      return NextResponse.json({
        totalShoes,
        totalOrders,
        totalUsers,
        totalRevenue,
        monthlyRevenue,
        featuredShoes: featuredShoesCount,
        recentOrders,
        topShoes,
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Return fallback data if database operations fail
      return NextResponse.json({
        totalShoes: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        featuredShoes: 0,
        recentOrders: [],
        topShoes: [],
      })
    }
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
