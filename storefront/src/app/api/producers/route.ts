import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = new URLSearchParams()

    // Forward query params
    if (searchParams.has("limit")) params.set("limit", searchParams.get("limit")!)
    if (searchParams.has("offset")) params.set("offset", searchParams.get("offset")!)
    if (searchParams.has("featured")) params.set("featured", searchParams.get("featured")!)
    if (searchParams.has("region")) params.set("region", searchParams.get("region")!)
    if (searchParams.has("search")) params.set("search", searchParams.get("search")!)

    const response = await fetch(`${BACKEND_URL}/store/producers?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { producers: [], count: 0, message: "Could not fetch producers" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching producers:", error)
    return NextResponse.json(
      { producers: [], count: 0, message: "Internal error" },
      { status: 500 }
    )
  }
}
