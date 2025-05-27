// Run this script with: node scripts/create-admin.js
import bcrypt from "bcryptjs"
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://dew:GRzZlJRaiLjtQeFD@ogvault2025.ffmmzlb.mongodb.net/"

async function createAdmin() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("solestyle") // or your database name

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 12)

    // Create admin user
    const result = await db.collection("users").insertOne({
      firstName: "Admin",
      lastName: "User",
      email: "admin@og.com",
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("✅ Admin user created successfully!")
    console.log("📧 Email: admin@ogvault.com")
    console.log("🔑 Password: admin123")
    console.log("🆔 User ID:", result.insertedId)
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
  } finally {
    await client.close()
  }
}

createAdmin()
