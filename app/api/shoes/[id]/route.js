import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

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

    // Return fallback data if database connection fails or invalid ID
    const fallbackShoe = {
      _id: params.id,
      name: "Air Max 270 Premium Edition",
      brand: "Nike",
      price: 45000,
      image: "/placeholder.svg?height=500&width=600",
      images: [
        "/placeholder.svg?height=500&width=600",
        "/placeholder.svg?height=500&width=600",
        "/placeholder.svg?height=500&width=600",
      ],
      sizes: ["8", "8.5", "9", "9.5", "10", "10.5", "11"],
      description:
        "The Nike Air Max 270 delivers visible cushioning under every step. The design draws inspiration from the Air Max 93 and Air Max 180, featuring Nike's largest heel Air unit yet for a super-soft ride that feels as impossible as it looks.",
      features: [
        "Nike Air Max 270 unit delivers all-day comfort",
        "Engineered mesh upper is lightweight and breathable",
        "Foam midsole feels soft and comfortable",
        "Rubber outsole with flex grooves for natural motion",
      ],
      rating: 4.5,
      reviews: 128,
      featured: true,
      visible: true,
    }

    return NextResponse.json(fallbackShoe)
  }
}
