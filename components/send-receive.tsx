"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Download, Copy, QrCode, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface SendReceiveProps {
  onBack: () => void
}

interface Transaction {
  id: string
  type: "send" | "receive"
  amount: string
  token: string
  address: string
  status: "pending" | "confirmed" | "failed"
  timestamp: Date
  txHash?: string
}

export default function SendReceive({ onBack }: SendReceiveProps) {
  const [activeTab, setActiveTab] = useState("send")
  const [sendAmount, setSendAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [selectedToken, setSelectedToken] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const walletAddress = "0x1234567890abcdef1234567890abcdef12345678"

  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "2.5", networks: ["ethereum", "arbitrum", "optimism", "polygon"] },
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: "1000.0",
      networks: ["ethereum", "polygon", "bsc", "arbitrum", "optimism"],
    },
    { symbol: "USDT", name: "Tether", balance: "500.0", networks: ["ethereum", "polygon", "bsc", "arbitrum"] },
    { symbol: "BTC", name: "Bitcoin", balance: "0.1", networks: ["bitcoin"] },
    { symbol: "BNB", name: "BNB", balance: "5.0", networks: ["bsc"] },
  ]

  const allNetworks = [
    { id: "ethereum", name: "Ethereum", symbol: "ETH", fee: "$12.50", popularity: 1 },
    { id: "bsc", name: "BSC", symbol: "BNB", fee: "$0.20", popularity: 2 },
    { id: "polygon", name: "Polygon", symbol: "MATIC", fee: "$0.01", popularity: 3 },
    { id: "arbitrum", name: "Arbitrum", symbol: "ETH", fee: "$1.50", popularity: 4 },
    { id: "optimism", name: "Optimism", symbol: "ETH", fee: "$2.00", popularity: 5 },
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", fee: "$3.00", popularity: 6 },
  ]

  const availableNetworks = selectedToken
    ? allNetworks
        .filter((network) => {
          const token = tokens.find((t) => t.symbol === selectedToken)
          return token?.networks.includes(network.id)
        })
        .sort((a, b) => a.popularity - b.popularity)
    : allNetworks.sort((a, b) => a.popularity - b.popularity)

  const validateAddress = (address: string, tokenSymbol?: string, networkId?: string) => {
    if (!address) return false

    const token = tokenSymbol || selectedToken
    const network = networkId || selectedNetwork

    // Remove whitespace
    const cleanAddress = address.trim()

    switch (token) {
      case "BTC":
        // Bitcoin address validation
        // Legacy addresses (1...)
        if (/^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(cleanAddress)) return true
        // P2SH addresses (3...)
        if (/^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(cleanAddress)) return true
        // Bech32 addresses (bc1...)
        if (/^bc1[a-z0-9]{39,59}$/.test(cleanAddress)) return true
        // Testnet addresses
        if (/^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(cleanAddress)) return true
        if (/^tb1[a-z0-9]{39,59}$/.test(cleanAddress)) return true
        return false

      case "ETH":
      case "USDC":
      case "USDT":
        // Ethereum-based tokens
        if (network === "bitcoin") return false // These tokens don't exist on Bitcoin
        // Ethereum address validation (0x followed by 40 hex characters)
        return /^0x[a-fA-F0-9]{40}$/.test(cleanAddress)

      case "BNB":
        if (network === "bsc") {
          // BSC uses Ethereum-style addresses
          return /^0x[a-fA-F0-9]{40}$/.test(cleanAddress)
        }
        // Native BNB Chain addresses (bnb...)
        if (/^bnb[a-z0-9]{39}$/.test(cleanAddress)) return true
        return false

      default:
        // Generic validation for unknown tokens
        // Ethereum-style addresses
        if (/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) return true
        // Bitcoin-style addresses
        if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(cleanAddress)) return true
        if (/^bc1[a-z0-9]{39,59}$/.test(cleanAddress)) return true
        return false
    }
  }

  const handleSend = async () => {
    if (!sendAmount || !recipientAddress || !selectedToken || !selectedNetwork) return

    setIsLoading(true)
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsLoading(false)
    alert("Transaction submitted! Check your wallet for confirmation.")
    setSendAmount("")
    setRecipientAddress("")
  }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const handleTokenChange = (tokenSymbol: string) => {
    setSelectedToken(tokenSymbol)

    // Reset network if current selection is not supported by the new token
    if (selectedNetwork) {
      const token = tokens.find((t) => t.symbol === tokenSymbol)
      if (token && !token.networks.includes(selectedNetwork)) {
        setSelectedNetwork("")
      }
    }
  }

  const transactions: Transaction[] = [
    {
      id: "1",
      type: "send",
      amount: "0.5",
      token: "ETH",
      address: "0xabcd...5678",
      status: "confirmed",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      txHash: "0x123...abc",
    },
    {
      id: "2",
      type: "receive",
      amount: "100.0",
      token: "USDC",
      address: "0x9876...4321",
      status: "confirmed",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      txHash: "0x456...def",
    },
    {
      id: "3",
      type: "send",
      amount: "0.1",
      token: "BTC",
      address: "bc1q...xyz",
      status: "pending",
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      txHash: "0x789...ghi",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold">Send & Receive</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="receive">Receive</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Cryptocurrency
              </CardTitle>
              <CardDescription>Transfer crypto to any address across multiple networks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Token</Label>
                  <Select value={selectedToken} onValueChange={handleTokenChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center justify-between w-full">
                            <span>
                              {token.symbol} - {token.name}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">Balance: {token.balance}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Network</Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedToken ? "Select network" : "Select token first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNetworks.map((network) => (
                        <SelectItem key={network.id} value={network.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{network.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">Fee: {network.fee}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedToken && availableNetworks.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {availableNetworks.length} network{availableNetworks.length !== 1 ? "s" : ""} available for{" "}
                      {selectedToken}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recipient Address</Label>
                <Input
                  placeholder={
                    selectedToken === "BTC"
                      ? "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa or bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                      : selectedToken === "BNB" && selectedNetwork === "bsc"
                        ? "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
                        : "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
                  }
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className={recipientAddress && !validateAddress(recipientAddress) ? "border-red-500" : ""}
                />
                {recipientAddress && !validateAddress(recipientAddress) && (
                  <p className="text-sm text-red-500">
                    Invalid {selectedToken || "address"} address format
                    {selectedToken === "BTC" && " (use 1..., 3..., or bc1... format)"}
                    {(selectedToken === "ETH" || selectedToken === "USDC" || selectedToken === "USDT") &&
                      " (use 0x... format)"}
                    {selectedToken === "BNB" && selectedNetwork === "bsc" && " (use 0x... format for BSC)"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const token = tokens.find((t) => t.symbol === selectedToken)
                      if (token) setSendAmount(token.balance)
                    }}
                  >
                    Max
                  </Button>
                </div>
              </div>

              {sendAmount && selectedToken && selectedNetwork && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Amount:</span>
                    <span>
                      {sendAmount} {selectedToken}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Network Fee:</span>
                    <span>{allNetworks.find((n) => n.id === selectedNetwork)?.fee}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total Cost:</span>
                    <span>
                      {sendAmount} {selectedToken} + Fee
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSend}
                disabled={
                  !sendAmount ||
                  !recipientAddress ||
                  !selectedToken ||
                  !selectedNetwork ||
                  !validateAddress(recipientAddress) ||
                  isLoading
                }
                className="w-full gap-2"
                size="lg"
              >
                <Send className="w-4 h-4" />
                {isLoading ? "Sending..." : "Send Transaction"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receive" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Receive Address
                </CardTitle>
                <CardDescription>Share this address to receive cryptocurrency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Wallet Address</Label>
                  <div className="flex gap-2">
                    <Input value={walletAddress} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="sm" onClick={copyAddress}>
                      {copiedAddress ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  {copiedAddress && <p className="text-sm text-green-600">Address copied to clipboard!</p>}
                </div>

                <div className="space-y-2">
                  <Label>Supported Networks</Label>
                  <div className="flex flex-wrap gap-2">
                    {allNetworks
                      .sort((a, b) => a.popularity - b.popularity)
                      .map((network) => (
                        <Badge key={network.id} variant="secondary">
                          {network.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code
                </CardTitle>
                <CardDescription>Scan to send crypto to this address</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeSVG value={walletAddress} size={200} />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scan this QR code with any crypto wallet to send funds
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent send and receive transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {tx.type === "send" ? (
                          <Send className="w-4 h-4 text-red-500" />
                        ) : (
                          <Download className="w-4 h-4 text-green-500" />
                        )}
                        {getStatusIcon(tx.status)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {tx.type === "send" ? "Sent" : "Received"} {tx.amount} {tx.token}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tx.type === "send" ? "To" : "From"}: {tx.address}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium capitalize">{tx.status}</div>
                      <div className="text-sm text-muted-foreground">
                        {tx.timestamp ? tx.timestamp.toLocaleTimeString() : "Unknown time"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
