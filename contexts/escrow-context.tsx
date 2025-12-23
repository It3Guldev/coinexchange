"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface EscrowContract {
  id: string
  tradeId: string
  buyerAddress: string
  sellerAddress: string
  arbitratorAddress: string
  cryptocurrency: string
  amount: number
  fiatAmount: number
  fiatCurrency: string
  contractAddress: string
  status: "created" | "funded" | "released" | "disputed" | "resolved" | "cancelled"
  createdAt: string
  fundedAt?: string
  releasedAt?: string
  disputedAt?: string
  resolvedAt?: string
  timeoutAt: string
  buyerConfirmed: boolean
  sellerConfirmed: boolean
  disputeReason?: string
  resolution?: string
  arbitratorDecision?: "buyer" | "seller" | "split"
  fees: {
    escrowFee: number
    arbitrationFee: number
    networkFee: number
  }
}

export interface DisputeCase {
  id: string
  escrowId: string
  initiatedBy: "buyer" | "seller"
  reason: string
  evidence: string[]
  status: "open" | "under_review" | "resolved"
  arbitratorNotes?: string
  resolution?: string
  createdAt: string
  resolvedAt?: string
}

interface EscrowContextType {
  escrows: EscrowContract[]
  disputes: DisputeCase[]
  isLoading: boolean
  createEscrow: (
    tradeId: string,
    buyerAddress: string,
    sellerAddress: string,
    cryptocurrency: string,
    amount: number,
    fiatAmount: number,
    fiatCurrency: string,
  ) => Promise<{ success: boolean; escrowId?: string; error?: string }>
  fundEscrow: (escrowId: string) => Promise<{ success: boolean; error?: string }>
  confirmPayment: (escrowId: string, role: "buyer" | "seller") => Promise<{ success: boolean; error?: string }>
  releaseEscrow: (escrowId: string) => Promise<{ success: boolean; error?: string }>
  initiateDispute: (
    escrowId: string,
    reason: string,
    evidence: string[],
  ) => Promise<{ success: boolean; disputeId?: string; error?: string }>
  resolveDispute: (
    disputeId: string,
    decision: "buyer" | "seller" | "split",
    notes: string,
  ) => Promise<{ success: boolean; error?: string }>
  cancelEscrow: (escrowId: string) => Promise<{ success: boolean; error?: string }>
  getEscrowByTradeId: (tradeId: string) => EscrowContract | undefined
  refreshEscrows: () => Promise<void>
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined)

export function EscrowProvider({ children }: { children: ReactNode }) {
  const [escrows, setEscrows] = useState<EscrowContract[]>([])
  const [disputes, setDisputes] = useState<DisputeCase[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadEscrows()
    loadDisputes()
  }, [])

  const loadEscrows = async () => {
    try {
      const savedEscrows = localStorage.getItem("escrow_contracts")
      if (savedEscrows) {
        setEscrows(JSON.parse(savedEscrows))
      }
    } catch (error) {
      console.error("Failed to load escrows:", error)
    }
  }

  const loadDisputes = async () => {
    try {
      const savedDisputes = localStorage.getItem("escrow_disputes")
      if (savedDisputes) {
        setDisputes(JSON.parse(savedDisputes))
      }
    } catch (error) {
      console.error("Failed to load disputes:", error)
    }
  }

  const saveEscrows = (updatedEscrows: EscrowContract[]) => {
    setEscrows(updatedEscrows)
    localStorage.setItem("escrow_contracts", JSON.stringify(updatedEscrows))
  }

  const saveDisputes = (updatedDisputes: DisputeCase[]) => {
    setDisputes(updatedDisputes)
    localStorage.setItem("escrow_disputes", JSON.stringify(updatedDisputes))
  }

  const createEscrow = async (
    tradeId: string,
    buyerAddress: string,
    sellerAddress: string,
    cryptocurrency: string,
    amount: number,
    fiatAmount: number,
    fiatCurrency: string,
  ) => {
    try {
      setIsLoading(true)

      // Calculate fees (2% escrow fee, 1% arbitration fee, estimated network fee)
      const escrowFee = fiatAmount * 0.02
      const arbitrationFee = fiatAmount * 0.01
      const networkFee = 5 // Fixed network fee in USD

      // Mock smart contract deployment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newEscrow: EscrowContract = {
        id: Date.now().toString(),
        tradeId,
        buyerAddress,
        sellerAddress,
        arbitratorAddress: "0xArbitrator123", // Platform arbitrator
        cryptocurrency,
        amount,
        fiatAmount,
        fiatCurrency,
        contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        status: "created",
        createdAt: new Date().toISOString(),
        timeoutAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        buyerConfirmed: false,
        sellerConfirmed: false,
        fees: {
          escrowFee,
          arbitrationFee,
          networkFee,
        },
      }

      const updatedEscrows = [...escrows, newEscrow]
      saveEscrows(updatedEscrows)

      return { success: true, escrowId: newEscrow.id }
    } catch (error) {
      return { success: false, error: "Failed to create escrow contract" }
    } finally {
      setIsLoading(false)
    }
  }

  const fundEscrow = async (escrowId: string) => {
    try {
      setIsLoading(true)

      // Mock blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const updatedEscrows = escrows.map((escrow) =>
        escrow.id === escrowId
          ? {
              ...escrow,
              status: "funded" as const,
              fundedAt: new Date().toISOString(),
            }
          : escrow,
      )

      saveEscrows(updatedEscrows)
      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to fund escrow" }
    } finally {
      setIsLoading(false)
    }
  }

  const confirmPayment = async (escrowId: string, role: "buyer" | "seller") => {
    try {
      const updatedEscrows = escrows.map((escrow) => {
        if (escrow.id === escrowId) {
          const updated = {
            ...escrow,
            [role === "buyer" ? "buyerConfirmed" : "sellerConfirmed"]: true,
          }

          // Auto-release if both parties confirmed
          if (updated.buyerConfirmed && updated.sellerConfirmed) {
            updated.status = "released"
            updated.releasedAt = new Date().toISOString()
          }

          return updated
        }
        return escrow
      })

      saveEscrows(updatedEscrows)
      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to confirm payment" }
    }
  }

  const releaseEscrow = async (escrowId: string) => {
    try {
      setIsLoading(true)

      // Mock blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const updatedEscrows = escrows.map((escrow) =>
        escrow.id === escrowId
          ? {
              ...escrow,
              status: "released" as const,
              releasedAt: new Date().toISOString(),
            }
          : escrow,
      )

      saveEscrows(updatedEscrows)
      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to release escrow" }
    } finally {
      setIsLoading(false)
    }
  }

  const initiateDispute = async (escrowId: string, reason: string, evidence: string[]) => {
    try {
      const newDispute: DisputeCase = {
        id: Date.now().toString(),
        escrowId,
        initiatedBy: "buyer", // Would determine from context
        reason,
        evidence,
        status: "open",
        createdAt: new Date().toISOString(),
      }

      const updatedDisputes = [...disputes, newDispute]
      saveDisputes(updatedDisputes)

      // Update escrow status
      const updatedEscrows = escrows.map((escrow) =>
        escrow.id === escrowId
          ? {
              ...escrow,
              status: "disputed" as const,
              disputedAt: new Date().toISOString(),
              disputeReason: reason,
            }
          : escrow,
      )

      saveEscrows(updatedEscrows)

      return { success: true, disputeId: newDispute.id }
    } catch (error) {
      return { success: false, error: "Failed to initiate dispute" }
    }
  }

  const resolveDispute = async (disputeId: string, decision: "buyer" | "seller" | "split", notes: string) => {
    try {
      setIsLoading(true)

      // Mock arbitration process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedDisputes = disputes.map((dispute) =>
        dispute.id === disputeId
          ? {
              ...dispute,
              status: "resolved" as const,
              arbitratorNotes: notes,
              resolution: `Funds awarded to ${decision}`,
              resolvedAt: new Date().toISOString(),
            }
          : dispute,
      )

      saveDisputes(updatedDisputes)

      // Update corresponding escrow
      const dispute = disputes.find((d) => d.id === disputeId)
      if (dispute) {
        const updatedEscrows = escrows.map((escrow) =>
          escrow.id === dispute.escrowId
            ? {
                ...escrow,
                status: "resolved" as const,
                arbitratorDecision: decision,
                resolution: `Dispute resolved in favor of ${decision}`,
                resolvedAt: new Date().toISOString(),
              }
            : escrow,
        )

        saveEscrows(updatedEscrows)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to resolve dispute" }
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEscrow = async (escrowId: string) => {
    try {
      setIsLoading(true)

      // Mock blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const updatedEscrows = escrows.map((escrow) =>
        escrow.id === escrowId
          ? {
              ...escrow,
              status: "cancelled" as const,
            }
          : escrow,
      )

      saveEscrows(updatedEscrows)
      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to cancel escrow" }
    } finally {
      setIsLoading(false)
    }
  }

  const getEscrowByTradeId = (tradeId: string) => {
    return escrows.find((escrow) => escrow.tradeId === tradeId)
  }

  const refreshEscrows = async () => {
    await loadEscrows()
    await loadDisputes()
  }

  const value: EscrowContextType = {
    escrows,
    disputes,
    isLoading,
    createEscrow,
    fundEscrow,
    confirmPayment,
    releaseEscrow,
    initiateDispute,
    resolveDispute,
    cancelEscrow,
    getEscrowByTradeId,
    refreshEscrows,
  }

  return <EscrowContext.Provider value={value}>{children}</EscrowContext.Provider>
}

export function useEscrow() {
  const context = useContext(EscrowContext)
  if (context === undefined) {
    throw new Error("useEscrow must be used within an EscrowProvider")
  }
  return context
}
