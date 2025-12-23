import { type NextRequest, NextResponse } from "next/server"
import { rateAggregator } from "@/lib/rate-aggregator"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get("symbols")?.split(",") || []

  try {
    const rates = await rateAggregator.getTokenRates(symbols)
    return NextResponse.json({ success: true, data: rates })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch rates" }, { status: 500 })
  }
}
