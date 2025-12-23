"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAccount, useDisconnect, useBalance } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { hasValidProjectId } from "@/lib/wagmi-config"

interface WalletContextType {
  isConnected: boolean
  address: string | undefined
  balance: string | undefined
  connect: () => void
  disconnect: () => void
  isLoading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const web3Modal = useWeb3Modal() // Moved hook call to top level
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
  })

  const connect = () => {
    if (hasValidProjectId && web3Modal) {
      web3Modal.open()
    } else {
      alert(
        "Demo Mode: Please configure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in Project Settings to enable real wallet connections.",
      )
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const value: WalletContextType = {
    isConnected,
    address,
    balance: balance ? `${Number.parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : undefined,
    connect,
    disconnect: handleDisconnect,
    isLoading: balanceLoading,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
