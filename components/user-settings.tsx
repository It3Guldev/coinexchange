"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Monitor, Moon, Sun, Globe, DollarSign, Languages, Wallet } from "lucide-react"
import { useTheme } from "next-themes"
import { useCurrency } from "@/contexts/currency-context"
import { useWallet } from "@/contexts/wallet-context"
import { useState, useEffect } from "react"

interface UserSettingsProps {
  onBack: () => void
}

export default function UserSettings({ onBack }: UserSettingsProps) {
  const { theme, setTheme } = useTheme()
  const { currency, setCurrency, country, setCountry, language, setLanguage } = useCurrency()
  const { address } = useWallet()

  const [defaultReceivingAddress, setDefaultReceivingAddress] = useState("")
  const [defaultSendingAddress, setDefaultSendingAddress] = useState("")

  useEffect(() => {
    // Load saved wallet addresses from localStorage
    const savedReceiving = localStorage.getItem("defaultReceivingAddress")
    const savedSending = localStorage.getItem("defaultSendingAddress")

    if (savedReceiving) setDefaultReceivingAddress(savedReceiving)
    if (savedSending) setDefaultSendingAddress(savedSending)

    // Set connected wallet as default if no saved address
    if (address && !savedReceiving) setDefaultReceivingAddress(address)
    if (address && !savedSending) setDefaultSendingAddress(address)
  }, [address])

  const saveWalletSettings = () => {
    localStorage.setItem("defaultReceivingAddress", defaultReceivingAddress)
    localStorage.setItem("defaultSendingAddress", defaultSendingAddress)
  }

  const currencies = [
    { value: "USD", label: "US Dollar ($)", flag: "🇺🇸" },
    { value: "EUR", label: "Euro (€)", flag: "🇪🇺" },
    { value: "GBP", label: "British Pound (£)", flag: "🇬🇧" },
    { value: "JPY", label: "Japanese Yen (¥)", flag: "🇯🇵" },
    { value: "CAD", label: "Canadian Dollar (C$)", flag: "🇨🇦" },
    { value: "AUD", label: "Australian Dollar (A$)", flag: "🇦🇺" },
    { value: "CHF", label: "Swiss Franc (CHF)", flag: "🇨🇭" },
    { value: "CNY", label: "Chinese Yuan (¥)", flag: "🇨🇳" },
    { value: "MXN", label: "Mexican Peso ($)", flag: "🇲🇽" },
  ]

  const countries = [
    { value: "US", label: "United States", flag: "🇺🇸" },
    { value: "GB", label: "United Kingdom", flag: "🇬🇧" },
    { value: "CA", label: "Canada", flag: "🇨🇦" },
    { value: "AU", label: "Australia", flag: "🇦🇺" },
    { value: "DE", label: "Germany", flag: "🇩🇪" },
    { value: "FR", label: "France", flag: "🇫🇷" },
    { value: "JP", label: "Japan", flag: "🇯🇵" },
    { value: "SG", label: "Singapore", flag: "🇸🇬" },
    { value: "CH", label: "Switzerland", flag: "🇨🇭" },
    { value: "NL", label: "Netherlands", flag: "🇳🇱" },
    { value: "MX", label: "Mexico", flag: "🇲🇽" },
  ]

  const languages = [
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "es", label: "Español", flag: "🇪🇸" },
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "de", label: "Deutsch", flag: "🇩🇪" },
    { value: "it", label: "Italiano", flag: "🇮🇹" },
    { value: "pt", label: "Português", flag: "🇵🇹" },
    { value: "ru", label: "Русский", flag: "🇷🇺" },
    { value: "ja", label: "日本語", flag: "🇯🇵" },
    { value: "ko", label: "한국어", flag: "🇰🇷" },
    { value: "zh", label: "中文", flag: "🇨🇳" },
  ]

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold">User Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Display Settings
            </CardTitle>
            <CardDescription>Customize your visual experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme Mode</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Currency Settings
            </CardTitle>
            <CardDescription>Set your preferred currency for displaying prices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      <div className="flex items-center gap-2">
                        <span>{curr.flag}</span>
                        {curr.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Location Settings
            </CardTitle>
            <CardDescription>Set your country for compliance and regional features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        {country.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Language Settings
            </CardTitle>
            <CardDescription>Choose your preferred language for the interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Interface Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        {lang.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Wallet Settings
            </CardTitle>
            <CardDescription>Set default wallet addresses for trading and escrow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiving-address">Default Receiving Address</Label>
              <Input
                id="receiving-address"
                value={defaultReceivingAddress}
                onChange={(e) => setDefaultReceivingAddress(e.target.value)}
                placeholder="Enter wallet address for receiving payments"
              />
              <p className="text-xs text-muted-foreground">
                This address will be used by default for receiving escrow releases and payments
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sending-address">Default Sending Address</Label>
              <Input
                id="sending-address"
                value={defaultSendingAddress}
                onChange={(e) => setDefaultSendingAddress(e.target.value)}
                placeholder="Enter wallet address for sending payments"
              />
              <p className="text-xs text-muted-foreground">
                This address will be used by default for funding escrow contracts
              </p>
            </div>

            {address && (
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-sm text-muted-foreground">Connected Wallet</Label>
                <div className="font-mono text-sm">{address}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDefaultReceivingAddress(address)
                    setDefaultSendingAddress(address)
                  }}
                  className="mt-2"
                >
                  Use Connected Wallet as Default
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Settings */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Save Preferences</h4>
                <p className="text-sm text-muted-foreground">Your settings are automatically saved</p>
              </div>
              <Button
                onClick={() => {
                  saveWalletSettings()
                  onBack()
                }}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
