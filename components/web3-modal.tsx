"use client"

import type { ReactNode } from "react"
import { config, projectId, hasValidProjectId } from "@/lib/wagmi-config"
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type State, WagmiProvider } from "wagmi"
import { WalletProvider } from "@/contexts/wallet-context"

// Setup queryClient
const queryClient = new QueryClient()

if (hasValidProjectId && projectId) {
  createWeb3Modal({
    wagmiConfig: config,
    projectId: projectId,
    enableAnalytics: true,
    enableOnramp: true,
    themeMode: "light",
    themeVariables: {
      "--w3m-color-mix": "#00D4AA",
      "--w3m-color-mix-strength": 15,
    },
    enableWalletConnect: true,
    enableInjected: true,
    enableEIP6963: true,
    enableCoinbase: true,
    enableWalletGuide: true,
    allWallets: "SHOW",
    mobileWallets: [
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
    ],
    desktopWallets: [
      {
        id: "metamask",
        name: "MetaMask",
        links: {
          native: "metamask:",
          universal: "https://metamask.io",
        },
      },
    ],
    features: {
      analytics: true,
      onramp: true,
      swaps: true,
      email: true,
      socials: ["google", "apple", "facebook", "github", "discord"],
    },
  })
}

export function Web3Modal({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: State
}) {
  // Always provide WagmiProvider with the config
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>{children}</WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
