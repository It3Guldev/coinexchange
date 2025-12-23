"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ArrowUpDown, RefreshCw, Settings, Zap } from "lucide-react"
import type { SwapQuote } from "@/lib/rate-aggregator"

interface CryptoSwapProps {
  onBack: () => void
}

interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  logoURI: string
  balance?: string
  price?: number
}

export default function CryptoSwap({ onBack }: CryptoSwapProps) {
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState([0.5])
  const [isLoading, setIsLoading] = useState(false)
  const [routes, setRoutes] = useState<SwapQuote[]>([])
  const [selectedRoute, setSelectedRoute] = useState<SwapQuote | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Mock token list - in real app this would come from token lists
  const tokens: Token[] = [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      logoURI: "/ethereum-abstract.png",
      balance: "2.5",
      price: 2650,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xa0b86a33e6ba3e0c1c5c2b8b0b8b0b8b0b8b0b8b",
      decimals: 6,
      logoURI: "/usdc-coins.png",
      balance: "1000.0",
      price: 1,
    },
    {
      symbol: "USDT",
      name: "Tether",
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      decimals: 6,
      logoURI: "/tethered-balloons.png",
      balance: "500.0",
      price: 1,
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      decimals: 8,
      logoURI: "/bitcoin-concept.png",
      balance: "0.1",
      price: 43250,
    },
    {
      symbol: "UNI",
      name: "Uniswap",
      address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      decimals: 18,
      logoURI: "/uniswap-concept.png",
      balance: "50.0",
      price: 8.5,
    },
  ]

  const fetchSwapRoutes = async () => {
    if (!fromToken || !toToken || !fromAmount) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/swap-quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          amount: fromAmount,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setRoutes(result.data)
        setSelectedRoute(result.data[0]) // Select best route by default
        setToAmount(result.data[0].outputAmount)
      }
    } catch (error) {
      console.error("Failed to fetch swap routes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (fromToken && toToken && fromAmount) {
      const timeoutId = setTimeout(fetchSwapRoutes, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [fromToken, toToken, fromAmount])

  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount("")
  }

  const handleMaxClick = () => {
    if (fromToken?.balance) {
      setFromAmount(fromToken.balance)
    }
  }

  const executeSwap = async () => {
    if (!selectedRoute) return

    setIsLoading(true)
    // Simulate swap execution
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsLoading(false)
    alert(`Swap executed via ${selectedRoute.provider}!`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold">Swap Tokens</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Swap Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Slippage Tolerance: {slippage[0]}%</Label>
              <Slider value={slippage} onValueChange={setSlippage} max={5} min={0.1} step={0.1} className="w-full" />
              <div className="flex gap-2">
                {[0.1, 0.5, 1.0].map((value) => (
                  <Button key={value} variant="outline" size="sm" onClick={() => setSlippage([value])}>
                    {value}%
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Token Swap
          </CardTitle>
          <CardDescription>Get the best rates across 70+ DEXs automatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Token */}
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex gap-2">
              <Select
                value={fromToken?.symbol || ""}
                onValueChange={(value) => {
                  const token = tokens.find((t) => t.symbol === value)
                  setFromToken(token || null)
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <img src={token.logoURI || "/placeholder.svg"} alt={token.symbol} className="w-5 h-5" />
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2"
                  onClick={handleMaxClick}
                >
                  MAX
                </Button>
              </div>
            </div>
            {fromToken && (
              <div className="text-sm text-muted-foreground">
                Balance: {fromToken.balance} {fromToken.symbol}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={handleSwapTokens} className="rounded-full p-2 bg-transparent">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex gap-2">
              <Select
                value={toToken?.symbol || ""}
                onValueChange={(value) => {
                  const token = tokens.find((t) => t.symbol === value)
                  setToToken(token || null)
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <img src={token.logoURI || "/placeholder.svg"} alt={token.symbol} className="w-5 h-5" />
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="0.0" value={toAmount} readOnly className="flex-1 bg-muted" />
            </div>
          </div>

          {/* Route Information */}
          {routes.length > 0 && (
            <div className="space-y-3">
              <Label>Best Routes</Label>
              {routes.map((route, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-colors ${selectedRoute === route ? "ring-2 ring-primary" : ""}`}
                  onClick={() => {
                    setSelectedRoute(route)
                    setToAmount(route.outputAmount)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{route.provider}</Badge>
                        {index === 0 && (
                          <Badge variant="default" className="gap-1">
                            <Zap className="w-3 h-3" />
                            Best
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {route.outputAmount} {toToken?.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">Gas: {route.gasEstimate}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                      <div>Route: {route.route.join(" → ")}</div>
                      <div>Impact: {route.priceImpact}%</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Swap Summary */}
          {selectedRoute && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rate:</span>
                <span>
                  1 {fromToken?.symbol} = {(Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)).toFixed(4)}{" "}
                  {toToken?.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Price Impact:</span>
                <span className={selectedRoute.priceImpact > 1 ? "text-red-500" : "text-green-500"}>
                  {selectedRoute.priceImpact}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Gas Fee:</span>
                <span>{selectedRoute.gasEstimate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Slippage:</span>
                <span>{slippage[0]}%</span>
              </div>
            </div>
          )}

          <Button
            onClick={executeSwap}
            disabled={!selectedRoute || isLoading || !fromAmount}
            className="w-full gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {routes.length === 0 ? "Finding Best Route..." : "Executing Swap..."}
              </>
            ) : (
              <>
                <ArrowUpDown className="w-4 h-4" />
                Swap via {selectedRoute?.provider || "DEX"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
