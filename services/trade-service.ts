// Trade service for handling escrow and trade status updates
export interface EscrowContract {
  tradeId: string
  amount: number
  buyerAddress: string
  sellerAddress: string
  cryptoType: string
  status: "created" | "funded" | "released" | "disputed"
  escrowAddress: string
  confirmations: number
}

export interface TradeStatusUpdate {
  tradeId: string
  status: "active" | "escrow_paid" | "fiat_paid" | "completed" | "cancelled" | "incorrect_escrow"
  timestamp: string
}

// Mock blockchain monitoring service
class BlockchainMonitor {
  private static instance: BlockchainMonitor
  private confirmations: Map<string, number> = new Map()

  static getInstance(): BlockchainMonitor {
    if (!BlockchainMonitor.instance) {
      BlockchainMonitor.instance = new BlockchainMonitor()
    }
    return BlockchainMonitor.instance
  }

  async monitorTransaction(txHash: string, requiredConfirmations = 1): Promise<boolean> {
    // Simulate blockchain confirmation monitoring
    return new Promise((resolve) => {
      setTimeout(() => {
        this.confirmations.set(txHash, requiredConfirmations)
        resolve(true)
      }, 2000) // Simulate 2 second confirmation time
    })
  }

  getConfirmations(txHash: string): number {
    return this.confirmations.get(txHash) || 0
  }
}

export async function createEscrow(params: {
  tradeId: string
  amount: number
  buyerAddress: string
  sellerAddress: string
  cryptoType: string
}): Promise<{ success: boolean; escrowContract?: EscrowContract; error?: string }> {
  try {
    // Generate mock escrow address
    const escrowAddress = `0x${Math.random().toString(16).substr(2, 40)}`

    const escrowContract: EscrowContract = {
      tradeId: params.tradeId,
      amount: params.amount,
      buyerAddress: params.buyerAddress,
      sellerAddress: params.sellerAddress,
      cryptoType: params.cryptoType,
      status: "created",
      escrowAddress,
      confirmations: 0,
    }

    // Store escrow contract in localStorage for demo
    const existingEscrows = JSON.parse(localStorage.getItem("escrowContracts") || "[]")
    existingEscrows.push(escrowContract)
    localStorage.setItem("escrowContracts", JSON.stringify(existingEscrows))

    return { success: true, escrowContract }
  } catch (error) {
    return { success: false, error: "Failed to create escrow contract" }
  }
}

export async function updateTradeStatus(
  tradeId: string,
  status: "active" | "escrow_paid" | "fiat_paid" | "completed" | "cancelled" | "incorrect_escrow",
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update trade status in localStorage
    const trades = JSON.parse(localStorage.getItem("p2pTrades") || "[]")
    const tradeIndex = trades.findIndex((trade: any) => trade.id === tradeId)

    if (tradeIndex === -1) {
      return { success: false, error: "Trade not found" }
    }

    trades[tradeIndex].status = status
    trades[tradeIndex].lastUpdated = new Date().toISOString()

    // Add status update to trade history
    if (!trades[tradeIndex].statusHistory) {
      trades[tradeIndex].statusHistory = []
    }

    trades[tradeIndex].statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      description: getStatusDescription(status),
    })

    if (status === "incorrect_escrow") {
      const escrowContract = await getEscrowContract(tradeId)
      if (escrowContract) {
        await initiateEscrowRefund(escrowContract.escrowAddress)
      }
    }

    localStorage.setItem("p2pTrades", JSON.stringify(trades))

    // If escrow is being released, simulate blockchain transaction
    if (status === "completed") {
      const monitor = BlockchainMonitor.getInstance()
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`
      await monitor.monitorTransaction(txHash, 1)
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update trade status" }
  }
}

function getStatusDescription(status: string): string {
  switch (status) {
    case "active":
      return "Trade initiated, waiting for escrow payment"
    case "escrow_paid":
      return "Escrow funded, buyer can make fiat payment"
    case "fiat_paid":
      return "Fiat payment sent, waiting for seller confirmation"
    case "completed":
      return "Trade completed, escrow released to buyer"
    case "cancelled":
      return "Trade cancelled"
    case "incorrect_escrow":
      return "Incorrect escrow amount received, trade cancelled and funds refunded"
    default:
      return "Status updated"
  }
}

export async function getEscrowContract(tradeId: string): Promise<EscrowContract | null> {
  const escrows = JSON.parse(localStorage.getItem("escrowContracts") || "[]")
  return escrows.find((escrow: EscrowContract) => escrow.tradeId === tradeId) || null
}

export async function fundEscrow(
  escrowAddress: string,
  amount: number,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Simulate funding transaction
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    // Update escrow status
    const escrows = JSON.parse(localStorage.getItem("escrowContracts") || "[]")
    const escrowIndex = escrows.findIndex((escrow: EscrowContract) => escrow.escrowAddress === escrowAddress)

    if (escrowIndex !== -1) {
      escrows[escrowIndex].status = "funded"
      escrows[escrowIndex].confirmations = 1
      localStorage.setItem("escrowContracts", JSON.stringify(escrows))
    }

    // Monitor transaction
    const monitor = BlockchainMonitor.getInstance()
    await monitor.monitorTransaction(txHash, 1)

    return { success: true, txHash }
  } catch (error) {
    return { success: false, error: "Failed to fund escrow" }
  }
}

export async function initiateEscrowRefund(
  escrowAddress: string,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Simulate refund transaction
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    // Update escrow status to indicate refund
    const escrows = JSON.parse(localStorage.getItem("escrowContracts") || "[]")
    const escrowIndex = escrows.findIndex((escrow: EscrowContract) => escrow.escrowAddress === escrowAddress)

    if (escrowIndex !== -1) {
      escrows[escrowIndex].status = "disputed" // Using disputed status to indicate refund
      escrows[escrowIndex].confirmations = 1
      localStorage.setItem("escrowContracts", JSON.stringify(escrows))
    }

    // Monitor refund transaction
    const monitor = BlockchainMonitor.getInstance()
    await monitor.monitorTransaction(txHash, 1)

    return { success: true, txHash }
  } catch (error) {
    return { success: false, error: "Failed to initiate escrow refund" }
  }
}

export async function verifyEscrowAmount(
  escrowAddress: string,
  expectedAmount: number,
  tolerance = 0.00000001,
): Promise<{ success: boolean; receivedAmount?: number; isExact?: boolean; error?: string }> {
  try {
    // Simulate blockchain verification - in real app would query actual blockchain
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate received amount (sometimes incorrect for testing)
    const receivedAmount = Math.random() > 0.8 ? expectedAmount + 0.00000001 : expectedAmount
    const isExact = Math.abs(receivedAmount - expectedAmount) <= tolerance

    return {
      success: true,
      receivedAmount,
      isExact,
    }
  } catch (error) {
    return { success: false, error: "Failed to verify escrow amount" }
  }
}

export async function convertFiatToCrypto(
  fiatAmount: number,
  fiatCurrency: string,
  cryptoType: string,
): Promise<{ success: boolean; cryptoAmount?: number; rate?: number; error?: string }> {
  try {
    // Mock real-time rates - in production would fetch from rate aggregator
    const mockRates: Record<string, Record<string, number>> = {
      BTC: { USD: 95000, EUR: 87000, GBP: 75000, CAD: 128000, AUD: 142000, MXN: 1900000 },
      ETH: { USD: 3300, EUR: 3020, GBP: 2610, CAD: 4450, AUD: 4940, MXN: 66000 },
      USDT: { USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.35, AUD: 1.49, MXN: 20 },
      USDC: { USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.35, AUD: 1.49, MXN: 20 },
      BNB: { USD: 695, EUR: 636, GBP: 549, CAD: 937, AUD: 1040, MXN: 13900 },
    }

    const rate = mockRates[cryptoType]?.[fiatCurrency]
    if (!rate) {
      return { success: false, error: "Unsupported currency pair" }
    }

    const cryptoAmount = fiatAmount / rate

    return {
      success: true,
      cryptoAmount,
      rate,
    }
  } catch (error) {
    return { success: false, error: "Failed to convert fiat to crypto" }
  }
}
