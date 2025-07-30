export interface User {
  id: string
  _id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  isAdmin: boolean
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country?: string
  }
  createdAt: string
}

export interface Users {
  id: string
  _id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  isAdmin: boolean
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country?: string
  }
  createdAt: string
}


export interface Shoe {
  _id: string
  name: string
  brand: string
  profit: number
  retailPrice: number
  price: number
  description: string
  image: string
  images?: string[]
  sizes: string[]
  featured: boolean
  hidden?: boolean
  createdAt: string
  rating?: number
  reviews?: number
  features?: string[]
}

export interface Apparel {
  _id: string
  name: string
  brand: string
  price: number
  image: string
  images?: string[]
  sizes: string[]
  description: string
  featured: boolean
  createdAt: string
  rating?: number
  reviews?: number
  features?: string[]
  retailPrice?: number
  profit?: number
}

export interface CartItem {
  id: string
  name: string
  brand: string
  price: number
  retailPrice: number
  profit: number
  image: string
  size: string
  quantity: number
}

export interface Order {
  _id: string
  userId: string
  shoeId?: string
  apparelId?: string
  orderId?: string
  customerName: string
  customerPhone: string
  customerEmail: string
  shoe?: Shoe
  apparel?: Apparel
  size: string
  quantity: number
  total: number
  totalPrice?: number
  totalProfit?: number
  items?: {
    item: Shoe | Apparel
    size: string
    quantity: number
    totalPrice: number
    profit: number
  }[]
  status: "pending" | "payment_received" | "installment_received" | "shipped" | "delivered" | "cancelled"
  paymentMethod: "full" | "installments" | "cash"
  createdAt: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface WishlistItem {
  _id: string
  userId: string
  shoeId: string
  shoe: Shoe
  createdAt: string
}

export interface Brand {
  _id: string
  name: string
  shoeCount?: number
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

export interface OrderDetails {
  shoe?: Shoe
  apparel?: Apparel
  size: string
  quantity: number
  totalPrice: number
}

export interface ShippingAddress {
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
}

export interface HeaderProps {
  user: User | null
  setUser: (user: User | null) => void
}

export interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword?: string
  paymentMethod: "full" | "installments"
}

export interface LoginFormData {
  email: string
  password: string
}

export interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
}


export type Address = {
  street: string
  city: string
  state: string
  zipCode: string
}


export type UserType = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: Address
}
