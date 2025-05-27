import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "../../../lib/mongodb"

// This is a one-time setup endpoint - remove after creating admin
export async function POST(request) {
  try {
    const { email, password, secretKey } = await request.json()

    // Add a secret key for security
    if (secretKey !== "create-admin-og-vault-2024") {
      return NextResponse.json({ message: "Invalid secret key" }, { status: 403 })
    }

    const { db } = await connectToDatabase()

    // Check if admin already exists
    const existingAdmin = await db.collection("users").findOne({ isAdmin: true })
    if (existingAdmin) {
      return NextResponse.json({ message: "Admin user already exists" }, { status: 400 })
    }

    // Check if user with this email already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      // Update existing user to admin
      await db.collection("users").updateOne(
        { email },
        {
          $set: {
            isAdmin: true,
            updatedAt: new Date(),
          },
        },
      )

      return NextResponse.json({
        message: "Existing user updated to admin successfully",
        email: email,
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const result = await db.collection("users").insertOne({
      firstName: "Admin",
      lastName: "User",
      email: email,
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      message: "Admin user created successfully",
      userId: result.insertedId,
      email: email,
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
