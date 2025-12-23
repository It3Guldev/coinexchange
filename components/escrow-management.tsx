"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Shield, Clock, CheckCircle, AlertTriangle, Gavel, DollarSign, FileText, Timer } from "lucide-react"
import { useEscrow, type EscrowContract, type DisputeCase } from "@/contexts/escrow-context"

interface EscrowManagementProps {
  onBack: () => void
}

export default function EscrowManagement({ onBack }: EscrowManagementProps) {
  const {
    escrows,
    disputes,
    isLoading,
    fundEscrow,
    confirmPayment,
    releaseEscrow,
    initiateDispute,
    resolveDispute,
    cancelEscrow,
  } = useEscrow()

  const [activeTab, setActiveTab] = useState("active")
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowContract | null>(null)
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null)
  const [disputeReason, setDisputeReason] = useState("")
  const [disputeEvidence, setDisputeEvidence] = useState("")
  const [arbitrationNotes, setArbitrationNotes] = useState("")
  const [message, setMessage] = useState("")

  const handleFundEscrow = async (escrowId: string) => {
    const result = await fundEscrow(escrowId)
    if (result.success) {
      setMessage("Escrow funded successfully!")
    } else {
      setMessage(result.error || "Failed to fund escrow")
    }
    setTimeout(() => setMessage(""), 3000)
  }

  const handleConfirmPayment = async (escrowId: string, role: "buyer" | "seller") => {
    const result = await confirmPayment(escrowId, role)
    if (result.success) {
      setMessage("Payment confirmed!")
    } else {
      setMessage(result.error || "Failed to confirm payment")
    }
    setTimeout(() => setMessage(""), 3000)
  }

  const handleReleaseEscrow = async (escrowId: string) => {
    const result = await releaseEscrow(escrowId)
    if (result.success) {
      setMessage("Escrow released successfully!")
    } else {
      setMessage(result.error || "Failed to release escrow")
    }
    setTimeout(() => setMessage(""), 3000)
  }

  const handleInitiateDispute = async (escrowId: string) => {
    if (!disputeReason.trim()) {
      setMessage("Please provide a reason for the dispute")
      return
    }

    const evidence = disputeEvidence.split("\n").filter((line) => line.trim())
    const result = await initiateDispute(escrowId, disputeReason, evidence)

    if (result.success) {
      setMessage("Dispute initiated successfully!")
      setDisputeReason("")
      setDisputeEvidence("")
      setSelectedEscrow(null)
    } else {
      setMessage(result.error || "Failed to initiate dispute")
    }
    setTimeout(() => setMessage(""), 3000)
  }

  const handleResolveDispute = async (disputeId: string, decision: "buyer" | "seller" | "split") => {
    const result = await resolveDispute(disputeId, decision, arbitrationNotes)
    if (result.success) {
      setMessage("Dispute resolved successfully!")
      setArbitrationNotes("")
      setSelectedDispute(null)
    } else {
      setMessage(result.error || "Failed to resolve dispute")
    }
    setTimeout(() => setMessage(""), 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "bg-blue-600"
      case "funded":
        return "bg-yellow-600"
      case "released":
        return "bg-green-600"
      case "disputed":
        return "bg-red-600"
      case "resolved":
        return "bg-purple-600"
      case "cancelled":
        return "bg-gray-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "created":
        return <Clock className="w-3 h-3" />
      case "funded":
        return <DollarSign className="w-3 h-3" />
      case "released":
        return <CheckCircle className="w-3 h-3" />
      case "disputed":
        return <AlertTriangle className="w-3 h-3" />
      case "resolved":
        return <Gavel className="w-3 h-3" />
      case "cancelled":
        return <AlertTriangle className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const getTimeRemaining = (timeoutAt: string) => {
    const now = new Date().getTime()
    const timeout = new Date(timeoutAt).getTime()
    const remaining = timeout - now

    if (remaining <= 0) return "Expired"

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m remaining`
  }

  const StatusBadge = ({ status }: { status: string }) => (
    <Badge className={`gap-1 ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )

  const activeEscrows = escrows.filter((e) => ["created", "funded"].includes(e.status))
  const completedEscrows = escrows.filter((e) => ["released", "resolved", "cancelled"].includes(e.status))
  const disputedEscrows = escrows.filter((e) => e.status === "disputed")

  if (selectedEscrow) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedEscrow(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Escrow Details</h1>
            <p className="text-muted-foreground">Manage escrow contract #{selectedEscrow.id.slice(-6)}</p>
          </div>
        </div>

        {message && (
          <Alert className={message.includes("success") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.includes("success") ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Contract Status</span>
                <StatusBadge status={selectedEscrow.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Amount</Label>
                  <div className="font-semibold">
                    {selectedEscrow.amount} {selectedEscrow.cryptocurrency}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Fiat Value</Label>
                  <div className="font-semibold">
                    {selectedEscrow.fiatAmount} {selectedEscrow.fiatCurrency}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Contract Address</Label>
                <div className="text-sm font-mono bg-muted p-2 rounded">{selectedEscrow.contractAddress}</div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Timeout</Label>
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">{getTimeRemaining(selectedEscrow.timeoutAt)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Confirmation Status</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Buyer Confirmed</span>
                    {selectedEscrow.buyerConfirmed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Seller Confirmed</span>
                    {selectedEscrow.sellerConfirmed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fee Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Escrow Fee (2%)</span>
                <span className="font-medium">${selectedEscrow.fees.escrowFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Arbitration Fee (1%)</span>
                <span className="font-medium">${selectedEscrow.fees.arbitrationFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Network Fee</span>
                <span className="font-medium">${selectedEscrow.fees.networkFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Fees</span>
                <span>
                  $
                  {(
                    selectedEscrow.fees.escrowFee +
                    selectedEscrow.fees.arbitrationFee +
                    selectedEscrow.fees.networkFee
                  ).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage this escrow contract</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedEscrow.status === "created" && (
              <Button onClick={() => handleFundEscrow(selectedEscrow.id)} disabled={isLoading} className="w-full">
                {isLoading ? "Funding..." : "Fund Escrow"}
              </Button>
            )}

            {selectedEscrow.status === "funded" && (
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleConfirmPayment(selectedEscrow.id, "buyer")}
                  disabled={isLoading || selectedEscrow.buyerConfirmed}
                  variant={selectedEscrow.buyerConfirmed ? "secondary" : "default"}
                >
                  {selectedEscrow.buyerConfirmed ? "Buyer Confirmed" : "Confirm as Buyer"}
                </Button>
                <Button
                  onClick={() => handleConfirmPayment(selectedEscrow.id, "seller")}
                  disabled={isLoading || selectedEscrow.sellerConfirmed}
                  variant={selectedEscrow.sellerConfirmed ? "secondary" : "default"}
                >
                  {selectedEscrow.sellerConfirmed ? "Seller Confirmed" : "Confirm as Seller"}
                </Button>
              </div>
            )}

            {selectedEscrow.status === "funded" && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-red-600">Dispute Resolution</h4>
                <div className="space-y-2">
                  <Label htmlFor="disputeReason">Reason for Dispute</Label>
                  <Textarea
                    id="disputeReason"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Explain why you're initiating a dispute..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disputeEvidence">Evidence (one per line)</Label>
                  <Textarea
                    id="disputeEvidence"
                    value={disputeEvidence}
                    onChange={(e) => setDisputeEvidence(e.target.value)}
                    placeholder="Transaction hash&#10;Screenshot URL&#10;Communication logs"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={() => handleInitiateDispute(selectedEscrow.id)}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? "Initiating..." : "Initiate Dispute"}
                </Button>
              </div>
            )}

            {["created", "funded"].includes(selectedEscrow.status) && (
              <Button
                onClick={() => cancelEscrow(selectedEscrow.id)}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? "Cancelling..." : "Cancel Escrow"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedDispute) {
    const relatedEscrow = escrows.find((e) => e.id === selectedDispute.escrowId)

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedDispute(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Dispute Resolution</h1>
            <p className="text-muted-foreground">Case #{selectedDispute.id.slice(-6)}</p>
          </div>
        </div>

        {message && (
          <Alert className={message.includes("success") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.includes("success") ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispute Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Badge className={`gap-1 ${selectedDispute.status === "resolved" ? "bg-green-600" : "bg-red-600"}`}>
                  <Gavel className="w-3 h-3" />
                  {selectedDispute.status.charAt(0).toUpperCase() + selectedDispute.status.slice(1)}
                </Badge>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Initiated By</Label>
                <div className="font-medium">
                  {selectedDispute.initiatedBy.charAt(0).toUpperCase() + selectedDispute.initiatedBy.slice(1)}
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Reason</Label>
                <p className="text-sm">{selectedDispute.reason}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Evidence</Label>
                <ul className="text-sm space-y-1">
                  {selectedDispute.evidence.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {relatedEscrow && (
                <div>
                  <Label className="text-sm text-muted-foreground">Related Escrow</Label>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    {relatedEscrow.amount} {relatedEscrow.cryptocurrency} for {relatedEscrow.fiatAmount}{" "}
                    {relatedEscrow.fiatCurrency}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Arbitration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDispute.status === "open" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="arbitrationNotes">Arbitrator Notes</Label>
                    <Textarea
                      id="arbitrationNotes"
                      value={arbitrationNotes}
                      onChange={(e) => setArbitrationNotes(e.target.value)}
                      placeholder="Review findings and decision rationale..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Resolution Decision</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => handleResolveDispute(selectedDispute.id, "buyer")}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Award Buyer
                      </Button>
                      <Button
                        onClick={() => handleResolveDispute(selectedDispute.id, "seller")}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Award Seller
                      </Button>
                      <Button
                        onClick={() => handleResolveDispute(selectedDispute.id, "split")}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Split 50/50
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {selectedDispute.status === "resolved" && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Resolution</Label>
                  <p className="text-sm">{selectedDispute.resolution}</p>
                  {selectedDispute.arbitratorNotes && (
                    <>
                      <Label className="text-sm text-muted-foreground">Arbitrator Notes</Label>
                      <p className="text-sm">{selectedDispute.arbitratorNotes}</p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Escrow Management</h1>
          <p className="text-muted-foreground">Secure smart contract escrow for P2P trades</p>
        </div>
      </div>

      {message && (
        <Alert className={message.includes("success") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.includes("success") ? "text-green-800" : "text-red-800"}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="text-center pb-3">
            <Shield className="w-8 h-8 mx-auto text-blue-600" />
            <CardTitle className="text-lg">Active Escrows</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{activeEscrows.length}</div>
            <p className="text-sm text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-3">
            <AlertTriangle className="w-8 h-8 mx-auto text-red-600" />
            <CardTitle className="text-lg">Disputes</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{disputedEscrows.length}</div>
            <p className="text-sm text-muted-foreground">Under arbitration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-3">
            <CheckCircle className="w-8 h-8 mx-auto text-green-600" />
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{completedEscrows.length}</div>
            <p className="text-sm text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-3">
            <DollarSign className="w-8 h-8 mx-auto text-purple-600" />
            <CardTitle className="text-lg">Total Volume</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">
              ${escrows.reduce((sum, escrow) => sum + escrow.fiatAmount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">All-time volume</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active ({activeEscrows.length})</TabsTrigger>
          <TabsTrigger value="disputes">Disputes ({disputes.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedEscrows.length})</TabsTrigger>
          <TabsTrigger value="all">All ({escrows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {activeEscrows.map((escrow) => (
              <Card
                key={escrow.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedEscrow(escrow)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">Escrow #{escrow.id.slice(-6)}</span>
                        <StatusBadge status={escrow.status} />
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Amount</Label>
                          <div className="font-medium">
                            {escrow.amount} {escrow.cryptocurrency}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Fiat Value</Label>
                          <div className="font-medium">
                            {escrow.fiatAmount} {escrow.fiatCurrency}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Timeout</Label>
                          <div className="text-sm">{getTimeRemaining(escrow.timeoutAt)}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Progress</Label>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={
                                escrow.status === "created"
                                  ? 25
                                  : escrow.status === "funded"
                                    ? 50
                                    : escrow.buyerConfirmed && escrow.sellerConfirmed
                                      ? 100
                                      : 75
                              }
                              className="w-16 h-2"
                            />
                            <span className="text-xs">
                              {escrow.status === "created"
                                ? "25%"
                                : escrow.status === "funded"
                                  ? "50%"
                                  : escrow.buyerConfirmed && escrow.sellerConfirmed
                                    ? "100%"
                                    : "75%"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          <div className="grid gap-4">
            {disputes.map((dispute) => {
              const relatedEscrow = escrows.find((e) => e.id === dispute.escrowId)
              return (
                <Card
                  key={dispute.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedDispute(dispute)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Gavel className="w-4 h-4 text-red-600" />
                          <span className="font-semibold">Dispute #{dispute.id.slice(-6)}</span>
                          <Badge className={`gap-1 ${dispute.status === "resolved" ? "bg-green-600" : "bg-red-600"}`}>
                            {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Initiated By</Label>
                            <div className="font-medium">
                              {dispute.initiatedBy.charAt(0).toUpperCase() + dispute.initiatedBy.slice(1)}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Related Escrow</Label>
                            <div className="text-sm">
                              {relatedEscrow ? `${relatedEscrow.amount} ${relatedEscrow.cryptocurrency}` : "Unknown"}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Created</Label>
                            <div className="text-sm">{new Date(dispute.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{dispute.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {completedEscrows.map((escrow) => (
              <Card key={escrow.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-semibold">Escrow #{escrow.id.slice(-6)}</span>
                        <StatusBadge status={escrow.status} />
                      </div>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Amount</Label>
                          <div className="font-medium">
                            {escrow.amount} {escrow.cryptocurrency}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Fiat Value</Label>
                          <div className="font-medium">
                            {escrow.fiatAmount} {escrow.fiatCurrency}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Completed</Label>
                          <div className="text-sm">
                            {escrow.releasedAt
                              ? new Date(escrow.releasedAt).toLocaleDateString()
                              : escrow.resolvedAt
                                ? new Date(escrow.resolvedAt).toLocaleDateString()
                                : "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Resolution</Label>
                          <div className="text-sm">
                            {escrow.status === "released"
                              ? "Successful"
                              : escrow.status === "resolved"
                                ? escrow.resolution
                                : "Cancelled"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {escrows.map((escrow) => (
              <Card
                key={escrow.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedEscrow(escrow)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">Escrow #{escrow.id.slice(-6)}</span>
                        <StatusBadge status={escrow.status} />
                      </div>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Amount</Label>
                          <div className="font-medium">
                            {escrow.amount} {escrow.cryptocurrency}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Fiat Value</Label>
                          <div className="font-medium">
                            {escrow.fiatAmount} {escrow.fiatCurrency}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Created</Label>
                          <div className="text-sm">{new Date(escrow.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Trade ID</Label>
                          <div className="text-sm">#{escrow.tradeId.slice(-6)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
