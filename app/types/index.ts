export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  isAdmin?: boolean
  createdAt: string
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface Shoe {
  _id: string
  name: string
  brand: string
  price: number
  description: string
  image: string
  images?: string[]
  sizes: string[]
  featured: boolean
  hidden?: boolean
  createdAt: string
  updatedAt?: string
}

export interface Order {
  _id: string
  userId: string
  shoeId: string
  orderId?: string
  shoe: Shoe
  size: string
  quantity: number
  total: number
  totalPrice?: number // For backward compatibility
  customerName: string
  customerPhone: string
  customerEmail: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  status: "pending" | "payment_received" | "installment_received" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  updatedAt?: string
}

export interface Brand {
  _id: string
  name: string
  logo?: string
  shoeCount: number
}

export interface AdminStats {
  totalShoes: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  monthlyRevenue: number
  featuredShoes: number
  recentOrders: Order[]
  topShoes: (Shoe & { orderCount: number })[]
}

export interface CartItem {
  _id: string
  name: string
  brand: string
  price: number
  image: string
  size: string
  quantity: number
}

export interface WishlistItem {
  _id: string
  name: string
  brand: string
  price: number
  image: string
}
