"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Send } from "lucide-react"
import {
  RefreshCw,
  ArrowLeft,
  Shield,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  MessageCircle,
} from "lucide-react"
import { useP2P, type P2PListing, type P2PTrade, type TradeMessage } from "@/contexts/p2p-context"
import { useCurrency } from "@/contexts/currency-context"
import { createEscrow } from "@/services/trade-service"

interface P2PMarketplaceProps {
  onBack: () => void
}

export default function P2PMarketplace({ onBack }: P2PMarketplaceProps) {
  const {
    listings,
    myListings,
    myTrades,
    isLoading,
    createListing,
    updateListing,
    deleteListing,
    initiateTrade,
    searchListings,
    sendTradeMessage,
    refreshTrades,
    updateTradeStatus,
  } = useP2P()

  const { currency, convertPrice, formatPrice } = useCurrency()

  const [activeTab, setActiveTab] = useState("browse")
  const [showCreateListing, setShowCreateListing] = useState(false)
  const [selectedListing, setSelectedListing] = useState<P2PListing | null>(null)
  const [searchFilters, setSearchFilters] = useState({
    type: "",
    cryptocurrency: "",
    fiatCurrency: "",
    minTrustScore: "",
    paymentMethod: "",
  })

  // Create listing form state
  const [newListing, setNewListing] = useState({
    type: "sell" as "buy" | "sell",
    cryptocurrency: "",
    fiatCurrency: currency,
    amount: "",
    price: "",
    minOrder: "",
    maxOrder: "",
    paymentMethods: [] as string[],
    description: "",
    terms: "",
    displayMode: "crypto" as "crypto" | "fiat", // Track how amounts were entered
  })

  const [message, setMessage] = useState("")
  const [displayMode, setDisplayMode] = useState<"crypto" | "fiat">("crypto")
  const [selectedTrade, setSelectedTrade] = useState<P2PTrade | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [address, setAddress] = useState("") // Assuming address state is needed for escrow creation

  const handleCreateListing = async () => {
    if (!newListing.cryptocurrency || !newListing.amount || !newListing.price) {
      setMessage("Please fill in all required fields")
      return
    }

    let finalAmount = Number.parseFloat(newListing.amount)
    let finalMinOrder = Number.parseFloat(newListing.minOrder) || 0
    let finalMaxOrder = Number.parseFloat(newListing.maxOrder) || finalAmount

    // If amounts were entered in fiat, convert to crypto
    if (displayMode === "fiat") {
      const price = Number.parseFloat(newListing.price)
      finalAmount = finalAmount / price
      finalMinOrder = finalMinOrder / price
      finalMaxOrder = finalMaxOrder / price
    }

    const result = await createListing({
      type: newListing.type,
      cryptocurrency: newListing.cryptocurrency,
      fiatCurrency: newListing.fiatCurrency,
      amount: finalAmount,
      price: Number.parseFloat(newListing.price),
      minOrder: finalMinOrder,
      maxOrder: finalMaxOrder,
      paymentMethods: newListing.paymentMethods,
      description: newListing.description,
      terms: newListing.terms,
      status: "active"
    })

    if (result.success) {
      setMessage("Listing created successfully!")
      setShowCreateListing(false)
      setNewListing({
        type: "sell",
        cryptocurrency: "",
        fiatCurrency: currency,
        amount: "",
        price: "",
        minOrder: "",
        maxOrder: "",
        paymentMethods: [],
        description: "",
        terms: "",
        displayMode: "crypto",
      })
      setDisplayMode("crypto")
      setTimeout(() => setMessage(""), 3000)
    } else {
      setMessage(result.error || "Failed to create listing")
    }
  }

  const handleInitiateTrade = async (listing: P2PListing, amount: number, paymentMethod: string) => {
    const result = await initiateTrade(listing.id, amount, paymentMethod)
    
    if (!result.success) {
      setMessage(result.error || "Failed to initiate trade")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    if (!result.tradeId) {
      setMessage("Error: Trade ID was not returned from the server")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    const escrowResult = await createEscrow({
      tradeId: result.tradeId,
      amount: amount,
      buyerAddress: address || localStorage.getItem("defaultReceivingAddress") || "",
      sellerAddress: listing.sellerAddress || "",
      cryptoType: listing.cryptocurrency,
    })

    if (escrowResult.success) {
      setMessage("Trade initiated successfully! Escrow contract created.")
      setSelectedListing(null)
      setActiveTab("trades")
    } else {
      setMessage(escrowResult.error || "Failed to create escrow contract")
    }
    
    setTimeout(() => setMessage(""), 3000)
  }

  const handleSendMessage = async (tradeId: string, message: string) => {
    if (!message.trim()) return

    const result = await sendTradeMessage(tradeId, message.trim())

    if (result.success) {
      setNewMessage("")

      if (selectedTrade && selectedTrade.id === tradeId) {
        const newMessageObj: TradeMessage = {
          id: Date.now().toString(),
          tradeId,
          userId: "current-user",
          message: message.trim(),
          timestamp: new Date().toISOString(),
          type: "message",
          senderId: "current-user",
          senderName: "You",
          read: false
        }

        const updatedTrade = {
          ...selectedTrade,
          messages: [...selectedTrade.messages, newMessageObj],
        }

        setSelectedTrade(updatedTrade)
      }

      // Refresh trades data in background
      await refreshTrades()

      toast({
        title: "Message sent",
        description: "Your message has been sent to the other party.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const handleRefreshMessages = () => {
    refreshTrades()
    toast({
      title: "Messages refreshed",
      description: "Checking for new messages...",
    })
  }

  const handleMarkEscrowPaid = async (tradeId: string) => {
    const trade = myTrades.find((t) => t.id === tradeId)
    if (!trade) return

    // Get the associated listing to access cryptocurrency info
    const listing = listings.find((l) => l.id === trade.listingId)
    if (!listing) {
      toast({
        title: "Error",
        description: "Could not find the associated listing for this trade.",
        variant: "destructive",
      })
      return
    }

    // Check if escrowAddress is defined
    if (!trade.escrowAddress) {
      toast({
        title: "Error",
        description: "Escrow address is not available for this trade.",
        variant: "destructive",
      })
      return
    }

    // Simulate blockchain verification of exact amount with 1 confirmation
    const requiredAmount = trade.escrowAmount
    const receivedAmount = await simulateBlockchainCheck(trade.escrowAddress)

    if (Math.abs(receivedAmount - requiredAmount) > 0.00000001) {
      // Amount doesn't match exactly - refund and cancel
      const result = await updateTradeStatus(tradeId, "incorrect_escrow" as const)
      if (result.success) {
        toast({
          title: "Incorrect Escrow Amount",
          description: `Expected ${requiredAmount} ${listing.cryptocurrency}, received ${receivedAmount}. Trade cancelled and escrow refunded.`,
          variant: "destructive",
        })
        await refreshTrades()
      }
      return
    }

    // Automatically confirm after 1 blockchain confirmation
    const result = await updateTradeStatus(tradeId, "escrow_paid" as const)
    if (result.success) {
      toast({
        title: "Escrow Payment Confirmed",
        description: "Payment confirmed with 1 blockchain confirmation. Buyer can now make fiat payment.",
      })
      await refreshTrades()
    }
  }

  const handleCancelTrade = async (tradeId: string) => {
    console.log("handleCancelTrade called with tradeId:", tradeId)

    const trade = myTrades.find((t) => t.id === tradeId)
    if (!trade) {
      console.error("Trade not found:", tradeId)
      toast({
        title: "Error",
        description: "Trade not found",
        variant: "destructive",
      })
      return
    }

    console.log("Current trade status:", trade.status)
    console.log("Cancellation requested by:", trade.cancellationRequestedBy)

    try {
      if (trade.status === "cancellation_requested") {
        // Check if current user requested the cancellation
        const currentUserRequested = trade.cancellationRequestedBy === "current-user"

        if (currentUserRequested) {
          // Cancel own cancellation request
          console.log("Cancelling own cancellation request")
          const result = await updateTradeStatus(tradeId, "escrow_paid" as const)
          console.log("Cancel cancellation result:", result)

          if (result.success) {
            toast({
              title: "Cancellation Request Cancelled",
              description: "Your cancellation request has been cancelled. Trade continues.",
            })
            setSelectedTrade((prev) =>
              prev ? { ...prev, status: "escrow_paid", cancellationRequestedBy: undefined } : null,
            )
            await refreshTrades()
          } else {
            toast({
              title: "Error",
              description: result.error || "Failed to cancel cancellation request",
              variant: "destructive",
            })
          }
        } else {
          // This user is responding to a cancellation request
          console.log("Responding to cancellation request")
          const accept = window.confirm(
            "The other party has requested to cancel this trade. Do you accept the cancellation?",
          )

          if (accept) {
            // Accept cancellation - refund escrow if paid
            console.log("Accepting cancellation")
            const result = await updateTradeStatus(tradeId, "cancelled" as const)
            console.log("Accept cancellation result:", result)

            if (result.success) {
              toast({
                title: "Trade Cancelled",
                description: "Trade cancelled by mutual agreement. Escrow has been refunded.",
              })
              setSelectedTrade((prev) => (prev ? { ...prev, status: "cancelled" } : null))
              await refreshTrades()
            } else {
              toast({
                title: "Error",
                description: result.error || "Failed to cancel trade",
                variant: "destructive",
              })
            }
          } else {
            // Decline cancellation - flag for admin review
            console.log("Declining cancellation")
            const result = await updateTradeStatus(tradeId, "dispute_review" as const)
            console.log("Decline cancellation result:", result)

            if (result.success) {
              toast({
                title: "Dispute Flagged",
                description: "Cancellation declined. Trade has been flagged for admin review.",
                variant: "destructive",
              })
              setSelectedTrade((prev) => (prev ? { ...prev, status: "dispute_review" } : null))
              await refreshTrades()
            } else {
              toast({
                title: "Error",
                description: result.error || "Failed to flag dispute",
                variant: "destructive",
              })
            }
          }
        }
      } else {
        // Request cancellation
        console.log("Requesting cancellation")
        const result = await updateTradeStatus(tradeId, "cancellation_requested" as const, "current-user")
        console.log("Request cancellation result:", result)

        if (result.success) {
          toast({
            title: "Cancellation Requested",
            description: "Cancellation request sent to the other party.",
          })
          setSelectedTrade((prev) =>
            prev ? { ...prev, status: "cancellation_requested", cancellationRequestedBy: "current-user" } : null,
          )
          await refreshTrades()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to request cancellation",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error in handleCancelTrade:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleMarkFiatPaid = async (tradeId: string) => {
    const result = await updateTradeStatus(tradeId, "fiat_paid" as const)
    if (result.success) {
      toast({
        title: "Fiat Payment Marked",
        description: "Seller can now verify and release escrow.",
      })
      await refreshTrades()
    }
  }

  const handleReleaseEscrow = async (tradeId: string) => {
    const result = await updateTradeStatus(tradeId, "completed" as const)
    if (result.success) {
      toast({
        title: "Escrow Released",
        description: "Trade completed successfully!",
      })
      await refreshTrades()
    }
  }

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    if (selectedTrade) {
      pollInterval = setInterval(() => {
        refreshTrades()
      }, 5000)
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [selectedTrade, refreshTrades])

  useEffect(() => {
    if (selectedTrade && myTrades.length > 0) {
      const updatedTrade = myTrades.find((trade) => trade.id === selectedTrade.id)
      if (updatedTrade && JSON.stringify(updatedTrade) !== JSON.stringify(selectedTrade)) {
        setSelectedTrade(updatedTrade)
      }
    }
  }, [myTrades, selectedTrade])

  const filteredListings = searchListings({
    type: searchFilters.type as "buy" | "sell" | undefined,
    cryptocurrency: searchFilters.cryptocurrency || undefined,
    fiatCurrency: searchFilters.fiatCurrency || undefined,
    minTrustScore: searchFilters.minTrustScore ? Number.parseInt(searchFilters.minTrustScore) : undefined,
    paymentMethod: searchFilters.paymentMethod || undefined,
  })

  const TrustBadge = ({ score, level }: { score: number; level: number }) => {
    const getColor = (score: number) => {
      if (score >= 90) return "bg-green-600"
      if (score >= 70) return "bg-blue-600"
      if (score >= 50) return "bg-yellow-600"
      return "bg-gray-600"
    }

    return (
      <div className="flex items-center gap-2">
        <Badge className={`gap-1 ${getColor(score)}`}>
          <Shield className="w-3 h-3" />
          Trust {score}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Star className="w-3 h-3" />
          {level}% Verified
        </Badge>
      </div>
    )
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "active":
          return "bg-green-600"
        case "pending":
          return "bg-yellow-600"
        case "escrow_paid":
          return "bg-blue-600"
        case "fiat_paid":
          return "bg-purple-600"
        case "completed":
          return "bg-green-700"
        case "cancelled":
          return "bg-red-600"
        case "cancellation_requested":
          return "bg-orange-600"
        case "dispute_review":
          return "bg-red-700"
        case "incorrect_escrow":
          return "bg-red-800"
        default:
          return "bg-gray-600"
      }
    }

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "active":
          return <Clock className="w-3 h-3" />
        case "pending":
          return <Clock className="w-3 h-3" />
        case "escrow_paid":
          return <CheckCircle className="w-3 h-3" />
        case "fiat_paid":
          return <CheckCircle className="w-3 h-3" />
        case "completed":
          return <CheckCircle className="w-3 h-3" />
        case "cancelled":
          return <AlertTriangle className="w-3 h-3" />
        case "cancellation_requested":
          return <AlertTriangle className="w-3 h-3" />
        case "dispute_review":
          return <AlertTriangle className="w-3 h-3" />
        case "incorrect_escrow":
          return <AlertTriangle className="w-3 h-3" />
        default:
          return <Clock className="w-3 h-3" />
      }
    }

    const getStatusText = (status: string) => {
      switch (status) {
        case "active":
          return "Active"
        case "pending":
          return "Pending"
        case "escrow_paid":
          return "Escrow Paid"
        case "fiat_paid":
          return "Fiat Paid"
        case "completed":
          return "Completed"
        case "cancelled":
          return "Cancelled"
        case "cancellation_requested":
          return "Cancellation Requested"
        case "dispute_review":
          return "Under Review"
        case "incorrect_escrow":
          return "Incorrect Escrow"
        default:
          return status
      }
    }

    return (
      <Badge className={`gap-1 ${getStatusColor(status)}`}>
        {getStatusIcon(status)}
        {getStatusText(status)}
      </Badge>
    )
  }

  // Added clipboard copy functionality
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Escrow address has been copied to your clipboard.",
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the address manually.",
        variant: "destructive",
      })
    }
  }

  const simulateBlockchainCheck = async (escrowAddress: string): Promise<number> => {
    // Simulate blockchain monitoring - in real app would check actual blockchain
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Return slightly different amount to test validation (in real app this would be actual received amount)
    return Math.random() > 0.8 ? 0.5001 : 0.5 // Sometimes return incorrect amount for testing
  }

  const convertFiatToCrypto = (fiatAmount: number, cryptoPrice: number): number => {
    return fiatAmount / cryptoPrice
  }

  const getCurrentCryptoPrice = async (crypto: string): Promise<number> => {
    // In real implementation, fetch from rate aggregator
    const mockPrices: Record<string, number> = {
      BTC: 95000,
      ETH: 3300,
      USDT: 1,
      BNB: 695,
      ADA: 1.05,
    }
    return mockPrices[crypto] || 1
  }

  if (showCreateListing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setShowCreateListing(false)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create P2P Listing</h1>
            <p className="text-muted-foreground">Create a buy or sell order for other users</p>
          </div>
        </div>

        {message && (
          <Alert className={message.includes("success") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.includes("success") ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
            <CardDescription>Provide details for your buy or sell order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Order Type</Label>
                <Select
                  value={newListing.type}
                  onValueChange={(value: "buy" | "sell") => setNewListing({ ...newListing, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy (I want to buy crypto)</SelectItem>
                    <SelectItem value="sell">Sell (I want to sell crypto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cryptocurrency">Cryptocurrency</Label>
                <Select
                  value={newListing.cryptocurrency}
                  onValueChange={(value) => setNewListing({ ...newListing, cryptocurrency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crypto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                    <SelectItem value="BNB">Binance Coin (BNB)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant={displayMode === "crypto" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDisplayMode("crypto")}
                    >
                      Crypto
                    </Button>
                    <Button
                      type="button"
                      variant={displayMode === "fiat" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDisplayMode("fiat")}
                    >
                      Fiat
                    </Button>
                  </div>
                </div>
                <Input
                  id="amount"
                  type="number"
                  step={displayMode === "crypto" ? "0.00001" : "0.01"}
                  value={newListing.amount}
                  onChange={(e) => {
                    setNewListing({ ...newListing, amount: e.target.value, displayMode: displayMode })
                  }}
                  placeholder={displayMode === "crypto" ? "0.00001" : "0.01"}
                />
                {newListing.amount && newListing.price && (
                  <p className="text-xs text-muted-foreground">
                    {displayMode === "crypto"
                      ? `≈ ${formatPrice(Number.parseFloat(newListing.amount) * Number.parseFloat(newListing.price))}`
                      : `≈ ${(Number.parseFloat(newListing.amount) / Number.parseFloat(newListing.price)).toLocaleString(undefined, { maximumFractionDigits: 8, minimumFractionDigits: 0 })} ${newListing.cryptocurrency}`}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price per {newListing.cryptocurrency.toUpperCase()} (in {newListing.fiatCurrency})
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder={`Enter price in ${newListing.fiatCurrency}`}
                  value={newListing.price}
                  onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiatCurrency">Fiat Currency</Label>
                <Select
                  value={newListing.fiatCurrency}
                  onValueChange={(value) => setNewListing({ ...newListing, fiatCurrency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={currency} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrder">
                  Minimum Order{" "}
                  {displayMode === "crypto" ? `(${newListing.cryptocurrency})` : `(${newListing.fiatCurrency})`}
                </Label>
                <Input
                  id="minOrder"
                  type="number"
                  step={displayMode === "crypto" ? "0.00001" : "0.01"}
                  value={newListing.minOrder}
                  onChange={(e) => setNewListing({ ...newListing, minOrder: e.target.value })}
                  placeholder={displayMode === "crypto" ? "0.00001" : "0.01"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOrder">
                  Maximum Order{" "}
                  {displayMode === "crypto" ? `(${newListing.cryptocurrency})` : `(${newListing.fiatCurrency})`}
                </Label>
                <Input
                  id="maxOrder"
                  type="number"
                  step={displayMode === "crypto" ? "0.00001" : "0.01"}
                  value={newListing.maxOrder}
                  onChange={(e) => setNewListing({ ...newListing, maxOrder: e.target.value })}
                  placeholder={displayMode === "crypto" ? "0.00001" : "0.01"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Methods</Label>
              <div className="grid md:grid-cols-3 gap-2">
                {["Bank Transfer", "PayPal", "Zelle", "Wise", "Cash App", "Venmo", "Cash Deposit"].map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={method}
                      checked={newListing.paymentMethods.includes(method)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewListing({ ...newListing, paymentMethods: [...newListing.paymentMethods, method] })
                        } else {
                          setNewListing({
                            ...newListing,
                            paymentMethods: newListing.paymentMethods.filter((m) => m !== method),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={method} className="text-sm">
                      {method}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newListing.description}
                onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                placeholder="Describe your offer..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms and Conditions</Label>
              <Textarea
                id="terms"
                value={newListing.terms}
                onChange={(e) => setNewListing({ ...newListing, terms: e.target.value })}
                placeholder="Payment terms, time limits, etc..."
                rows={3}
              />
            </div>

            <Button onClick={handleCreateListing} disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Listing"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedListing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedListing(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Trade Details</h1>
            <p className="text-muted-foreground">Review and initiate trade</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedListing.type === "sell" ? (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  )}
                  {selectedListing.type === "sell" ? "Sell" : "Buy"} {selectedListing.cryptocurrency}
                </CardTitle>
                <CardDescription>by {selectedListing.userName}</CardDescription>
              </div>
              <StatusBadge status={selectedListing.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <TrustBadge score={selectedListing.userTrustScore} level={selectedListing.userVerificationLevel} />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Amount Available</Label>
                <div className="text-lg font-semibold">
                  {Number(selectedListing.amount).toLocaleString(undefined, {
                    maximumFractionDigits: 8,
                    minimumFractionDigits: 0,
                  })}{" "}
                  {selectedListing.cryptocurrency}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Price</Label>
                <div className="text-lg font-semibold">
                  {formatPrice(convertPrice(selectedListing.price, selectedListing.fiatCurrency))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Min Order</Label>
                <div className="font-medium">
                  {selectedListing.displayMode === "fiat"
                    ? `${formatPrice(selectedListing.minOrder * selectedListing.price)} ${selectedListing.fiatCurrency}`
                    : `${Number(selectedListing.minOrder).toLocaleString(undefined, {
                        maximumFractionDigits: 8,
                        minimumFractionDigits: 0,
                      })} ${selectedListing.cryptocurrency}`}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Max Order</Label>
                <div className="font-medium">
                  {selectedListing.displayMode === "fiat"
                    ? `${formatPrice(selectedListing.maxOrder * selectedListing.price)} ${selectedListing.fiatCurrency}`
                    : `${Number(selectedListing.maxOrder).toLocaleString(undefined, {
                        maximumFractionDigits: 8,
                        minimumFractionDigits: 0,
                      })} ${selectedListing.cryptocurrency}`}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Payment Methods</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedListing.paymentMethods.map((method) => (
                  <Badge key={method} variant="outline">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Description</Label>
              <p className="text-sm mt-1">{selectedListing.description}</p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Terms</Label>
              <p className="text-sm mt-1">{selectedListing.terms}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{selectedListing.completedTrades} trades completed</span>
              <span>{selectedListing.successRate}% success rate</span>
            </div>

            <Button
              onClick={() =>
                handleInitiateTrade(selectedListing, selectedListing.amount, selectedListing.paymentMethods[0])
              }
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Initiating..." : `Initiate Trade`}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedTrade) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedTrade(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Trade #{selectedTrade.id.slice(-6)}</h1>
            <p className="text-muted-foreground">Trade details and messages</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trade Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Trade Information
                <StatusBadge status={selectedTrade.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Amount</Label>
                  <div className="font-semibold">{selectedTrade.amount}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Value</Label>
                  <div className="font-semibold">{selectedTrade.totalValue}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Payment Method</Label>
                <div className="font-medium">{selectedTrade.paymentMethod}</div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Trading Partner</Label>
                <div className="flex items-center gap-2">
                  <div className="font-medium">{selectedTrade.counterparty}</div>
                  <TrustBadge score={85} level={100} />
                </div>
              </div>

              {/* Enhanced escrow information display with full address and crypto amounts */}
              <div className="border-t pt-4">
                <Label className="text-sm text-muted-foreground">Escrow Information</Label>
                <div className="space-y-2 mt-2">
                  <div className="space-y-1">
                    <span className="text-sm">Escrow Address:</span>
                    <div
                      className="font-mono text-sm bg-muted p-2 rounded cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() =>
                        copyToClipboard(selectedTrade.escrowAddress || "0x742d35Cc6Db8C4c3045870eF734c7C4B2f4B2f")
                      }
                      title="Click to copy address"
                    >
                      {selectedTrade.escrowAddress || "0x742d35Cc6Db8C4c3045870eF734c7C4B2f4B2f"}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Required Amount:</span>
                    <span className="font-semibold">
                      {selectedTrade.escrowAmount?.toFixed(8)} {selectedTrade.cryptocurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fiat Equivalent:</span>
                    <span className="text-muted-foreground">
                      {formatPrice(
                        convertPrice(
                          typeof selectedTrade.totalValue === "number"
                            ? selectedTrade.totalValue
                            : Number.parseFloat(String(selectedTrade.totalValue || "0").replace(/[^\d.-]/g, "")),
                          selectedTrade.fiatCurrency || 'USD',
                        )
                      )} {selectedTrade.fiatCurrency || 'USD'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Confirmations:</span>
                    <span className={selectedTrade.status === "escrow_paid" ? "text-green-600" : "text-yellow-600"}>
                      {selectedTrade.status === "escrow_paid" ? "1/1 ✓" : "0/1 ⏳"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Created</Label>
                <div className="text-sm">{new Date(selectedTrade.createdAt).toLocaleString()}</div>
              </div>

              <div className="pt-4 space-y-2">
                {selectedTrade.status === "active" && (
                  <div className="text-center space-y-2">
                    <div className="text-sm text-muted-foreground">Waiting for escrow payment to escrow address...</div>
                    <div className="text-xs text-muted-foreground">
                      Payment will be confirmed automatically after 1 blockchain confirmation
                    </div>
                  </div>
                )}

                {selectedTrade.status === "escrow_paid" && (
                  <>
                    <Button className="w-full" variant="default" onClick={() => handleMarkFiatPaid(selectedTrade.id)}>
                      Mark Fiat Payment Sent
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Click after sending fiat payment to seller
                    </p>
                  </>
                )}

                {selectedTrade.status === "fiat_paid" && (
                  <>
                    <Button className="w-full" variant="default" onClick={() => handleReleaseEscrow(selectedTrade.id)}>
                      Release Escrow
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Release crypto to buyer after verifying fiat payment
                    </p>
                  </>
                )}

                {selectedTrade.status !== "completed" && selectedTrade.status !== "cancelled" && (
                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    onClick={() => handleCancelTrade(selectedTrade.id)}
                  >
                    {selectedTrade.status === "cancellation_requested"
                      ? selectedTrade.cancellationRequestedBy === "current-user"
                        ? "Cancel Cancellation Request"
                        : "Respond to Cancellation Request"
                      : "Request Trade Cancellation"}
                  </Button>
                )}

                {selectedTrade.status === "cancellation_requested" && (
                  <div className="text-center space-y-1">
                    <p className="text-xs text-orange-600">
                      {selectedTrade.cancellationRequestedBy === "current-user"
                        ? "You have requested to cancel this trade"
                        : "The other party has requested to cancel this trade"}
                    </p>
                    <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                      Status: Cancellation Requested
                    </div>
                  </div>
                )}

                {selectedTrade.status === "dispute_review" && (
                  <p className="text-xs text-red-600 text-center">This trade is under admin review due to a dispute</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages ({selectedTrade.messages.length})
                </div>
                <Button variant="ghost" size="sm" onClick={handleRefreshMessages} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {selectedTrade.messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === "current-user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.senderId === "current-user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">{message.senderName}</div>
                      <div className="text-sm">{message.message}</div>
                      <div className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(selectedTrade.id, newMessage)
                    }
                  }}
                />
                <Button
                  onClick={() => handleSendMessage(selectedTrade.id, newMessage)}
                  disabled={!newMessage.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">P2P Marketplace</h1>
            <p className="text-muted-foreground">Trade directly with other users</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateListing(true)} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Create Listing
        </Button>
      </div>

      {message && (
        <Alert className={message.includes("success") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.includes("success") ? "text-green-800" : "text-red-800"}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse ({filteredListings.length})</TabsTrigger>
          <TabsTrigger value="listings">My Listings ({myListings.length})</TabsTrigger>
          <TabsTrigger value="trades">My Trades ({myTrades.length})</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid gap-4">
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedListing(listing)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {listing.type === "sell" ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        )}
                        <span className="font-semibold">
                          {listing.type === "sell" ? "Sell" : "Buy"} {listing.cryptocurrency}
                        </span>
                        <StatusBadge status={listing.status} />
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Amount</Label>
                          <div className="font-medium">
                            {Number(listing.amount).toLocaleString(undefined, {
                              maximumFractionDigits: 8,
                              minimumFractionDigits: 0,
                            })}{" "}
                            {listing.cryptocurrency}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Price</Label>
                          <div className="font-medium">
                            {formatPrice(convertPrice(listing.price, listing.fiatCurrency))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Range</Label>
                          <div className="text-sm">
                            {listing.displayMode === "fiat"
                              ? `${formatPrice(listing.minOrder * listing.price)} - ${formatPrice(listing.maxOrder * listing.price)} ${listing.fiatCurrency}`
                              : `${Number(listing.minOrder).toLocaleString(undefined, { maximumFractionDigits: 8, minimumFractionDigits: 0 })} - ${Number(listing.maxOrder).toLocaleString(undefined, { maximumFractionDigits: 8, minimumFractionDigits: 0 })} ${listing.cryptocurrency}`}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Trader</Label>
                          <div className="text-sm">{listing.userName}</div>
                        </div>
                      </div>
                      <TrustBadge score={listing.userTrustScore} level={listing.userVerificationLevel} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <div className="grid gap-4">
            {myListings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {listing.type === "sell" ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        )}
                        <span className="font-semibold">
                          {listing.type === "sell" ? "Sell" : "Buy"} {listing.cryptocurrency}
                        </span>
                        <StatusBadge status={listing.status} />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Amount</Label>
                          <div className="font-medium">
                            {Number(listing.amount).toLocaleString(undefined, {
                              maximumFractionDigits: 8,
                              minimumFractionDigits: 0,
                            })}{" "}
                            {listing.cryptocurrency}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Price</Label>
                          <div className="font-medium">
                            {formatPrice(convertPrice(listing.price, listing.fiatCurrency))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Range</Label>
                          <div className="text-sm">
                            {listing.displayMode === "fiat"
                              ? `${formatPrice(listing.minOrder * listing.price)} - ${formatPrice(listing.maxOrder * listing.price)} ${listing.fiatCurrency}`
                              : `${Number(listing.minOrder).toLocaleString(undefined, { maximumFractionDigits: 8, minimumFractionDigits: 0 })} - ${Number(listing.maxOrder).toLocaleString(undefined, { maximumFractionDigits: 8, minimumFractionDigits: 0 })} ${listing.cryptocurrency}`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateListing(listing.id, { status: listing.status === "active" ? "paused" : "active" })
                        }
                      >
                        {listing.status === "active" ? "Pause" : "Activate"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteListing(listing.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <div className="grid gap-4">
            {myTrades.map((trade) => (
              <Card key={trade.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold">Trade #{trade.id.slice(-6)}</div>
                      <div className="text-sm text-muted-foreground">
                        {trade.amount} crypto for {trade.totalValue} {trade.paymentMethod}
                      </div>
                    </div>
                    <StatusBadge status={trade.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(trade.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTrade(trade)
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Messages ({trade.messages.length})
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTrade(trade)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Search Filters
              </CardTitle>
              <CardDescription>Filter listings to find exactly what you're looking for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filterType">Order Type</Label>
                  <Select
                    value={searchFilters.type}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="buy">Buy orders</SelectItem>
                      <SelectItem value="sell">Sell orders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filterCrypto">Cryptocurrency</Label>
                  <Select
                    value={searchFilters.cryptocurrency}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, cryptocurrency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All cryptocurrencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All cryptocurrencies</SelectItem>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                      <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filterFiat">Fiat Currency</Label>
                  <Select
                    value={searchFilters.fiatCurrency}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, fiatCurrency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All currencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All currencies</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="MXN">MXN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filterTrust">Minimum Trust Score</Label>
                  <Select
                    value={searchFilters.minTrustScore}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, minTrustScore: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any trust score" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any trust score</SelectItem>
                      <SelectItem value="50">50+ (Basic)</SelectItem>
                      <SelectItem value="70">70+ (Good)</SelectItem>
                      <SelectItem value="85">85+ (Excellent)</SelectItem>
                      <SelectItem value="95">95+ (Outstanding)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterPayment">Payment Method</Label>
                <Select
                  value={searchFilters.paymentMethod}
                  onValueChange={(value) => setSearchFilters({ ...searchFilters, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any payment method</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Zelle">Zelle</SelectItem>
                    <SelectItem value="Wise">Wise</SelectItem>
                    <SelectItem value="Cash App">Cash App</SelectItem>
                    <SelectItem value="Venmo">Venmo</SelectItem>
                    <SelectItem value="Cash Deposit">Cash Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() =>
                  setSearchFilters({
                    type: "all",
                    cryptocurrency: "all",
                    fiatCurrency: "all",
                    minTrustScore: "any",
                    paymentMethod: "any",
                  })
                }
                variant="outline"
                className="w-full"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
