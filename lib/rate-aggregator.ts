export interface RateProvider {
  name: string
  url: string
  priority: number
}

export interface TokenRate {
  symbol: string
  price: number
  change24h: number
  provider: string
  timestamp: number
}

export interface SwapQuote {
  provider: string
  inputAmount: string
  outputAmount: string
  gasEstimate: string
  priceImpact: number
  route: string[]
  fee: number
}

export class RateAggregator {
  private providers: RateProvider[] = [
    { name: "1inch", url: "https://api.1inch.dev", priority: 1 },
    { name: "CoinGecko", url: "https://api.coingecko.com", priority: 2 },
    { name: "Rango", url: "https://api.rango.exchange", priority: 3 },
    { name: "Uniswap", url: "https://api.uniswap.org", priority: 4 },
  ]

  private cache: Map<string, { data: TokenRate[]; timestamp: number }> = new Map()
  private lastApiCall = 0
  private readonly CACHE_DURATION = 60000 // 1 minute cache
  private readonly MIN_API_INTERVAL = 10000 // 10 seconds between API calls
  private readonly MAX_RETRIES = 3

  async getTokenRates(symbols: string[]): Promise<TokenRate[]> {
    const cacheKey = symbols.sort().join(",")
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log("Using cached rates")
      return cached.data
    }

    const timeSinceLastCall = Date.now() - this.lastApiCall
    if (timeSinceLastCall < this.MIN_API_INTERVAL) {
      const waitTime = this.MIN_API_INTERVAL - timeSinceLastCall
      console.log(`Rate limiting: waiting ${waitTime}ms`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    try {
      const rates = await this.fetchRatesWithRetry(symbols)

      this.cache.set(cacheKey, {
        data: rates,
        timestamp: Date.now(),
      })

      this.lastApiCall = Date.now()
      return rates
    } catch (error) {
      console.error("Failed to fetch real-time rates:", error)
      // Return cached data if available, even if expired
      if (cached) {
        console.log("Using expired cache due to API error")
        return cached.data
      }
      // Fallback to mock data with updated prices
      return this.getFallbackRates(symbols)
    }
  }

  private async fetchRatesWithRetry(symbols: string[], retryCount = 0): Promise<TokenRate[]> {
    try {
      // Map symbols to CoinGecko IDs
      const coinGeckoIds: { [key: string]: string } = {
        BTC: "bitcoin",
        ETH: "ethereum",
        USDC: "usd-coin",
        USDT: "tether",
        BNB: "binancecoin",
        ADA: "cardano",
        SOL: "solana",
        DOT: "polkadot",
        MATIC: "matic-network",
        AVAX: "avalanche-2",
      }

      const ids = symbols
        .map((symbol) => coinGeckoIds[symbol])
        .filter(Boolean)
        .join(",")

      if (!ids) {
        throw new Error("No valid symbols provided")
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      )

      if (response.status === 429) {
        if (retryCount < this.MAX_RETRIES) {
          const backoffTime = Math.pow(2, retryCount) * 5000 // 5s, 10s, 20s
          console.log(
            `Rate limited (429), retrying in ${backoffTime}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`,
          )
          await new Promise((resolve) => setTimeout(resolve, backoffTime))
          return this.fetchRatesWithRetry(symbols, retryCount + 1)
        } else {
          throw new Error(`CoinGecko API rate limit exceeded after ${this.MAX_RETRIES} retries`)
        }
      }

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()

      const rates: TokenRate[] = symbols.map((symbol) => {
        const coinId = coinGeckoIds[symbol]
        const coinData = data[coinId]

        if (!coinData) {
          // Fallback to mock data if API fails for specific coin
          return this.getFallbackRate(symbol)
        }

        return {
          symbol,
          price: coinData.usd || 0,
          change24h: coinData.usd_24h_change || 0,
          provider: "CoinGecko",
          timestamp: Date.now(),
        }
      })

      return rates
    } catch (error) {
      if (retryCount < this.MAX_RETRIES && error.message.includes("429")) {
        const backoffTime = Math.pow(2, retryCount) * 5000
        console.log(`Retrying after error: ${error.message} (attempt ${retryCount + 1}/${this.MAX_RETRIES})`)
        await new Promise((resolve) => setTimeout(resolve, backoffTime))
        return this.fetchRatesWithRetry(symbols, retryCount + 1)
      }
      throw error
    }
  }

  private getFallbackRate(symbol: string): TokenRate {
    const fallbackRates: { [key: string]: TokenRate } = {
      BTC: {
        symbol: "BTC",
        price: 95420.5,
        change24h: 1.85,
        provider: "Fallback",
        timestamp: Date.now(),
      },
      ETH: {
        symbol: "ETH",
        price: 3342.75,
        change24h: -0.92,
        provider: "Fallback",
        timestamp: Date.now(),
      },
      USDC: {
        symbol: "USDC",
        price: 1.0001,
        change24h: 0.01,
        provider: "Fallback",
        timestamp: Date.now(),
      },
      USDT: {
        symbol: "USDT",
        price: 0.9998,
        change24h: -0.02,
        provider: "Fallback",
        timestamp: Date.now(),
      },
      BNB: {
        symbol: "BNB",
        price: 695.32,
        change24h: 2.14,
        provider: "Fallback",
        timestamp: Date.now(),
      },
      ADA: {
        symbol: "ADA",
        price: 1.08,
        change24h: 3.45,
        provider: "Fallback",
        timestamp: Date.now(),
      },
      SOL: {
        symbol: "SOL",
        price: 245.67,
        change24h: 4.21,
        provider: "Fallback",
        timestamp: Date.now(),
      },
      DOT: {
        symbol: "DOT",
        price: 8.92,
        change24h: -1.34,
        provider: "Fallback",
        timestamp: Date.now(),
      },
      MATIC: {
        symbol: "MATIC",
        price: 0.52,
        change24h: 2.87,
        provider: "Fallback",
        timestamp: Date.now(),
      },
      AVAX: {
        symbol: "AVAX",
        price: 42.18,
        change24h: 1.56,
        provider: "Fallback",
        timestamp: Date.now(),
      },
    }

    return (
      fallbackRates[symbol] || {
        symbol,
        price: 0,
        change24h: 0,
        provider: "Fallback",
        timestamp: Date.now(),
      }
    )
  }

  private getFallbackRates(symbols: string[]): TokenRate[] {
    return symbols.map((symbol) => this.getFallbackRate(symbol))
  }

  async getSwapQuotes(fromToken: string, toToken: string, amount: string): Promise<SwapQuote[]> {
    // Simulate fetching quotes from multiple DEX aggregators
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const baseAmount = Number.parseFloat(amount)
    const quotes: SwapQuote[] = [
      {
        provider: "1inch",
        inputAmount: amount,
        outputAmount: (baseAmount * 0.998).toFixed(6),
        gasEstimate: "$12.50",
        priceImpact: 0.15,
        route: [fromToken, toToken],
        fee: 0.3,
      },
      {
        provider: "Uniswap V3",
        inputAmount: amount,
        outputAmount: (baseAmount * 0.996).toFixed(6),
        gasEstimate: "$15.20",
        priceImpact: 0.25,
        route: [fromToken, "WETH", toToken],
        fee: 0.3,
      },
      {
        provider: "Rango",
        inputAmount: amount,
        outputAmount: (baseAmount * 0.999).toFixed(6),
        gasEstimate: "$10.80",
        priceImpact: 0.12,
        route: [fromToken, toToken],
        fee: 0.25,
      },
      {
        provider: "Paraswap",
        inputAmount: amount,
        outputAmount: (baseAmount * 0.997).toFixed(6),
        gasEstimate: "$11.30",
        priceImpact: 0.18,
        route: [fromToken, "USDC", toToken],
        fee: 0.35,
      },
    ]

    // Sort by best output amount
    return quotes.sort((a, b) => Number.parseFloat(b.outputAmount) - Number.parseFloat(a.outputAmount))
  }

  async getBestBuyRate(
    token: string,
    amount: string,
  ): Promise<{
    rate: number
    provider: string
    fee: number
    total: number
  }> {
    // Simulate fetching buy rates from multiple fiat-to-crypto providers
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Get current price for the token
    const currentRates = await this.getTokenRates([token])
    const currentPrice = currentRates[0]?.price || 95000 // Default to BTC price if not found

    const rates = [
      { provider: "Moonpay", rate: currentPrice * 0.999, fee: 3.5, total: Number.parseFloat(amount) * 1.035 },
      { provider: "Transak", rate: currentPrice * 0.9985, fee: 3.0, total: Number.parseFloat(amount) * 1.03 },
      { provider: "Ramp", rate: currentPrice * 1.0005, fee: 2.9, total: Number.parseFloat(amount) * 1.029 },
      { provider: "Banxa", rate: currentPrice * 0.998, fee: 3.2, total: Number.parseFloat(amount) * 1.032 },
    ]

    return rates.sort((a, b) => a.total - b.total)[0]
  }

  async getBestSellRate(
    token: string,
    amount: string,
  ): Promise<{
    rate: number
    provider: string
    fee: number
    net: number
  }> {
    // Simulate fetching sell rates from multiple crypto-to-fiat providers
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Get current price for the token
    const currentRates = await this.getTokenRates([token])
    const currentPrice = currentRates[0]?.price || 95000 // Default to BTC price if not found

    const rates = [
      { provider: "Coinbase", rate: currentPrice * 0.998, fee: 1.5, net: Number.parseFloat(amount) * 0.985 },
      { provider: "Kraken", rate: currentPrice * 0.9985, fee: 1.2, net: Number.parseFloat(amount) * 0.988 },
      { provider: "Binance", rate: currentPrice * 0.997, fee: 1.0, net: Number.parseFloat(amount) * 0.99 },
      { provider: "Gemini", rate: currentPrice * 0.9975, fee: 1.3, net: Number.parseFloat(amount) * 0.987 },
    ]

    return rates.sort((a, b) => b.net - a.net)[0]
  }
}

export const rateAggregator = new RateAggregator()
