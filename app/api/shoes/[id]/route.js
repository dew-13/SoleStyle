import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid shoe ID" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const shoe = await db.collection("shoes").findOne({ _id: new ObjectId(id) });

    if (!shoe) {
      return NextResponse.json({ message: "Shoe not found" }, { status: 404 });
    }

    return NextResponse.json(shoe);
  } catch (error) {
    console.error("Error fetching shoe:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
