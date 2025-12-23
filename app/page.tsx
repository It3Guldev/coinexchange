"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wallet,
  ArrowUpDown,
  Send,
  TrendingUp,
  Shield,
  Settings,
  User,
  Users,
  Gavel,
  LogIn,
  UserCog,
} from "lucide-react"
import BuyCrypto from "@/components/buy-crypto"
import SellCrypto from "@/components/sell-crypto"
import CryptoSwap from "@/components/crypto-swap"
import SendReceive from "@/components/send-receive"
import RateMonitor from "@/components/rate-monitor"
import PortfolioOverview from "@/components/portfolio-overview"
import TradingAnalytics from "@/components/trading-analytics"
import UserSettings from "@/components/user-settings"
// Added new component imports
import KYCVerification from "@/components/kyc-verification"
import P2PMarketplace from "@/components/p2p-marketplace"
import EscrowManagement from "@/components/escrow-management"
import AuthModal from "@/components/auth-modal"
import AdminPanel from "@/components/admin-panel"
import { useWallet } from "@/contexts/wallet-context"
// Added new context imports
import { useAuth } from "@/contexts/auth-context"
import { useKYC } from "@/contexts/kyc-context"

type ViewMode = "dashboard" | "buy" | "sell" | "swap" | "transfer" | "settings" | "kyc" | "p2p" | "escrow" | "admin"

export default function CryptoPlatform() {
  const { isConnected, address, balance, connect, disconnect } = useWallet()
  // Added auth context usage
  const { isAuthenticated, user, logout } = useAuth()
  const { getTrustScore, getVerificationLevel } = useKYC()
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard")
  // Added auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false)

  const renderCurrentView = () => {
    switch (currentView) {
      case "buy":
        return <BuyCrypto onBack={() => setCurrentView("dashboard")} />
      case "sell":
        return <SellCrypto onBack={() => setCurrentView("dashboard")} />
      case "swap":
        return <CryptoSwap onBack={() => setCurrentView("dashboard")} />
      case "transfer":
        return <SendReceive onBack={() => setCurrentView("dashboard")} />
      case "settings":
        return <UserSettings onBack={() => setCurrentView("dashboard")} />
      // Added new view cases
      case "kyc":
        return <KYCVerification onBack={() => setCurrentView("dashboard")} />
      case "p2p":
        return <P2PMarketplace onBack={() => setCurrentView("dashboard")} />
      case "escrow":
        return <EscrowManagement onBack={() => setCurrentView("dashboard")} />
      case "admin":
        return <AdminPanel />
      default:
        return renderDashboard()
    }
  }

  const renderDashboard = () => {
    // Updated welcome screen to mention all features
    if (!isConnected && !isAuthenticated) {
      return (
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Trade Crypto with the Best Rates</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Buy, sell, swap, send and receive cryptocurrencies with zero custody risk. Access the best rates across
              70+ DEXs and 60+ blockchains. Trade P2P with verified users using secure escrow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader className="pb-3">
                <TrendingUp className="w-8 h-8 mx-auto text-green-600" />
                <CardTitle className="text-lg">Best Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Aggregated rates from 70+ DEXs for optimal pricing</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <ArrowUpDown className="w-8 h-8 mx-auto text-blue-600" />
                <CardTitle className="text-lg">Instant Swaps</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Cross-chain swaps across 60+ blockchains instantly</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <Shield className="w-8 h-8 mx-auto text-purple-600" />
                <CardTitle className="text-lg">Non-Custodial</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Your keys, your crypto. We never hold your funds</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <Users className="w-8 h-8 mx-auto text-orange-600" />
                <CardTitle className="text-lg">P2P Trading</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Trade directly with users using secure escrow</CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={connect} className="gap-2 text-lg px-8 py-6">
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowAuthModal(true)}
                className="gap-2 text-lg px-8 py-6"
              >
                <LogIn className="w-5 h-5" />
                Sign In / Register
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect with 600+ wallets or sign in with email, Google, Apple, and more
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Trading Dashboard</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {address && (
                <span>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              )}
              {balance && <span>• {balance}</span>}
              {/* Added user info and trust score display */}
              {user && <span>• {user.email}</span>}
              {isAuthenticated && (
                <span>
                  • Trust Score: {getTrustScore()} • Verification: {getVerificationLevel()}%
                </span>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Connected
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="rates">Live Rates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Updated quick actions to include new features */}
            <div className="grid lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("buy")}>
                <CardHeader className="text-center pb-3">
                  <TrendingUp className="w-8 h-8 mx-auto text-green-600" />
                  <CardTitle>Buy Crypto</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">Purchase crypto with fiat currency</CardDescription>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("sell")}>
                <CardHeader className="text-center pb-3">
                  <TrendingUp className="w-8 h-8 mx-auto text-red-600 rotate-180" />
                  <CardTitle>Sell Crypto</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">Convert crypto to fiat currency</CardDescription>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("swap")}>
                <CardHeader className="text-center pb-3">
                  <ArrowUpDown className="w-8 h-8 mx-auto text-blue-600" />
                  <CardTitle>Swap Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">Exchange between cryptocurrencies</CardDescription>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView("transfer")}
              >
                <CardHeader className="text-center pb-3">
                  <Send className="w-8 h-8 mx-auto text-purple-600" />
                  <CardTitle>Send & Receive</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">Transfer crypto to any address</CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Added new feature cards */}
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("p2p")}>
                <CardHeader className="text-center pb-3">
                  <Users className="w-8 h-8 mx-auto text-orange-600" />
                  <CardTitle>P2P Marketplace</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">Trade directly with other users</CardDescription>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView("escrow")}
              >
                <CardHeader className="text-center pb-3">
                  <Gavel className="w-8 h-8 mx-auto text-indigo-600" />
                  <CardTitle>Escrow Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">Secure smart contract escrow</CardDescription>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("kyc")}>
                <CardHeader className="text-center pb-3">
                  <User className="w-8 h-8 mx-auto text-teal-600" />
                  <CardTitle>Identity Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">Verify identity for higher trust</CardDescription>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your trading overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">$14,685.96</div>
                    <div className="text-sm text-muted-foreground">Portfolio Value</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">23</div>
                    <div className="text-sm text-muted-foreground">Total Trades</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{getTrustScore()}</div>
                    <div className="text-sm text-muted-foreground">Trust Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{getVerificationLevel()}%</div>
                    <div className="text-sm text-muted-foreground">Verified</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioOverview onAssetClick={(symbol) => console.log(`Clicked on ${symbol}`)} />
          </TabsContent>

          <TabsContent value="analytics">
            <TradingAnalytics />
          </TabsContent>

          <TabsContent value="rates">
            <RateMonitor />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">CoinExchange.Cash</h1>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              <Shield className="w-3 h-3" />
              Non-Custodial
            </Badge>

            <Button variant="ghost" size="sm" onClick={() => setCurrentView("settings")} className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>

            {(isAuthenticated || isConnected) && (
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("admin")} className="gap-2">
                <UserCog className="w-4 h-4" />
                Admin
              </Button>
            )}

            {/* Updated header to show both wallet and auth status */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}
                </Badge>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connect} className="gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{user?.email}</Badge>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowAuthModal(true)} variant="outline" className="gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{renderCurrentView()}</main>

      {/* Added auth modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
