"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Trash2,
  Edit,
  Plus,
  Settings,
  Users,
  CreditCard,
  AlertTriangle,
  FileText,
  Gavel,
  User,
  Shield,
  TrendingUp,
  Star,
  Eye,
  MessageSquare,
  Ban,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentMethod {
  id: string
  name: string
  description: string
  enabled: boolean
  processingTime: string
  fees: string
}

interface DisputedTrade {
  id: string
  tradeId: string
  buyerName: string
  sellerName: string
  cryptocurrency: string
  amount: number
  fiatCurrency: string
  totalValue: number
  status: "dispute_review" | "cancelled"
  disputeReason: string
  buyerEvidence: string[]
  sellerEvidence: string[]
  adminNotes: string
  createdAt: Date
}

const AdminPanel = () => {
  const { toast } = useToast()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      name: "Bank Transfer",
      description: "Direct bank to bank transfer",
      enabled: true,
      processingTime: "1-3 business days",
      fees: "0.5%",
    },
    {
      id: "2",
      name: "PayPal",
      description: "PayPal payment processing",
      enabled: true,
      processingTime: "Instant",
      fees: "2.9%",
    },
    { id: "3", name: "Zelle", description: "Zelle quick pay", enabled: true, processingTime: "Instant", fees: "0%" },
    {
      id: "4",
      name: "Wise",
      description: "Wise international transfers",
      enabled: true,
      processingTime: "1-2 business days",
      fees: "1.2%",
    },
    {
      id: "5",
      name: "Cash App",
      description: "Cash App payments",
      enabled: true,
      processingTime: "Instant",
      fees: "1.5%",
    },
    { id: "6", name: "Venmo", description: "Venmo payments", enabled: true, processingTime: "Instant", fees: "1.9%" },
    {
      id: "7",
      name: "Cash Deposit",
      description: "Physical cash deposit at locations",
      enabled: true,
      processingTime: "1-2 hours",
      fees: "2%",
    },
  ])

  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [newMethod, setNewMethod] = useState<Partial<PaymentMethod>>({
    name: "",
    description: "",
    enabled: true,
    processingTime: "",
    fees: "",
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [disputedTrades] = useState<DisputedTrade[]>([
    {
      id: "dispute_1",
      tradeId: "trade_123",
      buyerName: "John Doe",
      sellerName: "Jane Smith",
      cryptocurrency: "BTC",
      amount: 0.05,
      fiatCurrency: "USD",
      totalValue: 2500,
      status: "dispute_review",
      disputeReason: "Seller claims payment not received, buyer claims payment sent",
      buyerEvidence: ["Payment receipt screenshot", "Bank statement"],
      sellerEvidence: ["Account balance screenshot"],
      adminNotes: "",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "dispute_2",
      tradeId: "trade_456",
      buyerName: "Mike Johnson",
      sellerName: "Sarah Wilson",
      cryptocurrency: "ETH",
      amount: 1.5,
      fiatCurrency: "EUR",
      totalValue: 3200,
      status: "dispute_review",
      disputeReason: "Cancellation request declined by buyer",
      buyerEvidence: ["Trade agreement screenshot"],
      sellerEvidence: ["Cancellation request timestamp"],
      adminNotes: "",
      createdAt: new Date("2024-01-14"),
    },
  ])

  const [selectedDispute, setSelectedDispute] = useState<DisputedTrade | null>(null)
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false)
  const [adminDecision, setAdminDecision] = useState<"buyer" | "seller" | null>(null)
  const [adminNotes, setAdminNotes] = useState("")

  const handleAddMethod = () => {
    if (!newMethod.name || !newMethod.description) return

    const method: PaymentMethod = {
      id: Date.now().toString(),
      name: newMethod.name,
      description: newMethod.description,
      enabled: newMethod.enabled ?? true,
      processingTime: newMethod.processingTime || "Instant",
      fees: newMethod.fees || "0%",
    }

    setPaymentMethods([...paymentMethods, method])
    setNewMethod({ name: "", description: "", enabled: true, processingTime: "", fees: "" })
    setIsAddDialogOpen(false)
  }

  const handleEditMethod = () => {
    if (!editingMethod) return

    setPaymentMethods(paymentMethods.map((method) => (method.id === editingMethod.id ? editingMethod : method)))
    setEditingMethod(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
  }

  const toggleMethodStatus = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => (method.id === id ? { ...method, enabled: !method.enabled } : method)),
    )
  }

  const handleResolveDispute = (tradeId: string, decision: "buyer" | "seller") => {
    toast({
      title: "Dispute Resolved",
      description: `Escrow released to ${decision}. Both parties have been notified.`,
    })
    setIsDisputeDialogOpen(false)
    setSelectedDispute(null)
    setAdminDecision(null)
    setAdminNotes("")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage CoinExchange.Cash platform settings</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Settings className="w-4 h-4 mr-2" />
          Administrator
        </Badge>
      </div>

      <Tabs defaultValue="payment-methods" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payment-methods" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="disputes" className="flex items-center gap-2">
            <Gavel className="w-4 h-4" />
            Disputed Trades
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Platform Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="disputes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Disputed Trades</h2>
              <p className="text-muted-foreground">Review and resolve trade disputes</p>
            </div>
            <Badge variant="destructive" className="px-3 py-1">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {disputedTrades.length} Active Disputes
            </Badge>
          </div>

          <div className="grid gap-4">
            {disputedTrades.map((dispute) => (
              <Card key={dispute.id} className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">Trade #{dispute.tradeId}</CardTitle>
                    <Badge variant="destructive">{dispute.status.replace("_", " ").toUpperCase()}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDispute(dispute)
                      setIsDisputeDialogOpen(true)
                    }}
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {dispute.amount} {dispute.cryptocurrency} ({dispute.fiatCurrency}{" "}
                        {dispute.totalValue.toLocaleString()})
                      </span>
                      <span className="text-muted-foreground">{dispute.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <span>
                        <strong>Buyer:</strong> {dispute.buyerName}
                      </span>
                      <span>
                        <strong>Seller:</strong> {dispute.sellerName}
                      </span>
                    </div>
                    <CardDescription>{dispute.disputeReason}</CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        Buyer Evidence: {dispute.buyerEvidence.length}
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        Seller Evidence: {dispute.sellerEvidence.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Dispute Resolution - Trade #{selectedDispute?.tradeId}</DialogTitle>
                <DialogDescription>
                  Review evidence from both parties and make a decision on escrow release
                </DialogDescription>
              </DialogHeader>
              {selectedDispute && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-600">Buyer: {selectedDispute.buyerName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <Label className="font-medium">Evidence Submitted:</Label>
                            <ul className="mt-2 space-y-1">
                              {selectedDispute.buyerEvidence.map((evidence, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-center">
                                  <FileText className="w-4 h-4 mr-2" />
                                  {evidence}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-green-600">Seller: {selectedDispute.sellerName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <Label className="font-medium">Evidence Submitted:</Label>
                            <ul className="mt-2 space-y-1">
                              {selectedDispute.sellerEvidence.map((evidence, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-center">
                                  <FileText className="w-4 h-4 mr-2" />
                                  {evidence}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Trade Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Amount:</strong> {selectedDispute.amount} {selectedDispute.cryptocurrency}
                        </div>
                        <div>
                          <strong>Value:</strong> {selectedDispute.fiatCurrency}{" "}
                          {selectedDispute.totalValue.toLocaleString()}
                        </div>
                        <div>
                          <strong>Dispute Reason:</strong> {selectedDispute.disputeReason}
                        </div>
                        <div>
                          <strong>Date:</strong> {selectedDispute.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Admin Decision</Label>
                      <div className="flex space-x-4 mt-2">
                        <Button
                          variant={adminDecision === "buyer" ? "default" : "outline"}
                          onClick={() => setAdminDecision("buyer")}
                          className="flex-1"
                        >
                          Release Escrow to Buyer
                        </Button>
                        <Button
                          variant={adminDecision === "seller" ? "default" : "outline"}
                          onClick={() => setAdminDecision("seller")}
                          className="flex-1"
                        >
                          Release Escrow to Seller
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminNotes">Admin Notes (Required)</Label>
                      <Textarea
                        id="adminNotes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Explain your decision and reasoning for both parties..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDisputeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    selectedDispute && adminDecision && handleResolveDispute(selectedDispute.tradeId, adminDecision)
                  }
                  disabled={!adminDecision || !adminNotes.trim()}
                >
                  Resolve Dispute
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Payment Methods</h2>
              <p className="text-muted-foreground">Manage available payment methods for P2P trading</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Payment Method</DialogTitle>
                  <DialogDescription>Create a new payment method for P2P trading</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Method Name</Label>
                    <Input
                      id="name"
                      value={newMethod.name}
                      onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                      placeholder="e.g., Apple Pay"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newMethod.description}
                      onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                      placeholder="Brief description of the payment method"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="processingTime">Processing Time</Label>
                      <Input
                        id="processingTime"
                        value={newMethod.processingTime}
                        onChange={(e) => setNewMethod({ ...newMethod, processingTime: e.target.value })}
                        placeholder="e.g., Instant"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fees">Fees</Label>
                      <Input
                        id="fees"
                        value={newMethod.fees}
                        onChange={(e) => setNewMethod({ ...newMethod, fees: e.target.value })}
                        placeholder="e.g., 2.5%"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enabled"
                      checked={newMethod.enabled}
                      onCheckedChange={(checked) => setNewMethod({ ...newMethod, enabled: checked })}
                    />
                    <Label htmlFor="enabled">Enable this payment method</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMethod}>Add Method</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <Badge variant={method.enabled ? "default" : "secondary"}>
                      {method.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={method.enabled} onCheckedChange={() => toggleMethodStatus(method.id)} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingMethod(method)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteMethod(method.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">{method.description}</CardDescription>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <span>Processing: {method.processingTime}</span>
                    <span>Fees: {method.fees}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Payment Method</DialogTitle>
                <DialogDescription>Update payment method details</DialogDescription>
              </DialogHeader>
              {editingMethod && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editName">Method Name</Label>
                    <Input
                      id="editName"
                      value={editingMethod.name}
                      onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea
                      id="editDescription"
                      value={editingMethod.description}
                      onChange={(e) => setEditingMethod({ ...editingMethod, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editProcessingTime">Processing Time</Label>
                      <Input
                        id="editProcessingTime"
                        value={editingMethod.processingTime}
                        onChange={(e) => setEditingMethod({ ...editingMethod, processingTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editFees">Fees</Label>
                      <Input
                        id="editFees"
                        value={editingMethod.fees}
                        onChange={(e) => setEditingMethod({ ...editingMethod, fees: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="editEnabled"
                      checked={editingMethod.enabled}
                      onCheckedChange={(checked) => setEditingMethod({ ...editingMethod, enabled: checked })}
                    />
                    <Label htmlFor="editEnabled">Enable this payment method</Label>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditMethod}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">User Management</h2>
            <p className="text-muted-foreground">Comprehensive user information and security monitoring</p>
          </div>

          <div className="grid gap-6">
            {[
              {
                id: "user_001",
                email: "john.doe@email.com",
                username: "CryptoTrader_John",
                fullName: "John Michael Doe",
                phone: "+1-555-0123",
                dateOfBirth: "1985-03-15",
                address: "123 Main St, New York, NY 10001, USA",
                driversLicense: "NY-123456789 (NY, USA)",
                passport: "US123456789 (USA, Exp: 2028-05-20)",
                ipAddress: "192.168.1.100",
                location: "New York, NY, USA",
                ipRisk: "Low",
                isScammerIP: false,
                joinDate: "2024-01-15",
                lastActive: "2024-12-08",
                tradesOpened: 45,
                tradesCompleted: 42,
                completionRate: 93.3,
                averageRating: 4.7,
                totalRatings: 38,
                verificationLevel: "Full KYC",
                accountStatus: "Active",
                trustScore: 95,
              },
              {
                id: "user_002",
                email: "sarah.wilson@email.com",
                username: "CryptoSarah",
                fullName: "Sarah Elizabeth Wilson",
                phone: "+44-20-7946-0958",
                dateOfBirth: "1990-07-22",
                address: "45 Baker Street, London, W1U 6TW, UK",
                driversLicense: "Not provided",
                passport: "GB987654321 (UK, Exp: 2026-11-10)",
                ipAddress: "81.2.69.142",
                location: "London, UK",
                ipRisk: "Medium",
                isScammerIP: false,
                joinDate: "2024-02-20",
                lastActive: "2024-12-07",
                tradesOpened: 28,
                tradesCompleted: 25,
                completionRate: 89.3,
                averageRating: 4.4,
                totalRatings: 22,
                verificationLevel: "Partial KYC",
                accountStatus: "Active",
                trustScore: 78,
              },
              {
                id: "user_003",
                email: "suspicious.trader@tempmail.com",
                username: "QuickCrypto99",
                fullName: "Not provided",
                phone: "Not provided",
                dateOfBirth: "Not provided",
                address: "Not provided",
                driversLicense: "Not provided",
                passport: "Not provided",
                ipAddress: "185.220.101.42",
                location: "Unknown (VPN/Proxy)",
                ipRisk: "High",
                isScammerIP: true,
                joinDate: "2024-12-05",
                lastActive: "2024-12-08",
                tradesOpened: 12,
                tradesCompleted: 3,
                completionRate: 25.0,
                averageRating: 2.1,
                totalRatings: 8,
                verificationLevel: "None",
                accountStatus: "Flagged",
                trustScore: 15,
              },
            ].map((user) => (
              <Card key={user.id} className={user.accountStatus === "Flagged" ? "border-red-200 bg-red-50" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.username.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.username}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          user.accountStatus === "Active"
                            ? "default"
                            : user.accountStatus === "Flagged"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {user.accountStatus}
                      </Badge>
                      <Badge
                        variant={
                          user.verificationLevel === "Full KYC"
                            ? "default"
                            : user.verificationLevel === "Partial KYC"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {user.verificationLevel}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Full Name:</span>
                        <p className="text-muted-foreground">{user.fullName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p className="text-muted-foreground">{user.phone}</p>
                      </div>
                      <div>
                        <span className="font-medium">Date of Birth:</span>
                        <p className="text-muted-foreground">{user.dateOfBirth}</p>
                      </div>
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="text-muted-foreground">{user.address}</p>
                      </div>
                      <div>
                        <span className="font-medium">Driver's License:</span>
                        <p className="text-muted-foreground">{user.driversLicense}</p>
                      </div>
                      <div>
                        <span className="font-medium">Passport:</span>
                        <p className="text-muted-foreground">{user.passport}</p>
                      </div>
                    </div>
                  </div>

                  {/* Security & Location Information */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Security & Location
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">IP Address:</span>
                        <p className="text-muted-foreground font-mono">{user.ipAddress}</p>
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>
                        <p className="text-muted-foreground">{user.location}</p>
                      </div>
                      <div>
                        <span className="font-medium">IP Risk Level:</span>
                        <Badge
                          variant={
                            user.ipRisk === "Low" ? "default" : user.ipRisk === "Medium" ? "secondary" : "destructive"
                          }
                        >
                          {user.ipRisk}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Scammer IP:</span>
                        <Badge variant={user.isScammerIP ? "destructive" : "default"}>
                          {user.isScammerIP ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Trust Score:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${user.trustScore >= 80 ? "bg-green-500" : user.trustScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${user.trustScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{user.trustScore}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trading Statistics */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Trading Statistics
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{user.tradesOpened}</p>
                        <p className="text-muted-foreground">Trades Opened</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{user.tradesCompleted}</p>
                        <p className="text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{user.completionRate}%</p>
                        <p className="text-muted-foreground">Success Rate</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Average Rating:</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= Math.floor(user.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span>{user.averageRating}/5.0</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Total Ratings:</span>
                        <p className="text-muted-foreground">{user.totalRatings} reviews</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Activity */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Account Activity
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Join Date:</span>
                        <p className="text-muted-foreground">{new Date(user.joinDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Last Active:</span>
                        <p className="text-muted-foreground">{new Date(user.lastActive).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact User
                    </Button>
                    {user.accountStatus === "Flagged" && (
                      <Button variant="destructive" size="sm">
                        <Ban className="w-4 h-4 mr-2" />
                        Suspend Account
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Platform Settings</h2>
            <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Platform settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminPanel
