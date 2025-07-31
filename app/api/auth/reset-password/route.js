import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import crypto from "crypto"
import bcrypt from "bcryptjs"

export async function POST(request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 })
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          passwordResetToken: undefined,
          passwordResetExpires: undefined,
        },
      }
    )

    return NextResponse.json({ message: "Password has been reset successfully." })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
