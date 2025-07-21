import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }
    const apparel = await db.collection("apparel").find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(apparel)
  } catch (error) {
    console.error("Error fetching apparel:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }
    const apparelData = await request.json()
    if (!apparelData.name || !apparelData.brand || !apparelData.price) {
      return NextResponse.json({ message: "Name, brand, and price are required" }, { status: 400 })
    }
    // Save apparel exactly like shoes: spread all fields, set price as number, set createdAt/updatedAt
    const apparel = {
      ...apparelData,
      price: Number.parseFloat(apparelData.price),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection("apparel").insertOne(apparel)
    return NextResponse.json({
      message: "Apparel added successfully",
      apparel: { ...apparel, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error adding apparel:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 