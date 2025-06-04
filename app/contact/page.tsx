"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react"
import Link from "next/link"
import Header from "../components/Header"
import Footer from "../components/Footer"
import type { User } from "app/types"
import toast, { Toaster } from "react-hot-toast"

export default function ContactPage() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
  })

  const subjectOptions = [
    "Inquire About Placed Orders",
    "Request new Pair",
    "More Details on Order Processing",
    "Other",
  ]

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const response = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
            // Pre-fill form if user is logged in
            setFormData((prev) => ({
              ...prev,
              name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
              subject: "",
              description: "",
            }))
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }
    checkAuth()
  }, [])

  // Update the handleInputChange function type to include HTMLSelectElement
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.subject || !formData.description) {
      toast.error("Please fill in all fields")
      return
    }

    // Format message for WhatsApp
    const message = `Hi! I'm ${formData.name}.

Subject: ${formData.subject}

Description: ${formData.description}

Please assist me with this inquiry. Thank you!`

    const phoneNumber = "+14376611999" // Replace with actual contact number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    // Open WhatsApp
    window.open(whatsappUrl, "_blank")

    // Reset form
    setFormData({
      name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
      subject: "",
      description: "",
    })

    toast.success("Redirecting to WhatsApp...")
  }

  const handleWhatsAppContact = () => {
    const message = "Hi! I have a question about your basketball sneakers."
    const phoneNumber = "+14376611999" // Replace with actual contact number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const contactInfo = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "WhatsApp",
      content: "+1 437 661 1999",
      description: "Quick responses via WhatsApp",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      content: "+1 437 661 1999",
      description: "Mon-Fri 9AM-6PM (Sri Lanka Time)",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Response Time",
      content: "Within 24 Hours",
      description: "Fast customer support",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location",
      content: "Colombo, Sri Lanka",
      description: "Serving customers nationwide",
    },
  ]

  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Typically 20-30 business days from Canada to Sri Lanka, including customs clearance.",
    },
    {
      question: "Are all shoes 100% authentic?",
      answer: "Yes, we guarantee 100% authenticity. All shoes are sourced directly from authorized Canadian retailers.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept bank transfers, and installment plans for your convenience. Send your payment receipt via WhatsApp to confirm your order.",
    },
    {
      question: "Can I return or exchange shoes?",
      answer:
        "Due to international shipping, we have a strict no-return policy. Please check sizing carefully before ordering.",
    },
    {
      question: "Do you offer size exchanges?",
      answer: "Size exchanges are not facilitated. Make sure to check our size guide before ordering.",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-right" />
      <Header user={user} setUser={setUser} />

      <div className="pt-20 px-4">
        <div className="container mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Have questions about our sneakers or need assistance with your order? We're here to help you every step of
              the way.
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                className="bg-black border border-yellow-400/20 rounded-lg p-6 text-center hover:border-yellow-400/50 transition-all"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-yellow-400 mb-4 flex justify-center">{info.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                <p className="text-yellow-400 font-medium mb-2">{info.content}</p>
                <p className="text-gray-400 text-sm">{info.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Form */}
            <motion.div
              className="bg-black border border-yellow-400/20 rounded-lg p-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-yellow-400">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
                    required
                  >
                    <option value="">Select a subject...</option>
                    {subjectOptions.map((option, index) => (
                      <option key={index} value={option} className="bg-black">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Please provide detailed information about your inquiry..."
                    className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none resize-none"
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-4 rounded-lg font-semibold text-lg hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Send via WhatsApp</span>
                </motion.button>
              </form>
            </motion.div>

            {/* Quick Contact & FAQ */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {/* Quick Contact */}
              <div className="bg-black border border-yellow-400/20 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">Need Immediate Help?</h3>
                <p className="text-gray-300 mb-6">
                  For urgent inquiries or quick questions, reach out to us directly via WhatsApp.
                </p>
                <motion.button
                  onClick={handleWhatsAppContact}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat on WhatsApp</span>
                </motion.button>
              </div>

              {/* Business Hours */}
              <div className="bg-black border border-yellow-400/20 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-xl font-bold text-yellow-400">Business Hours</h3>
                </div>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Monday - Saturday:</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-3">All times are in Sri Lanka Standard Time (UTC+5:30)</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-black border border-yellow-400/20 rounded-lg p-6 hover:border-yellow-400/50 transition-all"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-lg font-semibold mb-3 text-yellow-400">{faq.question}</h4>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Don't hesitate to reach out. Our team is always ready to help you find the perfect pair of sneakers.
            </p>
            <Link href="/shop">
              <motion.button
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:from-yellow-500 hover:to-yellow-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Our Collection
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
