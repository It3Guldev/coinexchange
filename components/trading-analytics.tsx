"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ArrowUpDown, DollarSign, Clock, Target } from "lucide-react"

interface TradeRecord {
  id: string
  type: "buy" | "sell" | "swap"
  fromAsset: string
  toAsset?: string
  amount: number
  price: number
  value: number
  fee: number
  timestamp: Date
  status: "completed" | "pending" | "failed"
}

export default function TradingAnalytics() {
  const recentTrades: TradeRecord[] = [
    {
      id: "1",
      type: "swap",
      fromAsset: "ETH",
      toAsset: "USDC",
      amount: 0.5,
      price: 2651.2,
      value: 1325.6,
      fee: 3.98,
      timestamp: new Date(Date.now() - 3600000),
      status: "completed",
    },
    {
      id: "2",
      type: "buy",
      fromAsset: "BTC",
      amount: 0.02,
      price: 43250.75,
      value: 865.02,
      fee: 30.28,
      timestamp: new Date(Date.now() - 7200000),
      status: "completed",
    },
    {
      id: "3",
      type: "sell",
      fromAsset: "UNI",
      amount: 50,
      price: 8.5,
      value: 425.0,
      fee: 4.25,
      timestamp: new Date(Date.now() - 10800000),
      status: "completed",
    },
  ]

  const totalTrades = recentTrades.length
  const totalVolume = recentTrades.reduce((sum, trade) => sum + trade.value, 0)
  const totalFees = recentTrades.reduce((sum, trade) => sum + trade.fee, 0)
  const avgTradeSize = totalVolume / totalTrades

  const getTradeIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "sell":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case "swap":
        return <ArrowUpDown className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="text-xs">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="text-xs">
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="text-xs">
            Failed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Trading Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trade Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgTradeSize.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">-2.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Paid</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Saved $89.42 with best rates</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trading Activity</CardTitle>
          <CardDescription>Your latest trades and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTradeIcon(trade.type)}
                  <div>
                    <div className="font-medium capitalize">
                      {trade.type} {trade.fromAsset}
                      {trade.toAsset && ` → ${trade.toAsset}`}
                    </div>
                    <div className="text-sm text-muted-foreground">{trade.timestamp.toLocaleString()}</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-medium">
                    {trade.amount} {trade.fromAsset}
                  </div>
                  <div className="text-sm text-muted-foreground">@ ${trade.price.toLocaleString()}</div>
                </div>

                <div className="text-center">
                  <div className="font-medium">${trade.value.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Fee: ${trade.fee.toFixed(2)}</div>
                </div>

                <div className="text-right">{getStatusBadge(trade.status)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
