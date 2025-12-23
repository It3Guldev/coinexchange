import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Mock registration - replace with your actual registration logic
    // In a real app, you would:
    // 1. Validate input
    // 2. Check if user already exists
    // 3. Hash password
    // 4. Save to database
    // 5. Send verification email

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Mock successful registration
    return NextResponse.json({
      success: true,
      message: "Demo account created successfully! (No email verification required in demo mode)",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
