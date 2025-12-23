// types/trade.types.ts

export type TradeStatus = 
  | 'pending'
  | 'active'
  | 'paid'
  | 'confirmed'
  | 'disputed'
  | 'completed'
  | 'cancelled'
  | 'escrow_paid'
  | 'fiat_paid'
  | 'cancellation_requested'
  | 'dispute_review'
  | 'incorrect_escrow';

export type TradeStatusTransition = {
  from: TradeStatus[];
  to: TradeStatus;
  description: string;
  allowed: (trade: P2PTrade, requestedBy?: string) => boolean;
};

export const ALLOWED_STATUS_TRANSITIONS: TradeStatusTransition[] = [
  // Initial state to active
  {
    from: ['pending'],
    to: 'active',
    description: 'Trade is now active',
    allowed: () => true,
  },
  // Active to escrow_paid
  {
    from: ['active'],
    to: 'escrow_paid',
    description: 'Escrow payment received',
    allowed: (trade) => !!trade.escrowAddress,
  },
  // Escrow paid to fiat_paid
  {
    from: ['escrow_paid'],
    to: 'fiat_paid',
    description: 'Fiat payment marked as received',
    allowed: () => true,
  },
  // Fiat paid to completed
  {
    from: ['fiat_paid'],
    to: 'completed',
    description: 'Escrow released to seller',
    allowed: () => true,
  },
  // Any state to cancellation_requested
  {
    from: ['active', 'escrow_paid', 'fiat_paid'],
    to: 'cancellation_requested',
    description: 'Cancellation requested',
    allowed: (_, requestedBy) => !!requestedBy,
  },
  // Cancellation requested to cancelled
  {
    from: ['cancellation_requested'],
    to: 'cancelled',
    description: 'Trade cancelled',
    allowed: (trade, requestedBy) => 
      trade.cancellationRequestedBy && 
      trade.cancellationRequestedBy !== requestedBy,
  },
  // Cancellation requested to dispute_review
  {
    from: ['cancellation_requested'],
    to: 'dispute_review',
    description: 'Dispute submitted for review',
    allowed: (trade, requestedBy) => 
      trade.cancellationRequestedBy && 
      trade.cancellationRequestedBy !== requestedBy,
  },
  // Escrow paid to incorrect_escrow
  {
    from: ['escrow_paid'],
    to: 'incorrect_escrow',
    description: 'Incorrect escrow amount',
    allowed: (trade) => !!trade.escrowAddress,
  },
];

export interface StatusUpdateResult {
  success: boolean;
  error?: string;
  previousStatus?: TradeStatus;
  newStatus?: TradeStatus;
}

export function isStatusTransitionAllowed(
  currentStatus: TradeStatus,
  newStatus: TradeStatus,
  trade: P2PTrade,
  requestedBy?: string
): boolean {
  const transition = ALLOWED_STATUS_TRANSITIONS.find(
    (t) => t.to === newStatus && t.from.includes(currentStatus)
  );

  if (!transition) return false;
  return transition.allowed(trade, requestedBy);
}
