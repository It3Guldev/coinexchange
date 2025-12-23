import { defaultWagmiConfig } from "@web3modal/wagmi/react/config"
import { cookieStorage, createStorage } from "wagmi"
import { mainnet, arbitrum, polygon, optimism, base, bsc } from "wagmi/chains"

// Get projectId from environment variables
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

// Only create config if we have a valid project ID
export const hasValidProjectId = Boolean(
  projectId && 
  projectId !== "demo-project-id" && 
  projectId.length === 32 // Standard WalletConnect project ID length
)

const metadata = {
  name: "CoinExchange.Cash",
  description: "Non-custodial crypto trading platform with the best rates",
  url: "https://coinexchange.cash",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
}

// Create wagmiConfig with proper error handling
const chains = [mainnet, arbitrum, polygon, optimism, base, bsc] as const

const defaultConfig = {
  chains,
  projectId: hasValidProjectId ? projectId : "00000000000000000000000000000000", // Fallback dummy ID
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  // Disable features that require WalletConnect when no valid project ID
  enableWalletConnect: hasValidProjectId,
  enableEmail: hasValidProjectId,
  enableAuth: hasValidProjectId,
  // Configure relay URL for better reliability
  relayUrl: hasValidProjectId ? 'wss://relay.walletconnect.com' : undefined,
  // Disable analytics in development
  enableAnalytics: process.env.NODE_ENV === 'production' && hasValidProjectId,
}

export const config = defaultWagmiConfig(defaultConfig)

// Add error handling for WalletConnect initialization
if (typeof window !== 'undefined' && hasValidProjectId) {
  config._internal.setOptions({
    ...config._internal.options,
    // Add retry logic for connection issues
    retryCount: 3,
    retryDelay: 1000,
  }).catch((error) => {
    console.warn('Failed to initialize WalletConnect with options:', error)
  })
}
