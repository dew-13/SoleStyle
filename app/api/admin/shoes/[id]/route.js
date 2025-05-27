import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../../lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Connect to database
    const { db } = await connectToDatabase()

    // Fetch shoe by ID
    const shoe = await db.collection("shoes").findOne({ _id: new ObjectId(id) })

    if (!shoe) {
      return NextResponse.json({ message: "Shoe not found" }, { status: 404 })
    }

    return NextResponse.json(shoe)
  } catch (error) {
    console.error("Error fetching shoe:", error)
    return NextResponse.json({ message: "Error fetching shoe" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    // Verify token (do NOT check isAdmin here)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    const updateData = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Remove _id from updateData if it exists
    delete updateData._id

    // Update shoe
    const result = await db.collection("shoes").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Shoe not found" }, { status: 404 })
    }

    // Fetch and return updated shoe
    const updatedShoe = await db.collection("shoes").findOne({ _id: new ObjectId(id) })

    return NextResponse.json(updatedShoe)
  } catch (error) {
    console.error("Error updating shoe:", error)
    return NextResponse.json({ message: "Error updating shoe" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    // Verify token (do NOT check isAdmin here)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Delete shoe
    const result = await db.collection("shoes").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Shoe not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Shoe deleted successfully" })
  } catch (error) {
    console.error("Error deleting shoe:", error)
    return NextResponse.json({ message: "Error deleting shoe" }, { status: 500 })
  }
}