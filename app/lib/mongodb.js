// lib/mongodb.js

import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
const options = {}

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local")
}

// Global cache for development to prevent multiple connections
let client
let clientPromise

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // No global cache in production
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase() {
  try {
    const client = await clientPromise
    const db = client.db("solestyle") // Replace with your DB name
    return { client, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}
