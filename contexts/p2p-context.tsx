"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useKYC } from "./kyc-context"

export interface P2PListing {
  id: string
  userId: string
  userAddress: string
  userName: string
  userTrustScore: number
  userVerificationLevel: number
  type: "buy" | "sell"
  cryptocurrency: string
  fiatCurrency: string
  amount: number
  price: number
  minOrder: number
  maxOrder: number
  paymentMethods: string[]
  description: string
  terms: string
  status: "active" | "paused" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
  completedTrades: number
  successRate: number
  sellerAddress?: string // Added seller address for escrow
}

export interface P2PTrade {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  amount: number
  price: number
  totalValue: number
  escrowAmount: number // Added escrow amount field for proper escrow display
  status:
    | "pending"
    | "paid"
    | "confirmed"
    | "disputed"
    | "completed"
    | "cancelled"
    | "active"
    | "escrow_paid"
    | "fiat_paid"
    | "cancellation_requested" // Added cancellation_requested status
    | "dispute_review" // Added dispute_review status
    | "incorrect_escrow" // Added incorrect_escrow status
  paymentMethod: string
  escrowAddress?: string
  cancellationRequestedBy?: string // Added cancellation tracking fields
  createdAt: string
  updatedAt: string
  messages: TradeMessage[]
  counterparty?: string
  statusHistory?: Array<{ status: string; timestamp: string; description: string }>
}

export interface TradeMessage {
  id: string
  tradeId: string
  userId: string
  message: string
  timestamp: string
  type: "message" | "system" | "payment_proof"
  attachments?: string[]
  senderId?: string // Added senderId for message display
  senderName?: string // Added senderName for message display
  read?: boolean // Added read status
}

interface P2PContextType {
  listings: P2PListing[]
  myListings: P2PListing[]
  myTrades: P2PTrade[]
  isLoading: boolean
  createListing: (
    listing: Omit<
      P2PListing,
      | "id"
      | "userId"
      | "userAddress"
      | "userName"
      | "userTrustScore"
      | "userVerificationLevel"
      | "createdAt"
      | "updatedAt"
      | "completedTrades"
      | "successRate"
    >,
  ) => Promise<{ success: boolean; error?: string }>
  updateListing: (id: string, updates: Partial<P2PListing>) => Promise<{ success: boolean; error?: string }>
  deleteListing: (id: string) => Promise<{ success: boolean; error?: string }>
  initiateTrade: (
    listingId: string,
    amount: number,
    paymentMethod: string,
  ) => Promise<{ success: boolean; tradeId?: string; error?: string }>
  updateTradeStatus: (
    tradeId: string,
    status: P2PTrade["status"],
    requestedBy?: string,
  ) => Promise<{ success: boolean; error?: string }>
  sendTradeMessage: (
    tradeId: string,
    message: string,
    type?: TradeMessage["type"],
  ) => Promise<{ success: boolean; error?: string }>
  searchListings: (filters: {
    type?: "buy" | "sell"
    cryptocurrency?: string
    fiatCurrency?: string
    minTrustScore?: number
    paymentMethod?: string
  }) => P2PListing[]
  refreshListings: () => Promise<void>
  refreshTrades: () => Promise<void>
}

const P2PContext = createContext<P2PContextType | undefined>(undefined)

export function P2PProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<P2PListing[]>([])
  const [myListings, setMyListings] = useState<P2PListing[]>([])
  const [myTrades, setMyTrades] = useState<P2PTrade[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { getTrustScore, getVerificationLevel } = useKYC()

  useEffect(() => {
    loadListings()
    loadMyData()
  }, [])

  const loadListings = async () => {
    try {
      setIsLoading(true)
      // Mock data - would be API call in production
      const mockListings: P2PListing[] = [
        {
          id: "1",
          userId: "user1",
          userAddress: "0x1234...5678",
          userName: "CryptoTrader123",
          userTrustScore: 85,
          userVerificationLevel: 75,
          type: "sell",
          cryptocurrency: "BTC",
          fiatCurrency: "USD",
          amount: 0.5,
          price: 45000,
          minOrder: 100,
          maxOrder: 5000,
          paymentMethods: ["Bank Transfer", "PayPal", "Zelle"],
          description: "Selling Bitcoin at competitive rates. Fast and reliable service.",
          terms: "Payment must be made within 30 minutes. No chargebacks accepted.",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedTrades: 47,
          successRate: 98.5,
          sellerAddress: "0x1234...5678", // Added seller address
        },
        {
          id: "2",
          userId: "user2",
          userAddress: "0x5678...9012",
          userName: "EthereumExpert",
          userTrustScore: 92,
          userVerificationLevel: 90,
          type: "buy",
          cryptocurrency: "ETH",
          fiatCurrency: "USD",
          amount: 10,
          price: 2800,
          minOrder: 500,
          maxOrder: 10000,
          paymentMethods: ["Bank Transfer", "Wise"],
          description: "Looking to buy Ethereum. Verified buyer with excellent track record.",
          terms: "Quick payment guaranteed. Prefer bank transfers for large amounts.",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedTrades: 23,
          successRate: 100,
          sellerAddress: "0x5678...9012", // Added seller address
        },
      ]
      setListings(mockListings)
    } catch (error) {
      console.error("Failed to load listings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMyData = async () => {
    // Load user's listings and trades
    const savedListings = localStorage.getItem("my_p2p_listings")
    const savedTrades = localStorage.getItem("my_p2p_trades")

    if (savedListings) {
      setMyListings(JSON.parse(savedListings))
    }

    if (savedTrades) {
      setMyTrades(JSON.parse(savedTrades))
    }
  }

  const createListing = async (
    listingData: Omit<
      P2PListing,
      | "id"
      | "userId"
      | "userAddress"
      | "userName"
      | "userTrustScore"
      | "userVerificationLevel"
      | "createdAt"
      | "updatedAt"
      | "completedTrades"
      | "successRate"
    >,
  ) => {
    try {
      const defaultAddress = localStorage.getItem("defaultReceivingAddress") || "0x1234...5678"

      const newListing: P2PListing = {
        ...listingData,
        id: Date.now().toString(),
        userId: "current-user",
        userAddress: defaultAddress,
        userName: "You",
        userTrustScore: getTrustScore(),
        userVerificationLevel: getVerificationLevel(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedTrades: 0,
        successRate: 0,
        sellerAddress: defaultAddress, // Added seller address from user settings
      }

      const updatedMyListings = [...myListings, newListing]
      setMyListings(updatedMyListings)
      localStorage.setItem("my_p2p_listings", JSON.stringify(updatedMyListings))

      // Add to global listings
      setListings((prev) => [...prev, newListing])

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to create listing" }
    }
  }

  const updateListing = async (id: string, updates: Partial<P2PListing>) => {
    try {
      const updatedMyListings = myListings.map((listing) =>
        listing.id === id ? { ...listing, ...updates, updatedAt: new Date().toISOString() } : listing,
      )
      setMyListings(updatedMyListings)
      localStorage.setItem("my_p2p_listings", JSON.stringify(updatedMyListings))

      // Update global listings
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id ? { ...listing, ...updates, updatedAt: new Date().toISOString() } : listing,
        ),
      )

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to update listing" }
    }
  }

  const deleteListing = async (id: string) => {
    try {
      const updatedMyListings = myListings.filter((listing) => listing.id !== id)
      setMyListings(updatedMyListings)
      localStorage.setItem("my_p2p_listings", JSON.stringify(updatedMyListings))

      // Remove from global listings
      setListings((prev) => prev.filter((listing) => listing.id !== id))

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to delete listing" }
    }
  }

  const initiateTrade = async (listingId: string, amount: number, paymentMethod: string) => {
    try {
      const listing = listings.find((l) => l.id === listingId)
      if (!listing) {
        return { success: false, error: "Listing not found" }
      }

      const escrowAmount = listing.type === "sell" ? amount : amount / listing.price

      const newTrade: P2PTrade = {
        id: Date.now().toString(),
        listingId,
        buyerId: listing.type === "sell" ? "current-user" : listing.userId,
        sellerId: listing.type === "sell" ? listing.userId : "current-user",
        amount,
        price: listing.price,
        totalValue: amount * listing.price,
        escrowAmount,
        status: "active",
        paymentMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        counterparty: listing.userName,
        messages: [
          {
            id: "1",
            tradeId: Date.now().toString(),
            userId: "system",
            senderId: "system",
            senderName: "System",
            message: `Trade initiated for ${amount} ${listing.cryptocurrency} at ${listing.price} ${listing.fiatCurrency}. Please fund the escrow address with exactly ${escrowAmount.toFixed(8)} ${listing.cryptocurrency} to proceed.`,
            timestamp: new Date().toISOString(),
            type: "system",
            read: false,
          },
        ],
        statusHistory: [
          {
            status: "active",
            timestamp: new Date().toISOString(),
            description: "Trade initiated, waiting for escrow payment",
          },
        ],
      }

      const updatedMyTrades = [...myTrades, newTrade]
      setMyTrades(updatedMyTrades)
      localStorage.setItem("my_p2p_trades", JSON.stringify(updatedMyTrades))

      return { success: true, tradeId: newTrade.id }
    } catch (error) {
      return { success: false, error: "Failed to initiate trade" }
    }
  }

  const updateTradeStatus = async (tradeId: string, status: P2PTrade["status"], requestedBy?: string) => {
    try {
      const updatedMyTrades = myTrades.map((trade) => {
        if (trade.id === tradeId) {
          const updatedTrade = {
            ...trade,
            status,
            updatedAt: new Date().toISOString(),
            ...(status === "cancellation_requested" && requestedBy ? { cancellationRequestedBy: requestedBy } : {}),
            ...(status !== "cancellation_requested" ? { cancellationRequestedBy: undefined } : {}),
          }

          if (updatedTrade.statusHistory) {
            updatedTrade.statusHistory.push({
              status,
              timestamp: new Date().toISOString(),
              description: getStatusDescription(status, requestedBy),
            })
          }

          return updatedTrade
        }
        return trade
      })

      setMyTrades(updatedMyTrades)
      localStorage.setItem("my_p2p_trades", JSON.stringify(updatedMyTrades))

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to update trade status" }
    }
  }

  const sendTradeMessage = async (tradeId: string, message: string, type: TradeMessage["type"] = "message") => {
    try {
      const newMessage: TradeMessage = {
        id: Date.now().toString(),
        tradeId,
        userId: "current-user",
        senderId: "current-user",
        senderName: "You",
        message,
        timestamp: new Date().toISOString(),
        type,
        read: false,
      }

      const updatedMyTrades = myTrades.map((trade) =>
        trade.id === tradeId
          ? { ...trade, messages: [...trade.messages, newMessage], updatedAt: new Date().toISOString() }
          : trade,
      )
      setMyTrades(updatedMyTrades)
      localStorage.setItem("my_p2p_trades", JSON.stringify(updatedMyTrades))

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to send message" }
    }
  }

  const searchListings = (filters: {
    type?: "buy" | "sell"
    cryptocurrency?: string
    fiatCurrency?: string
    minTrustScore?: number
    paymentMethod?: string
  }) => {
    return listings.filter((listing) => {
      if (filters.type && listing.type !== filters.type) return false
      if (filters.cryptocurrency && listing.cryptocurrency !== filters.cryptocurrency) return false
      if (filters.fiatCurrency && listing.fiatCurrency !== filters.fiatCurrency) return false
      if (filters.minTrustScore && listing.userTrustScore < filters.minTrustScore) return false
      if (filters.paymentMethod && !listing.paymentMethods.includes(filters.paymentMethod)) return false
      return true
    })
  }

  const refreshListings = async () => {
    await loadListings()
  }

  const refreshTrades = async () => {
    const savedTrades = localStorage.getItem("my_p2p_trades")
    if (savedTrades) {
      const parsedTrades = JSON.parse(savedTrades)
      setMyTrades([...parsedTrades]) // Force new array reference to trigger re-render
    }
  }

  const getStatusDescription = (status: P2PTrade["status"], requestedBy?: string) => {
    switch (status) {
      case "cancellation_requested":
        return requestedBy === "current_user"
          ? "You requested to cancel this trade"
          : "Other party requested to cancel this trade"
      case "cancelled":
        return "Trade cancelled by mutual agreement"
      case "dispute_review":
        return "Trade flagged for admin dispute resolution"
      case "incorrect_escrow":
        return "Incorrect escrow amount received, trade cancelled and refunded"
      default:
        return `Trade status updated to ${status}`
    }
  }

  const value: P2PContextType = {
    listings,
    myListings,
    myTrades,
    isLoading,
    createListing,
    updateListing,
    deleteListing,
    initiateTrade,
    updateTradeStatus,
    sendTradeMessage,
    searchListings,
    refreshListings,
    refreshTrades,
  }

  return <P2PContext.Provider value={value}>{children}</P2PContext.Provider>
}

export function useP2P() {
  const context = useContext(P2PContext)
  if (context === undefined) {
    throw new Error("useP2P must be used within a P2PProvider")
  }
  return context
}
