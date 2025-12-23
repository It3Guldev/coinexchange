import { defaultWagmiConfig } from "@web3modal/wagmi/react/config"
import { cookieStorage, createStorage } from "wagmi"
import { mainnet, arbitrum, polygon, optimism, base, bsc } from "wagmi/chains"

// Get projectId from environment variables
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Only create config if we have a valid project ID
export const hasValidProjectId = Boolean(projectId && projectId !== "demo-project-id")

const metadata = {
  name: "CoinExchange.Cash",
  description: "Non-custodial crypto trading platform with the best rates",
  url: "https://coinexchange.cash",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
}

// Create wagmiConfig - always provide a config, even if minimal
const chains = [mainnet, arbitrum, polygon, optimism, base, bsc] as const

export const config = hasValidProjectId
  ? defaultWagmiConfig({
      chains,
      projectId: projectId!,
      metadata,
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
      enableWalletConnect: true,
      enableInjected: true,
      enableEIP6963: true,
      enableCoinbase: true,
      auth: {
        email: true,
        socials: ["google", "x", "github", "discord", "apple", "facebook"],
        showWallets: true,
        walletFeatures: true,
      },
    })
  : defaultWagmiConfig({
      chains,
      projectId: "minimal-config", // This won't be used for WalletConnect
      metadata,
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
      enableWalletConnect: false, // Disable WalletConnect when no valid project ID
      enableInjected: true, // Keep injected wallets working
      enableEIP6963: true,
      enableCoinbase: false, // Disable Coinbase wallet without valid project ID
    })
