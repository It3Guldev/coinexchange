"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface KYCData {
  // Personal Information
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  nationality?: string

  // Contact Information
  phoneNumber?: string
  phoneCountryCode?: string
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }

  // Identity Documents
  driversLicense?: {
    number: string
    state: string
    country: string
    expiryDate: string
  }

  passport?: {
    number: string
    country: string
    issueDate: string
    expiryDate: string
  }

  // Additional Documents
  socialSecurityNumber?: string
  taxId?: string

  // Employment Information (optional)
  occupation?: string
  employer?: string
  annualIncome?: string
}

export interface VerificationStatus {
  email: boolean
  phone: boolean
  address: boolean
  identity: boolean
  driversLicense: boolean
  passport: boolean
  employment: boolean
  overall: "none" | "partial" | "complete"
}

interface KYCContextType {
  kycData: KYCData
  verificationStatus: VerificationStatus
  isLoading: boolean
  updateKYCData: (data: Partial<KYCData>) => Promise<{ success: boolean; error?: string }>
  submitForVerification: (field: keyof VerificationStatus) => Promise<{ success: boolean; error?: string }>
  getVerificationLevel: () => number
  getTrustScore: () => number
  refreshVerificationStatus: () => Promise<void>
}

const KYCContext = createContext<KYCContextType | undefined>(undefined)

export function KYCProvider({ children }: { children: ReactNode }) {
  const [kycData, setKycData] = useState<KYCData>({})
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    email: false,
    phone: false,
    address: false,
    identity: false,
    driversLicense: false,
    passport: false,
    employment: false,
    overall: "none",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadKYCData()
  }, [])

  const loadKYCData = async () => {
    try {
      setIsLoading(true)
      // Load from localStorage for demo, would be API call in production
      const savedData = localStorage.getItem("kyc_data")
      const savedStatus = localStorage.getItem("verification_status")

      if (savedData) {
        setKycData(JSON.parse(savedData))
      }

      if (savedStatus) {
        setVerificationStatus(JSON.parse(savedStatus))
      }
    } catch (error) {
      console.error("Failed to load KYC data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateKYCData = async (data: Partial<KYCData>) => {
    try {
      const updatedData = { ...kycData, ...data }
      setKycData(updatedData)

      // Save to localStorage for demo
      localStorage.setItem("kyc_data", JSON.stringify(updatedData))

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to update KYC data" }
    }
  }

  const submitForVerification = async (field: keyof VerificationStatus) => {
    try {
      setIsLoading(true)

      // Mock third-party verification API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful verification
      const updatedStatus = {
        ...verificationStatus,
        [field]: true,
      }

      // Calculate overall status
      const verifiedFields = Object.values(updatedStatus).filter(Boolean).length - 1 // -1 for overall field
      if (verifiedFields >= 5) {
        updatedStatus.overall = "complete"
      } else if (verifiedFields >= 2) {
        updatedStatus.overall = "partial"
      }

      setVerificationStatus(updatedStatus)
      localStorage.setItem("verification_status", JSON.stringify(updatedStatus))

      return { success: true }
    } catch (error) {
      return { success: false, error: "Verification failed" }
    } finally {
      setIsLoading(false)
    }
  }

  const getVerificationLevel = () => {
    const verifiedCount = Object.entries(verificationStatus).filter(([key, value]) => key !== "overall" && value).length
    return Math.round((verifiedCount / 7) * 100)
  }

  const getTrustScore = () => {
    const weights = {
      email: 10,
      phone: 15,
      address: 20,
      identity: 25,
      driversLicense: 15,
      passport: 10,
      employment: 5,
    }

    let score = 0
    Object.entries(verificationStatus).forEach(([key, verified]) => {
      if (key !== "overall" && verified) {
        score += weights[key as keyof typeof weights] || 0
      }
    })

    return score
  }

  const refreshVerificationStatus = async () => {
    // Would check with third-party verification service
    await loadKYCData()
  }

  const value: KYCContextType = {
    kycData,
    verificationStatus,
    isLoading,
    updateKYCData,
    submitForVerification,
    getVerificationLevel,
    getTrustScore,
    refreshVerificationStatus,
  }

  return <KYCContext.Provider value={value}>{children}</KYCContext.Provider>
}

export function useKYC() {
  const context = useContext(KYCContext)
  if (context === undefined) {
    throw new Error("useKYC must be used within a KYCProvider")
  }
  return context
}
