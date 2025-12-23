"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, CheckCircle, Clock, User, Phone, MapPin, CreditCard, FileText, ArrowLeft, Upload } from "lucide-react"
import { useKYC } from "@/contexts/kyc-context"

interface KYCVerificationProps {
  onBack: () => void
}

export default function KYCVerification({ onBack }: KYCVerificationProps) {
  const {
    kycData,
    verificationStatus,
    isLoading,
    updateKYCData,
    submitForVerification,
    getVerificationLevel,
    getTrustScore,
  } = useKYC()

  const [activeTab, setActiveTab] = useState("overview")
  const [formData, setFormData] = useState(() => ({
    ...kycData,
    address: {
      street: kycData.address?.street || "",
      city: kycData.address?.city || "",
      state: kycData.address?.state || "",
      postalCode: kycData.address?.postalCode || "",
      country: kycData.address?.country || "",
      ...kycData.address
    },
    driversLicense: {
      number: kycData.driversLicense?.number || "",
      state: kycData.driversLicense?.state || "",
      country: kycData.driversLicense?.country || "",
      expiryDate: kycData.driversLicense?.expiryDate || "",
      ...kycData.driversLicense
    },
    passport: {
      number: kycData.passport?.number || "",
      country: kycData.passport?.country || "",
      issueDate: kycData.passport?.issueDate || "",
      expiryDate: kycData.passport?.expiryDate || "",
      ...kycData.passport
    }
  }))
  const [message, setMessage] = useState("")

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...kycData,
      address: {
        street: kycData.address?.street || "",
        city: kycData.address?.city || "",
        state: kycData.address?.state || "",
        postalCode: kycData.address?.postalCode || "",
        country: kycData.address?.country || "",
        ...kycData.address
      },
      driversLicense: {
        number: kycData.driversLicense?.number || "",
        state: kycData.driversLicense?.state || "",
        country: kycData.driversLicense?.country || "",
        expiryDate: kycData.driversLicense?.expiryDate || "",
        ...kycData.driversLicense
      },
      passport: {
        number: kycData.passport?.number || "",
        country: kycData.passport?.country || "",
        issueDate: kycData.passport?.issueDate || "",
        expiryDate: kycData.passport?.expiryDate || "",
        ...kycData.passport
      }
    }))
  }, [kycData])

  const handleSave = async (section: string) => {
    const result = await updateKYCData(formData)
    if (result.success) {
      setMessage("Information saved successfully")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleVerify = async (field: keyof typeof verificationStatus) => {
    const result = await submitForVerification(field)
    if (result.success) {
      setMessage(`${field} verification submitted successfully`)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const VerificationBadge = ({ verified, pending = false }: { verified: boolean; pending?: boolean }) => {
    if (verified) {
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle className="w-3 h-3" />
          Verified
        </Badge>
      )
    }
    if (pending) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>
      )
    }
    return <Badge variant="outline">Not Verified</Badge>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Identity Verification</h1>
          <p className="text-muted-foreground">Verify your identity to increase trust and trading limits</p>
        </div>
      </div>

      {message && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <Shield className="w-8 h-8 mx-auto text-blue-600" />
            <CardTitle>Verification Level</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-3xl font-bold">{getVerificationLevel()}%</div>
            <Progress value={getVerificationLevel()} className="w-full" />
            <p className="text-sm text-muted-foreground">
              {verificationStatus.overall === "complete"
                ? "Fully Verified"
                : verificationStatus.overall === "partial"
                  ? "Partially Verified"
                  : "Not Verified"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-green-600" />
            <CardTitle>Trust Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-3xl font-bold">{getTrustScore()}</div>
            <p className="text-sm text-muted-foreground">Higher scores increase P2P trading opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <FileText className="w-8 h-8 mx-auto text-purple-600" />
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-3xl font-bold">{Object.values(verificationStatus).filter(Boolean).length - 1}/7</div>
            <p className="text-sm text-muted-foreground">Verified documents</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Track your verification progress across all categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Personal Information</div>
                      <div className="text-sm text-muted-foreground">Name, date of birth, nationality</div>
                    </div>
                  </div>
                  <VerificationBadge verified={verificationStatus.identity} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">Phone Number</div>
                      <div className="text-sm text-muted-foreground">SMS verification required</div>
                    </div>
                  </div>
                  <VerificationBadge verified={verificationStatus.phone} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-sm text-muted-foreground">Proof of residence required</div>
                    </div>
                  </div>
                  <VerificationBadge verified={verificationStatus.address} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="font-medium">Driver's License</div>
                      <div className="text-sm text-muted-foreground">Government-issued ID</div>
                    </div>
                  </div>
                  <VerificationBadge verified={verificationStatus.driversLicense} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-medium">Passport</div>
                      <div className="text-sm text-muted-foreground">International identification</div>
                    </div>
                  </div>
                  <VerificationBadge verified={verificationStatus.passport} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Provide your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ""}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ""}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select
                    value={formData.nationality || ""}
                    onValueChange={(value) => setFormData({ ...formData, nationality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="MX">Mexico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleSave("personal")} disabled={isLoading}>
                  Save Information
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerify("identity")}
                  disabled={isLoading || !formData.firstName || !formData.lastName}
                >
                  Submit for Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Verify your phone number and address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneCountryCode">Country Code</Label>
                  <Select
                    value={formData.phoneCountryCode || ""}
                    onValueChange={(value) => setFormData({ ...formData, phoneCountryCode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="+1" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">+1 (US/CA)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+61">+61 (AU)</SelectItem>
                      <SelectItem value="+49">+49 (DE)</SelectItem>
                      <SelectItem value="+33">+33 (FR)</SelectItem>
                      <SelectItem value="+81">+81 (JP)</SelectItem>
                      <SelectItem value="+52">+52 (MX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Address</h4>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address?.street || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    placeholder="Enter your street address"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.address?.city || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value },
                        })
                      }
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.address?.state || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value },
                        })
                      }
                      placeholder="Enter your state/province"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.address?.postalCode || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, postalCode: e.target.value },
                        })
                      }
                      placeholder="Enter your postal code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.address?.country || ""}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, country: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="MX">Mexico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleSave("contact")} disabled={isLoading}>
                  Save Information
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerify("phone")}
                  disabled={isLoading || !formData.phoneNumber}
                >
                  Verify Phone
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerify("address")}
                  disabled={isLoading || !formData.address?.street}
                >
                  Verify Address
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Driver's License</CardTitle>
                <CardDescription>Upload your government-issued driver's license</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dlNumber">License Number</Label>
                  <Input
                    id="dlNumber"
                    value={formData.driversLicense?.number || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        driversLicense: { ...formData.driversLicense, number: e.target.value },
                      })
                    }
                    placeholder="Enter license number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dlState">State</Label>
                    <Input
                      id="dlState"
                      value={formData.driversLicense?.state || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          driversLicense: { ...formData.driversLicense, state: e.target.value },
                        })
                      }
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dlCountry">Country</Label>
                    <Input
                      id="dlCountry"
                      value={formData.driversLicense?.country || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          driversLicense: { ...formData.driversLicense, country: e.target.value },
                        })
                      }
                      placeholder="Country"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dlExpiry">Expiry Date</Label>
                  <Input
                    id="dlExpiry"
                    type="date"
                    value={formData.driversLicense?.expiryDate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        driversLicense: { ...formData.driversLicense, expiryDate: e.target.value },
                      })
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                  onClick={() => handleVerify("driversLicense")}
                  disabled={isLoading || !formData.driversLicense?.number}
                >
                  <Upload className="w-4 h-4" />
                  Submit for Verification
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Passport</CardTitle>
                <CardDescription>Upload your international passport</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    value={formData.passport?.number || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passport: { ...formData.passport, number: e.target.value },
                      })
                    }
                    placeholder="Enter passport number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportCountry">Country of Issue</Label>
                  <Input
                    id="passportCountry"
                    value={formData.passport?.country || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passport: { ...formData.passport, country: e.target.value },
                      })
                    }
                    placeholder="Country of issue"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passportIssue">Issue Date</Label>
                    <Input
                      id="passportIssue"
                      type="date"
                      value={formData.passport?.issueDate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passport: { ...formData.passport, issueDate: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportExpiry">Expiry Date</Label>
                    <Input
                      id="passportExpiry"
                      type="date"
                      value={formData.passport?.expiryDate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passport: { ...formData.passport, expiryDate: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                  onClick={() => handleVerify("passport")}
                  disabled={isLoading || !formData.passport?.number}
                >
                  <Upload className="w-4 h-4" />
                  Submit for Verification
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
              <CardDescription>Optional employment details for enhanced verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation || ""}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="Enter your occupation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employer">Employer</Label>
                  <Input
                    id="employer"
                    value={formData.employer || ""}
                    onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                    placeholder="Enter your employer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="annualIncome">Annual Income Range</Label>
                <Select
                  value={formData.annualIncome || ""}
                  onValueChange={(value) => setFormData({ ...formData, annualIncome: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-25k">Under $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                    <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
                    <SelectItem value="over-500k">Over $500,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSave("employment")} disabled={isLoading}>
                  Save Information
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerify("employment")}
                  disabled={isLoading || !formData.occupation}
                >
                  Submit for Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
