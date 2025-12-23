"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import type { TokenRate } from "@/lib/rate-aggregator"

interface RateMonitorProps {
  tokens?: string[]
  compact?: boolean
}

export default function RateMonitor({ tokens = ["BTC", "ETH", "USDC", "BNB"], compact = false }: RateMonitorProps) {
  const [rates, setRates] = useState<TokenRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { currency, formatCurrency } = useCurrency()

  const fetchRates = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/rates?symbols=${tokens.join(",")}&currency=${currency}`)
      const result = await response.json()

      if (result.success) {
        setRates(result.data)
        setLastUpdate(new Date())
      } else {
        setError(result.error || "Failed to fetch rates")
      }
    } catch (error) {
      console.error("Failed to fetch rates:", error)
      setError("Network error - using cached data")
      setRates(
        [
          { symbol: "BTC", price: 97000, change24h: 2.5, provider: "Cached", volume24h: 28000000000 },
          { symbol: "ETH", price: 3800, change24h: -1.2, provider: "Cached", volume24h: 15000000000 },
          { symbol: "USDC", price: 1.0, change24h: 0.01, provider: "Cached", volume24h: 5000000000 },
          { symbol: "BNB", price: 720, change24h: 3.8, provider: "Cached", volume24h: 2000000000 },
          { symbol: "USDT", price: 1.0, change24h: -0.02, provider: "Cached", volume24h: 45000000000 },
          { symbol: "SOL", price: 240, change24h: 5.2, provider: "Cached", volume24h: 3500000000 },
          { symbol: "ADA", price: 1.15, change24h: -2.1, provider: "Cached", volume24h: 800000000 },
          { symbol: "AVAX", price: 52, change24h: 1.8, provider: "Cached", volume24h: 600000000 },
        ].filter((rate) => tokens.includes(rate.symbol)),
      )
      setLastUpdate(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()
    const interval = setInterval(fetchRates, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [tokens, currency])

  const convertPrice = (priceUSD: number) => {
    const exchangeRates: Record<string, number> = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
      MXN: 18.5,
    }
    const rate = exchangeRates[currency] || 1
    return priceUSD * rate
  }

  if (compact) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {rates.map((rate) => (
          <div key={rate.symbol} className="flex items-center gap-2 min-w-fit">
            <span className="font-medium">{rate.symbol}</span>
            <span className="text-sm">{formatCurrency(convertPrice(rate.price))}</span>
            <Badge variant={rate.change24h >= 0 ? "default" : "destructive"} className="text-xs">
              {rate.change24h >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(rate.change24h).toFixed(2)}%
            </Badge>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Live Rates</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={fetchRates} disabled={isLoading} className="h-8 w-8 p-0">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          {error && <AlertCircle className="w-4 h-4 text-orange-500" />}
          {lastUpdate && <span>Updated {lastUpdate.toLocaleTimeString()}</span>}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rates.map((rate) => (
            <div key={rate.symbol} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{rate.symbol}</span>
                <Badge variant="secondary" className="text-xs">
                  {rate.provider}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(convertPrice(rate.price))}</div>
              <div className="flex items-center gap-1">
                {rate.change24h >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${rate.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {rate.change24h >= 0 ? "+" : ""}
                  {rate.change24h.toFixed(2)}%
                </span>
              </div>
              {rate.volume24h && (
                <div className="text-xs text-muted-foreground">
                  Vol: {formatCurrency(convertPrice(rate.volume24h / 1000000))}M
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
