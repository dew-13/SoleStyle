import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      shoeId,
      apparelId,
      type,
      size,
      quantity,
      retailPrice,
      profit,
      price,
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

    let item = null
    let itemType = type || "shoe"
    if (itemType === "apparel") {
      if (!apparelId) {
        return NextResponse.json({ message: "Apparel ID required" }, { status: 400 })
      }
      item = await db.collection("apparel").findOne({ _id: new ObjectId(apparelId) })
      if (!item) {
        return NextResponse.json({ message: "Apparel not found" }, { status: 404 })
      }
    } else {
      if (!shoeId) {
        return NextResponse.json({ message: "Shoe ID required" }, { status: 400 })
      }
      item = await db.collection("shoes").findOne({ _id: new ObjectId(shoeId) })
      if (!item) {
        return NextResponse.json({ message: "Shoe not found" }, { status: 404 })
      }
    }

    // Generate order ID
    const orderCount = await db.collection("orders").countDocuments()
    const orderId = `OG${String(orderCount + 1).padStart(6, "0")}`

    // Calculate total (ensure it's a number)
    const calculatedTotal = Number(totalPrice) || Number(item.price) * Number(quantity)

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
      [itemType]: {
        _id: item._id,
        name: item.name,
        brand: item.brand,
        image: item.image,
        price: item.price,
        retailPrice: item.retailPrice,
        profit: item.profit,
      },
      size,
      quantity: Number(quantity),
      retailPrice: Number(retailPrice) || item.retailPrice,
      profit: Number(profit) || item.profit,
      totalPrice: calculatedTotal,
      customerName: finalCustomerName,
      customerPhone: customerPhone,
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
