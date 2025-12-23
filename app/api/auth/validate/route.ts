import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Mock token validation - replace with your actual validation logic
    if (token.startsWith("mock-jwt-token-")) {
      const user = {
        id: "1",
        email: "demo@coinexchange.cash",
        emailVerified: true, // Always true in demo mode
        name: "Demo User",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        authMethod: "email" as const,
      }

      return NextResponse.json(user)
    }

    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
