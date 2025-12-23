"use client"

import { useEffect, useState, type ReactNode } from "react"
import { config, projectId, hasValidProjectId } from "@/lib/wagmi-config"
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type State, WagmiProvider } from "wagmi"
import { WalletProvider } from "@/contexts/wallet-context"

declare global {
  interface Window {
    __WEB3MODAL_INITIALIZED__?: boolean
  }
}

// Setup queryClient
const queryClient = new QueryClient()

const fallbackProjectId = projectId && hasValidProjectId ? projectId : "demo-project-id"
const enableFullFeatures = hasValidProjectId

const mobileWallets = enableFullFeatures
  ? [
      {
        id: "metamask",
        name: "MetaMask",
        links: {
          native: "metamask:",
          universal: "https://metamask.app.link",
        },
      },
      {
        id: "trust",
        name: "Trust Wallet",
        links: {
          native: "trust:",
          universal: "https://link.trustwallet.com",
        },
      },
      {
        id: "coinbase",
        name: "Coinbase Wallet",
        links: {
          native: "cbwallet:",
          universal: "https://go.cb-w.com",
        },
      },
      {
        id: "rainbow",
        name: "Rainbow",
        links: {
          native: "rainbow:",
          universal: "https://rnbwapp.com",
        },
      },
    ]
  : []

const desktopWallets = enableFullFeatures
  ? [
      {
        id: "metamask",
        name: "MetaMask",
        links: {
          native: "metamask:",
          universal: "https://metamask.io",
        },
      },
    ]
  : []

function initializeWeb3Modal() {
  if (typeof window === "undefined" || window.__WEB3MODAL_INITIALIZED__) {
    return
  }

  createWeb3Modal({
    wagmiConfig: config,
    projectId: fallbackProjectId,
    enableAnalytics: enableFullFeatures,
    enableOnramp: enableFullFeatures,
    themeMode: "light",
    themeVariables: {
      "--w3m-color-mix": "#00D4AA",
      "--w3m-color-mix-strength": 15,
    },
    enableWalletConnect: enableFullFeatures,
    enableInjected: true,
    enableEIP6963: true,
    enableCoinbase: enableFullFeatures,
    enableWalletGuide: enableFullFeatures,
    allWallets: enableFullFeatures ? "SHOW" : "HIDE",
    mobileWallets,
    desktopWallets,
    features: {
      analytics: enableFullFeatures,
      onramp: enableFullFeatures,
      swaps: enableFullFeatures,
      email: enableFullFeatures,
      socials: enableFullFeatures ? ["google", "apple", "facebook", "github", "discord"] : [],
    },
  })

  window.__WEB3MODAL_INITIALIZED__ = true
}

export function Web3Modal({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: State
}) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    initializeWeb3Modal()
    setIsReady(true)
  }, [])

  if (!isReady) {
    return null
  }

  // Always provide WagmiProvider with the config
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>{children}</WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
