"use client"

import { motion } from "framer-motion"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-black border-t border-yellow-400/20 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2">
              <Image src="/body-logo.png" alt="OG Vault" width={132} height={1022} className="object-contain" />
             
            </div>
            <p className="text-gray-400">
              Unlock the Legacy - Sealed for Greatness. Step into the future of footwear fashion with our original
              collection.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />
             
              <Instagram className="w-5 h-5 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors" />
              
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-white">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop?brand=Nike" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Nike
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=Adidas" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Adidas
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=Converse" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Converse
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=Vans" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Vans
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-white">Contact Info</h4>
            <div className="space-y-2 text-gray-400">
              <p>123 Fashion Street</p>
              <p>New York, NY 10001</p>
              <p>Phone: +1 (437) 661-1999</p>
              <p>Email: ogvaultinfinity@gmail.com</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-gray-700 mt-8 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400">© 2025 OG Vault. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}
