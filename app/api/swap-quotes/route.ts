import { type NextRequest, NextResponse } from "next/server"
import { rateAggregator } from "@/lib/rate-aggregator"

export async function POST(request: NextRequest) {
  try {
    const { fromToken, toToken, amount } = await request.json()

    if (!fromToken || !toToken || !amount) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    const quotes = await rateAggregator.getSwapQuotes(fromToken, toToken, amount)
    return NextResponse.json({ success: true, data: quotes })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch swap quotes" }, { status: 500 })
  }
}
