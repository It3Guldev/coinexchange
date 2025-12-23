"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CurrencyContextType {
  currency: string
  setCurrency: (currency: string) => void
  country: string
  setCountry: (country: string) => void
  language: string
  setLanguage: (language: string) => void
  formatCurrency: (amount: number) => string
  getCurrencySymbol: () => string
  convertPrice: (amount: number, fromCurrency: string) => number
  formatPrice: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState("USD")
  const [country, setCountry] = useState("US")
  const [language, setLanguage] = useState("en")

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem("preferred-currency")
    const savedCountry = localStorage.getItem("preferred-country")
    const savedLanguage = localStorage.getItem("preferred-language")

    if (savedCurrency) setCurrency(savedCurrency)
    if (savedCountry) setCountry(savedCountry)
    if (savedLanguage) setLanguage(savedLanguage)
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("preferred-currency", currency)
  }, [currency])

  useEffect(() => {
    localStorage.setItem("preferred-country", country)
  }, [country])

  useEffect(() => {
    localStorage.setItem("preferred-language", language)
  }, [language])

  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      CHF: "CHF",
      CNY: "¥",
      MXN: "$",
    }
    return symbols[currency] || "$"
  }

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol()
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return 1

    // Mock exchange rates relative to USD
    const rates: Record<string, number> = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
      MXN: 18.5,
    }

    const fromRate = rates[fromCurrency] || 1
    const toRate = rates[toCurrency] || 1

    return toRate / fromRate
  }

  const convertPrice = (amount: number, fromCurrency: string): number => {
    const rate = getExchangeRate(fromCurrency, currency)
    return amount * rate
  }

  const formatPrice = (amount: number): string => {
    return formatCurrency(amount)
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        country,
        setCountry,
        language,
        setLanguage,
        formatCurrency,
        getCurrencySymbol,
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
