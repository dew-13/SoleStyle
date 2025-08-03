"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"

function ResetPasswordFormComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const tokenFromParams = searchParams.get("token")
    if (tokenFromParams) {
      setToken(tokenFromParams)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (!token) {
      toast.error("Invalid or missing reset token")
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setTimeout(() => router.push("/auth/login"), 2000)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      toast.error("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Toaster position="top-right" />
      <div className="w-full max-w-md p-8 space-y-8 bg-black border border-yellow-400/20 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-yellow-400">Reset Your Password</h1>
          <p className="text-gray-400">Enter your new password below.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 mt-1 text-white bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 mt-1 text-white bg-black border border-yellow-400/20 rounded-lg focus:border-yellow-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordFormComponent />
    </Suspense>
  )
}
