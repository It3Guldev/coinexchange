
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Banknote, TrendingDown } from "lucide-react"

interface SellCryptoProps {
  onBack: () => void
}

export default function SellCrypto({ onBack }: SellCryptoProps) {
  const [cryptoAmount, setCryptoAmount] = useState("")
  const [fiatAmount, setFiatAmount] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const cryptoOptions = [
    { value: "BTC", label: "Bitcoin (BTC)", price: 43250, balance: "0.00234" },
    { value: "ETH", label: "Ethereum (ETH)", price: 2650, balance: "1.2456" },
    { value: "USDC", label: "USD Coin (USDC)", price: 1, balance: "500.00" },
    { value: "USDT", label: "Tether (USDT)", price: 1, balance: "250.00" },
    { value: "BNB", label: "BNB (BNB)", price: 315, balance: "0.8934" },
  ]

  const withdrawMethods = [
    { value: "bank", label: "Bank Transfer", fee: "1.0%", time: "1-3 days" },
    { value: "paypal", label: "PayPal", fee: "2.5%", time: "Instant" },
    { value: "card", label: "Debit Card", fee: "3.0%", time: "Instant" },
  ]

  const handleCryptoAmountChange = (value: string) => {
    setCryptoAmount(value)
    if (value && selectedCrypto) {
      const crypto = cryptoOptions.find((c) => c.value === selectedCrypto)
      if (crypto) {
        const fiatValue = (Number.parseFloat(value) * crypto.price).toFixed(2)
        setFiatAmount(fiatValue)
      }
    }
  }

  const handleMaxClick = () => {
    if (selectedCrypto) {
      const crypto = cryptoOptions.find((c) => c.value === selectedCrypto)
      if (crypto) {
        setCryptoAmount(crypto.balance)
        const fiatValue = (Number.parseFloat(crypto.balance) * crypto.price).toFixed(2)
        setFiatAmount(fiatValue)
      }
    }
  }

  const handleSell = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    // This would integrate with actual crypto selling APIs
    alert("Sell order initiated! Funds will be transferred to your selected method.")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold">Sell Cryptocurrency</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Sell Details
          </CardTitle>
          <CardDescription>Convert your crypto to fiat currency at market rates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="crypto-select">Cryptocurrency to Sell</Label>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger>
                <SelectValue placeholder="Select crypto" />
              </SelectTrigger>
              <SelectContent>
                {cryptoOptions.map((crypto) => (
                  <SelectItem key={crypto.value} value={crypto.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{crypto.label}</span>
                      <span className="text-sm text-muted-foreground ml-2">Balance: {crypto.balance}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crypto-amount">Amount to Sell</Label>
              <div className="flex gap-2">
                <Input
                  id="crypto-amount"
                  type="number"
                  placeholder="0.00"
                  value={cryptoAmount}
                  onChange={(e) => handleCryptoAmountChange(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={handleMaxClick}>
                  Max
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiat-amount">You'll Receive (USD)</Label>
              <Input
                id="fiat-amount"
                type="number"
                placeholder="0.00"
                value={fiatAmount}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-method">Withdrawal Method</Label>
            <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select withdrawal method" />
              </SelectTrigger>
              <SelectContent>
                {withdrawMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{method.label}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {method.fee} • {method.time}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {fiatAmount && withdrawMethod && (
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Gross Amount:</span>
                <span>${fiatAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing Fee:</span>
                <span>-${(Number.parseFloat(fiatAmount) * 0.025).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Net Amount:</span>
                <span>${(Number.parseFloat(fiatAmount) * 0.975).toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleSell}
            disabled={!cryptoAmount || !selectedCrypto || !withdrawMethod || isLoading}
            className="w-full gap-2"
            size="lg"
          >
            <Banknote className="w-4 h-4" />
            {isLoading ? "Processing..." : "Sell Now"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
