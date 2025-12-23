"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CreditCard, DollarSign, RefreshCw } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"

interface BuyCryptoProps {
  onBack: () => void
}

interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
}

export default function BuyCrypto({ onBack }: BuyCryptoProps) {
  const [fiatAmount, setFiatAmount] = useState("")
  const [cryptoAmount, setCryptoAmount] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({})
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})
  const [priceLoading, setPriceLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { currency, formatCurrency } = useCurrency()

  const cryptoOptions = [
    { value: "bitcoin", symbol: "BTC", label: "Bitcoin (BTC)" },
    { value: "ethereum", symbol: "ETH", label: "Ethereum (ETH)" },
    { value: "usd-coin", symbol: "USDC", label: "USD Coin (USDC)" },
    { value: "tether", symbol: "USDT", label: "Tether (USDT)" },
    { value: "binancecoin", symbol: "BNB", label: "BNB (BNB)" },
    { value: "solana", symbol: "SOL", label: "Solana (SOL)" },
    { value: "cardano", symbol: "ADA", label: "Cardano (ADA)" },
    { value: "avalanche-2", symbol: "AVAX", label: "Avalanche (AVAX)" },
  ]

  const paymentMethods = [
    { value: "card", label: "Credit/Debit Card", fee: 0.0349, feeText: "3.49%" },
    { value: "bank", label: "Bank Transfer", fee: 0.005, feeText: "0.50%" },
    { value: "apple", label: "Apple Pay", fee: 0.0299, feeText: "2.99%" },
    { value: "google", label: "Google Pay", fee: 0.0299, feeText: "2.99%" },
    { value: "sepa", label: "SEPA Transfer", fee: 0.0015, feeText: "0.15%" },
    { value: "wire", label: "Wire Transfer", fee: 0.01, feeText: "1.00%" },
  ]

  const fetchPrices = async () => {
    setPriceLoading(true)
    try {
      // Fetch crypto prices from CoinGecko
      const cryptoIds = cryptoOptions.map((c) => c.value).join(",")
      const cryptoResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd`,
      )
      const cryptoData = await cryptoResponse.json()

      const prices: Record<string, number> = {}
      Object.entries(cryptoData).forEach(([id, data]: [string, any]) => {
        prices[id] = data.usd
      })
      setCryptoPrices(prices)

      // Fetch exchange rates
      const ratesResponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
      const ratesData = await ratesResponse.json()
      setExchangeRates(ratesData.rates)

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch prices:", error)
      setCryptoPrices({
        bitcoin: 97000,
        ethereum: 3800,
        "usd-coin": 1,
        tether: 1,
        binancecoin: 720,
        solana: 240,
        cardano: 1.15,
        "avalanche-2": 52,
      })
      setExchangeRates({
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        CNY: 6.45,
        MXN: 18.5,
      })
    }
    setPriceLoading(false)
  }

  useEffect(() => {
    fetchPrices()
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const getCryptoPriceInUserCurrency = (cryptoId: string) => {
    const priceUSD = cryptoPrices[cryptoId] || 0
    const rate = exchangeRates[currency] || 1
    return priceUSD * rate
  }

  const handleFiatAmountChange = (value: string) => {
    setFiatAmount(value)
    if (value && selectedCrypto && cryptoPrices[selectedCrypto]) {
      const priceInUserCurrency = getCryptoPriceInUserCurrency(selectedCrypto)
      const cryptoValue = (Number.parseFloat(value) / priceInUserCurrency).toFixed(8)
      setCryptoAmount(cryptoValue)
    }
  }

  useEffect(() => {
    if (fiatAmount && selectedCrypto) {
      handleFiatAmountChange(fiatAmount)
    }
  }, [currency, selectedCrypto, cryptoPrices, exchangeRates])

  const handleBuy = async () => {
    if (!fiatAmount || !selectedCrypto || !paymentMethod) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      const purchaseData = {
        amount: fiatAmount,
        crypto: selectedCrypto,
        cryptoAmount: cryptoAmount,
        paymentMethod: paymentMethod,
        total: getTotal(),
        currency: currency,
        timestamp: new Date().toISOString(),
      }

      // Simulate API call to payment processor
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const confirmed = confirm(
        `Purchase Summary:\n` +
          `Amount: ${formatCurrency(Number.parseFloat(fiatAmount))}\n` +
          `Crypto: ${cryptoAmount} ${cryptoOptions.find((c) => c.value === selectedCrypto)?.symbol}\n` +
          `Payment Method: ${paymentMethods.find((m) => m.value === paymentMethod)?.label}\n` +
          `Total: ${formatCurrency(getTotal())}\n\n` +
          `Proceed with purchase?`,
      )

      if (confirmed) {
        alert(
          `Purchase successful! Transaction ID: TX${Date.now()}\n\nYour ${cryptoOptions.find((c) => c.value === selectedCrypto)?.symbol} will be delivered to your wallet within 10 minutes.`,
        )

        // Reset form
        setFiatAmount("")
        setCryptoAmount("")
        setSelectedCrypto("")
        setPaymentMethod("")
      }
    } catch (error) {
      alert("Purchase failed. Please try again or contact support.")
    } finally {
      setIsLoading(false)
    }
  }

  const getProcessingFee = () => {
    if (!fiatAmount || !paymentMethod) return 0
    const method = paymentMethods.find((m) => m.value === paymentMethod)
    return Number.parseFloat(fiatAmount) * (method?.fee || 0.035)
  }

  const getTotal = () => {
    if (!fiatAmount) return 0
    return Number.parseFloat(fiatAmount) + getProcessingFee()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold">Buy Cryptocurrency</h2>
        <Button variant="ghost" size="sm" onClick={fetchPrices} disabled={priceLoading}>
          <RefreshCw className={`w-4 h-4 ${priceLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {lastUpdated && (
        <div className="text-sm text-muted-foreground text-center">
          Prices last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Purchase Details
          </CardTitle>
          <CardDescription>Buy crypto with real-time market prices and competitive fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fiat-amount">Amount ({currency})</Label>
              <Input
                id="fiat-amount"
                type="number"
                placeholder="100.00"
                value={fiatAmount}
                onChange={(e) => handleFiatAmountChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crypto-select">Cryptocurrency</Label>
              <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crypto" />
                </SelectTrigger>
                <SelectContent>
                  {cryptoOptions.map((crypto) => {
                    const priceInUserCurrency = getCryptoPriceInUserCurrency(crypto.value)
                    return (
                      <SelectItem key={crypto.value} value={crypto.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{crypto.label}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {priceLoading ? "Loading..." : formatCurrency(priceInUserCurrency)}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {cryptoAmount && selectedCrypto && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">You will receive</div>
              <div className="text-2xl font-bold">
                {cryptoAmount} {cryptoOptions.find((c) => c.value === selectedCrypto)?.symbol}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{method.label}</span>
                      <span className="text-sm text-muted-foreground ml-2">Fee: {method.feeText}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {fiatAmount && paymentMethod && (
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(Number.parseFloat(fiatAmount))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing Fee:</span>
                <span>{formatCurrency(getProcessingFee())}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleBuy}
            disabled={!fiatAmount || !selectedCrypto || !paymentMethod || isLoading || priceLoading}
            className="w-full gap-2"
            size="lg"
          >
            <CreditCard className="w-4 h-4" />
            {isLoading ? "Processing..." : priceLoading ? "Loading Prices..." : "Buy Now"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
