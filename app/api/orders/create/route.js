import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      shoeId,
      size,
      quantity,
      totalPrice,
      customerName,
      customerContact,
      customerEmail,
      shippingAddress,
      paymentMethod,
    } = body

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    let userId = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        userId = decoded.userId
      } catch (error) {
        console.log("Invalid token, proceeding as guest")
      }
    }

    const { db } = await connectToDatabase()

    // Get shoe details
    const shoe = await db.collection("shoes").findOne({ _id: new ObjectId(shoeId) })
    if (!shoe) {
      return NextResponse.json({ message: "Shoe not found" }, { status: 404 })
    }

    // Generate order ID
    const orderCount = await db.collection("orders").countDocuments()
    const orderId = `OG${String(orderCount + 1).padStart(6, "0")}`

    // Calculate total (ensure it's a number)
    const calculatedTotal = Number(totalPrice) || Number(shoe.price) * Number(quantity)

    const customerPhone =
      customerContact ||
      (shippingAddress && (shippingAddress.phone || shippingAddress.mobile || shippingAddress.contact)) ||
      ""


         // Fallback for customerName and customerEmail
    const finalCustomerName =
      customerName ||
      (shippingAddress && (shippingAddress.fullName || shippingAddress.name)) ||
      ""
    const finalCustomerEmail =
      customerEmail ||
      (shippingAddress && shippingAddress.email) ||
      ""


    // Set status based on payment method
    let status = "pending"
    if (paymentMethod === "full") {
      status = "pending_full_payment"
    } else if (paymentMethod === "installments") {
      status = "pending_installment"
    }

    // Create order
    const order = {
      orderId,
      userId: userId ? new ObjectId(userId) : null,
      shoe: {
        _id: shoe._id,
        name: shoe.name,
        brand: shoe.brand,
        image: shoe.image,
        price: shoe.price,
      },
      size,
      quantity: Number(quantity),
      totalPrice: calculatedTotal, // Store both for compatibility
      customerName: finalCustomerName,
      customerPhone: customerPhone, // Store phone in both fields
      customerEmail: finalCustomerEmail,
      shippingAddress,
      paymentMethod,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("orders").insertOne(order)

    return NextResponse.json({
      message: "Order created successfully",
      orderId: order.orderId,
      _id: result.insertedId,
      total: calculatedTotal,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
