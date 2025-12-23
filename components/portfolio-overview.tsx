"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Eye, EyeOff, PieChart, BarChart3 } from "lucide-react"

interface PortfolioAsset {
  symbol: string
  name: string
  balance: number
  value: number
  price: number
  change24h: number
  allocation: number
}

interface PortfolioOverviewProps {
  onAssetClick?: (symbol: string) => void
}

export default function PortfolioOverview({ onAssetClick }: PortfolioOverviewProps) {
  const [showBalances, setShowBalances] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "chart">("list")

  const portfolioAssets: PortfolioAsset[] = [
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: 2.5,
      value: 6627.5,
      price: 2651.2,
      change24h: -1.45,
      allocation: 45.2,
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      balance: 0.1,
      value: 4325.0,
      price: 43250.75,
      change24h: 2.34,
      allocation: 29.5,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: 2000.0,
      value: 2000.2,
      price: 1.0001,
      change24h: 0.01,
      allocation: 13.6,
    },
    {
      symbol: "UNI",
      name: "Uniswap",
      balance: 100.0,
      value: 850.0,
      price: 8.5,
      change24h: 5.23,
      allocation: 5.8,
    },
    {
      symbol: "BNB",
      name: "BNB",
      balance: 2.8,
      value: 883.26,
      price: 315.45,
      change24h: 3.21,
      allocation: 6.0,
    },
  ]

  const totalValue = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0)
  const totalChange24h = portfolioAssets.reduce((sum, asset) => sum + (asset.value * asset.change24h) / 100, 0)
  const totalChangePercent = (totalChange24h / totalValue) * 100

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Portfolio Overview</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBalances(!showBalances)}>
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "list" ? "chart" : "list")}>
              {viewMode === "list" ? <PieChart className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{showBalances ? `$${totalValue.toLocaleString()}` : "••••••"}</div>
                <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
              </div>
              <div className="text-right">
                <div
                  className={`flex items-center gap-1 ${totalChangePercent >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {totalChangePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-medium">
                    {totalChangePercent >= 0 ? "+" : ""}
                    {totalChangePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {showBalances ? `$${Math.abs(totalChange24h).toFixed(2)}` : "••••"} 24h
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{showBalances ? portfolioAssets.length : "•"}</div>
                <div className="text-sm text-muted-foreground">Assets</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-500">{showBalances ? "$1,247.83" : "••••••"}</div>
                <div className="text-sm text-muted-foreground">24h Gains</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-500">{showBalances ? "$89.42" : "••••"}</div>
                <div className="text-sm text-muted-foreground">Fees Saved</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assets</CardTitle>
          <CardDescription>Click on any asset to view details or trade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioAssets.map((asset) => (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onAssetClick?.(asset.symbol)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className="font-medium">{showBalances ? `${asset.balance} ${asset.symbol}` : "••••••"}</div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Value</div>
                  <div className="font-medium">{showBalances ? `$${asset.value.toLocaleString()}` : "••••••"}</div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-muted-foreground">24h Change</div>
                  <div className={`font-medium ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {asset.change24h >= 0 ? "+" : ""}
                    {asset.change24h.toFixed(2)}%
                  </div>
                </div>

                <div className="text-right min-w-[80px]">
                  <div className="text-sm text-muted-foreground">Allocation</div>
                  <div className="space-y-1">
                    <div className="font-medium">{asset.allocation}%</div>
                    <Progress value={asset.allocation} className="h-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
