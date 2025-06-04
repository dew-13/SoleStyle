"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Search, ShoppingCart, User, LogOut, Package, UserCircle, Menu, X, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { HeaderProps } from "app/types"
import { useCart } from "../context/CartContext"

export default function Header({ user, setUser }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false)
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false)
  const { cartItems } = useCart()

  // Calculate total cart items (sum of quantities)
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setShowUserMenu(false)
    setShowMobileMenu(false)
    window.location.href = "/"
  }

  const closeMobileMenu = () => {
    setShowMobileMenu(false)
  }

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-yellow-400/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
              <Image src="/body-logo.png" alt="OG Vault" width={100} height={60} className="object-contain" />
              <div className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"></div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Home Icon */}
            <Link href="/">
              <motion.div
                className="p-2 rounded-full hover:bg-yellow-400/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </Link>

            {/* Search Icon - Directs to Shop */}
            <Link href="/shop">
              <motion.div
                className="p-2 rounded-full hover:bg-yellow-400/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </Link>

            {/* Cart Icon with Badge */}
            <Link href="/cart">
              <motion.div
                className="p-2 rounded-full hover:bg-yellow-400/20 transition-colors relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-6 h-6 text-yellow-400" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </motion.div>
            </Link>

            {/* Admin Link - Only show if user is admin */}
            {user?.isAdmin && (
              <Link href="/admin">
                <motion.div
                  className="p-2 rounded-full hover:bg-yellow-400/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Shield className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </Link>
            )}

            {/* User Authentication */}
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 rounded-full hover:bg-yellow-400/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="w-6 h-6 text-yellow-400" />
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-black border border-yellow-400/20 rounded-lg shadow-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="py-2">
                        <Link href="/profile">
                          <button className="w-full px-4 py-2 text-left hover:bg-yellow-400/10 flex items-center space-x-2">
                            <UserCircle className="w-4 h-4" />
                            <span>Profile</span>
                          </button>
                        </Link>
                        <Link href="/profile?tab=orders">
                          <button className="w-full px-4 py-2 text-left hover:bg-yellow-400/10 flex items-center space-x-2">
                            <Package className="w-4 h-4" />
                            <span>Orders</span>
                          </button>
                        </Link>
                        {user.isAdmin && (
                          <Link href="/admin">
                            <button className="w-full px-4 py-2 text-left hover:bg-yellow-400/10 flex items-center space-x-2">
                              <Shield className="w-4 h-4" />
                              <span>Admin Panel</span>
                            </button>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left hover:bg-yellow-400/10 flex items-center space-x-2 text-red-400"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <motion.button
                    className="px-4 py-2 text-yellow-400 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/auth/signup">
                  <motion.button
                    className="px-4 py-2  text-yellow-400 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-full hover:bg-yellow-400/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-yellow-400" />
              ) : (
                <Menu className="w-6 h-6 text-yellow-400" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              className="md:hidden mt-4 bg-black border border-yellow-400/20 rounded-lg p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                {/* Navigation Links */}
                <Link href="/" onClick={closeMobileMenu}>
                  <div className="flex items-center space-x-3 p-2 hover:bg-yellow-400/10 rounded-lg transition-colors">
                    <Home className="w-5 h-5 text-yellow-400" />
                    <span>Home</span>
                  </div>
                </Link>

                <Link href="/shop" onClick={closeMobileMenu}>
                  <div className="flex items-center space-x-3 p-2 hover:bg-yellow-400/10 rounded-lg transition-colors">
                    <Search className="w-5 h-5 text-yellow-400" />
                    <span>Shop</span>
                  </div>
                </Link>

                <Link href="/cart" onClick={closeMobileMenu}>
                  <div className="flex items-center space-x-3 p-2 hover:bg-yellow-400/10 rounded-lg transition-colors">
                    <ShoppingCart className="w-5 h-5 text-yellow-400" />
                    <span>Cart ({cartItemCount})</span>
                  </div>
                </Link>

                {/* Admin Link - Only show if user is admin */}
                {user?.isAdmin && (
                  <Link href="/admin" onClick={closeMobileMenu}>
                    <div className="flex items-center space-x-3 p-2 hover:bg-yellow-400/10 rounded-lg transition-colors">
                      <Shield className="w-5 h-5 text-yellow-400" />
                      <span>Admin Panel</span>
                    </div>
                  </Link>
                )}

                {/* User Section */}
                {user ? (
                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <Link href="/profile" onClick={closeMobileMenu}>
                      <div className="flex items-center space-x-3 p-2 hover:bg-yellow-400/10 rounded-lg transition-colors">
                        <UserCircle className="w-5 h-5 text-yellow-400" />
                        <span>Profile</span>
                      </div>
                    </Link>
                    <Link href="/profile?tab=orders" onClick={closeMobileMenu}>
                      <div className="flex items-center space-x-3 p-2 hover:bg-yellow-400/10 rounded-lg transition-colors">
                        <Package className="w-5 h-5 text-yellow-400" />
                        <span>Orders</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-2 hover:bg-yellow-400/10 rounded-lg transition-colors text-red-400"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <Link href="/auth/login" onClick={closeMobileMenu}>
                      <button className="w-full text-left p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors">
                        Login
                      </button>
                    </Link>
                    <Link href="/auth/signup" onClick={closeMobileMenu}>
                      <button className="w-full text-left p-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all">
                        Sign Up
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
