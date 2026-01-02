import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/store/gardens`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      // Return empty array if garden endpoint doesn't exist yet
      return NextResponse.json({ gardens: [] })
    }

    const data = await response.json()
    return NextResponse.json({ gardens: data.gardens || [] })
  } catch (error) {
    console.error("Failed to fetch gardens:", error)
    // Return empty array on error
    return NextResponse.json({ gardens: [] })
  }
}
