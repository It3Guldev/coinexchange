import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { CurrencyProvider } from "@/contexts/currency-context"
import { Web3Modal } from "@/components/web3-modal"
// Added new provider imports
import { AuthProvider } from "@/contexts/auth-context"
import { KYCProvider } from "@/contexts/kyc-context"
import { P2PProvider } from "@/contexts/p2p-context"
import { EscrowProvider } from "@/contexts/escrow-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "CoinExchange.Cash - Non-Custodial Crypto Trading Platform",
  description:
    "Buy, sell, swap, send and receive cryptocurrencies with the best rates. Non-custodial trading across 70+ DEXs and 60+ blockchains.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body suppressHydrationWarning={true}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CurrencyProvider>
            <Web3Modal>
              {/* Added all new providers in proper nesting order */}
              <AuthProvider>
                <KYCProvider>
                  <P2PProvider>
                    <EscrowProvider>{children}</EscrowProvider>
                  </P2PProvider>
                </KYCProvider>
              </AuthProvider>
            </Web3Modal>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
