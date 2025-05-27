import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

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

    // Fetch all shoes for admin
    const shoes = await db.collection("shoes").find({}).toArray()

    return NextResponse.json(shoes)
  } catch (error) {
    console.error("Error fetching shoes:", error)
    return NextResponse.json({ message: "Error fetching shoes" }, { status: 500 })
  }
}

export async function POST(request) {
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

    const shoeData = await request.json()

    // Add shoe to database
    const result = await db.collection("shoes").insertOne({
      ...shoeData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ message: "Shoe added successfully", id: result.insertedId })
  } catch (error) {
    console.error("Error adding shoe:", error)
    return NextResponse.json({ message: "Error adding shoe" }, { status: 500 })
  }
}
