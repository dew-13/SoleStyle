import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import crypto from "crypto"
import { transporter, mailOptions } from "../../../lib/nodemailer"

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    const passwordResetExpires = Date.now() + 3600000 // 1 hour

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken,
          passwordResetExpires,
        },
      }
    )

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    try {
      await transporter.sendMail({
        ...mailOptions,
        to: email,
        subject: "Password Reset",
        text: `Please use the following link to reset your password: ${resetUrl}`,
        html: `<p>Please use the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
      })
      return NextResponse.json({ message: `A password reset link has been sent to your email.` })
    } catch (error) {
      console.error("Failed to send email:", error)
      return NextResponse.json({ message: "Failed to send password reset email." }, { status: 500 })
    }
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
