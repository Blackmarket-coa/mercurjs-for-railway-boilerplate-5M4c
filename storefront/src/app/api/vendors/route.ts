import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

/**
 * GET /api/vendors
 *
 * Proxy route to the backend /store/vendors unified vendor listing.
 * Forwards all query parameters for filtering and distance search.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = new URLSearchParams()

    // Forward all supported query params
    const forwardParams = [
      "vendor_type",
      "search",
      "featured",
      "lat",
      "lng",
      "zip",
      "radius_miles",
      "has_photo",
      "sort",
      "limit",
      "offset",
    ]

    for (const param of forwardParams) {
      if (searchParams.has(param)) {
        params.set(param, searchParams.get(param)!)
      }
    }

    const response = await fetch(`${BACKEND_URL}/store/vendors?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { vendors: [], count: 0, message: "Could not fetch vendors" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching vendors:", error)
    return NextResponse.json(
      { vendors: [], count: 0, message: "Internal error" },
      { status: 500 }
    )
  }
}
