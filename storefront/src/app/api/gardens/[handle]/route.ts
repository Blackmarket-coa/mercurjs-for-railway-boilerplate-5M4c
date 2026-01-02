import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params

  try {
    const response = await fetch(`${BACKEND_URL}/store/gardens/${handle}`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Garden not found" },
        { status: 404 }
      )
    }

    const data = await response.json()
    return NextResponse.json({ garden: data.garden })
  } catch (error) {
    console.error("Failed to fetch garden:", error)
    return NextResponse.json(
      { error: "Failed to fetch garden" },
      { status: 500 }
    )
  }
}
