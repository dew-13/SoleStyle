import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"
import { transporter, mailOptions } from "../../../lib/nodemailer"

const sendNewOrderNotification = async (order) => {
  const { orderId, totalPrice, customerName, items } = order;

  const itemsList = items.map(item => 
    `<li>${item.item.name} (x${item.quantity}) - ${item.totalPrice}</li>`
  ).join('');

  try {
    await transporter.sendMail({
      ...mailOptions,
      subject: `New Order Received: ${orderId}`,
      html: `
        <h1>New Order Received!</h1>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Total:</strong> ${totalPrice}</p>
        <p><strong>Items:</strong></p>
        <ul>
          ${itemsList}
        </ul>
      `,
    });
    console.log("New order notification sent successfully.");
  } catch (error) {
    console.error("Error sending new order notification:", error);
  }
};

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
      items, // New field for multiple items
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

    // Handle multiple items (new approach) or single item (legacy support)
    if (items && Array.isArray(items) && items.length > 0) {
      // New multiple items approach
      const orderItems = []
      let totalOrderPrice = 0
      let totalOrderProfit = 0

      for (const orderItem of items) {
        let item = null
        const itemType = orderItem.type || "shoe"
        
        if (itemType === "apparel") {
          if (!orderItem.apparelId) {
            return NextResponse.json({ message: "Apparel ID required for item" }, { status: 400 })
          }
          item = await db.collection("apparel").findOne({ _id: new ObjectId(orderItem.apparelId) })
          if (!item) {
            return NextResponse.json({ message: "Apparel not found" }, { status: 404 })
          }
        } else {
          if (!orderItem.shoeId) {
            return NextResponse.json({ message: "Shoe ID required for item" }, { status: 400 })
          }
          item = await db.collection("shoes").findOne({ _id: new ObjectId(orderItem.shoeId) })
          if (!item) {
            return NextResponse.json({ message: "Shoe not found" }, { status: 404 })
          }
        }

        const itemTotal = Number(orderItem.totalPrice) || Number(item.price) * Number(orderItem.quantity)
        const itemProfit = (Number(orderItem.profit) || item.profit || 0) * Number(orderItem.quantity)
        
        totalOrderPrice += itemTotal
        totalOrderProfit += itemProfit

        orderItems.push({
          type: itemType,
          item: {
            _id: item._id,
            name: item.name,
            brand: item.brand,
            image: item.image,
            price: item.price,
            retailPrice: item.retailPrice,
            profit: item.profit,
          },
          size: orderItem.size,
          quantity: Number(orderItem.quantity),
          totalPrice: itemTotal,
          profit: itemProfit,
        })
      }

      // Generate order ID
      const orderCount = await db.collection("orders").countDocuments()
      const orderId = `OG${String(orderCount + 1).padStart(6, "0")}`

      const customerPhone =
        customerContact ||
        (shippingAddress && (shippingAddress.phone || shippingAddress.mobile || shippingAddress.contact)) ||
        ""

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

      // Create combined order
      const order = {
        orderId,
        userId: userId ? new ObjectId(userId) : null,
        items: orderItems,
        totalPrice: totalOrderPrice,
        totalProfit: totalOrderProfit,
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

      // Send notification
      await sendNewOrderNotification(order);

      return NextResponse.json({
        message: "Order created successfully",
        orderId: order.orderId,
        _id: result.insertedId,
        total: totalOrderPrice,
        profit: totalOrderProfit,
      })
    }

    // Legacy single item approach (for backward compatibility)
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

    // Send notification for legacy orders
    const notificationOrder = {
      ...order,
      items: [{
        item: { name: order[itemType].name },
        quantity: order.quantity,
        totalPrice: order.totalPrice,
      }],
    };
    await sendNewOrderNotification(notificationOrder);

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
