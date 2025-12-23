import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Mock authentication - replace with your actual auth logic
    if (email === "demo@coinexchange.cash" && password === "password123") {
      const user = {
        id: "1",
        email: "demo@coinexchange.cash",
        emailVerified: true,
        name: "Demo User",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        authMethod: "email" as const,
      }

      const token = "mock-jwt-token-" + Date.now()

      return NextResponse.json({
        success: true,
        user,
        token,
      })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
