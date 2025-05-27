import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OG Vault - Unlock the Legacy",
  description:
    "Unlock the Legacy - Sealed for Greatness. Step into the future of footwear fashion with our original collection of shoes from top brands.",
  keywords: "shoes, sneakers, footwear, Nike, Adidas, Converse, Vans, fashion, style, premium, online store, OG Vault",
  authors: [{ name: "OG Vault Team" }],
  creator: "OG Vault",
  publisher: "OG Vault",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ogvault.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OG Vault - Unlock the Legacy",
    description: "Unlock the Legacy - Sealed for Greatness. Step into the future of footwear fashion.",
    url: "https://ogvault.vercel.app",
    siteName: "OG Vault",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OG Vault - Unlock the Legacy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OG Vault - Unlock the Legacy",
    description: "Unlock the Legacy - Sealed for Greatness. Step into the future of footwear fashion.",
    images: ["/og-image.jpg"],
    creator: "@ogvault",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
    
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-black text-white">{children}</div>
      </body>
    </html>
  )
}
