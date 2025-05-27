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

    // Get all shoes
    const shoes = await db.collection("shoes").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(shoes)
  } catch (error) {
    console.error("Error fetching shoes:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
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

    // Get shoe data from request body
    const shoeData = await request.json()

    // Validate required fields
    if (!shoeData.name || !shoeData.brand || !shoeData.price) {
      return NextResponse.json({ message: "Name, brand, and price are required" }, { status: 400 })
    }

    // Create shoe object
    const shoe = {
      ...shoeData,
      price: Number.parseFloat(shoeData.price),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert shoe into database
    const result = await db.collection("shoes").insertOne(shoe)

    return NextResponse.json({
      message: "Shoe added successfully",
      shoe: { ...shoe, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error adding shoe:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
