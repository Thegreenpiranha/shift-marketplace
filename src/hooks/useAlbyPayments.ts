import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webln } from '@getalby/sdk';

// Payment status types
export type PaymentStatus = 'pending' | 'paid' | 'settled' | 'failed' | 'expired';

export interface PaymentRequest {
  listingId: string;
  itemPrice: number; // in sats
  platformFee: number; // in sats (2% of itemPrice)
  totalAmount: number; // in sats (itemPrice + platformFee)
  sellerPubkey: string;
  buyerPubkey: string;
}

export interface Payment {
  id: string;
  listingId: string;
  invoice: string;
  paymentHash: string;
  itemPrice: number;
  platformFee: number;
  totalAmount: number;
  status: PaymentStatus;
  sellerPubkey: string;
  buyerPubkey: string;
  sellerLightningAddress?: string;
  createdAt: number;
  paidAt?: number;
  settledAt?: number;
  payoutTxId?: string;
}

// NOTE: In production, the NWC connection should be handled by a backend service
// This is a placeholder that shows the flow - actual NWC calls need server-side implementation
const ALBY_HUB_API = 'https://api.getalby.com/payments';

/**
 * Hook to create a Lightning invoice for a purchase
 */
export function useCreateInvoice() {
  return useMutation({
    mutationFn: async (request: PaymentRequest): Promise<Payment> => {
      // In production, this would call your backend API endpoint
      // which securely uses the NWC connection to create an invoice
      
      const response = await fetch('/api/invoices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: request.totalAmount,
          description: `Shift Marketplace - Listing ${request.listingId}`,
          metadata: {
            listingId: request.listingId,
            itemPrice: request.itemPrice,
            platformFee: request.platformFee,
            sellerPubkey: request.sellerPubkey,
            buyerPubkey: request.buyerPubkey,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const data = await response.json();

      // Store payment record
      const payment: Payment = {
        id: data.paymentHash,
        listingId: request.listingId,
        invoice: data.invoice,
        paymentHash: data.paymentHash,
        itemPrice: request.itemPrice,
        platformFee: request.platformFee,
        totalAmount: request.totalAmount,
        status: 'pending',
        sellerPubkey: request.sellerPubkey,
        buyerPubkey: request.buyerPubkey,
        createdAt: Date.now(),
      };

      // Store in localStorage for demo (in production, use proper database)
      const payments = getStoredPayments();
      payments.push(payment);
      localStorage.setItem('shift:payments', JSON.stringify(payments));

      return payment;
    },
  });
}

/**
 * Hook to check payment status
 */
export function usePaymentStatus(paymentHash: string | undefined) {
  return useQuery({
    queryKey: ['payment-status', paymentHash],
    queryFn: async () => {
      if (!paymentHash) return null;

      // In production, check with backend API
      const response = await fetch(`/api/invoices/${paymentHash}/status`);
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();

      // Update local payment record
      const payments = getStoredPayments();
      const paymentIndex = payments.findIndex((p) => p.paymentHash === paymentHash);
      
      if (paymentIndex !== -1) {
        payments[paymentIndex].status = data.status;
        if (data.status === 'paid' && !payments[paymentIndex].paidAt) {
          payments[paymentIndex].paidAt = Date.now();
        }
        localStorage.setItem('shift:payments', JSON.stringify(payments));
      }

      return data;
    },
    enabled: !!paymentHash,
    refetchInterval: (data) => {
      // Poll every 2 seconds if payment is pending
      return data?.status === 'pending' ? 2000 : false;
    },
  });
}

/**
 * Hook to send payment to seller (escrow release)
 */
export function usePayoutToSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentHash,
      sellerLightningAddress,
    }: {
      paymentHash: string;
      sellerLightningAddress: string;
    }) => {
      const payments = getStoredPayments();
      const payment = payments.find((p) => p.paymentHash === paymentHash);

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'paid') {
        throw new Error('Payment not confirmed yet');
      }

      // Validate Lightning address
      if (!isValidLightningAddress(sellerLightningAddress)) {
        throw new Error('Invalid Lightning address');
      }

      // Calculate seller amount (98% of total - platform keeps 2%)
      const sellerAmount = Math.floor(payment.itemPrice);

      // In production, call backend API to send payment to seller
      const response = await fetch('/api/payouts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lightningAddress: sellerLightningAddress,
          amount: sellerAmount,
          description: `Shift - Payment for listing ${payment.listingId}`,
          paymentHash: paymentHash,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send payout to seller');
      }

      const data = await response.json();

      // Update payment record
      const paymentIndex = payments.findIndex((p) => p.paymentHash === paymentHash);
      payments[paymentIndex].status = 'settled';
      payments[paymentIndex].settledAt = Date.now();
      payments[paymentIndex].payoutTxId = data.txId;
      payments[paymentIndex].sellerLightningAddress = sellerLightningAddress;
      localStorage.setItem('shift:payments', JSON.stringify(payments));

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

/**
 * Hook to pay invoice using WebLN (browser extension)
 */
export function useWebLNPayment() {
  const [isWebLNAvailable, setIsWebLNAvailable] = useState(false);

  // Check if WebLN is available
  const checkWebLN = async () => {
    if (typeof window !== 'undefined' && window.webln) {
      try {
        await window.webln.enable();
        setIsWebLNAvailable(true);
      } catch (error) {
        setIsWebLNAvailable(false);
      }
    }
  };

  const payWithWebLN = async (invoice: string): Promise<{ preimage: string }> => {
    if (!window.webln) {
      throw new Error('WebLN not available');
    }

    try {
      await window.webln.enable();
      const result = await window.webln.sendPayment(invoice);
      return { preimage: result.preimage };
    } catch (error) {
      throw new Error('WebLN payment failed: ' + (error as Error).message);
    }
  };

  return {
    isWebLNAvailable,
    checkWebLN,
    payWithWebLN,
  };
}

/**
 * Get all payments from localStorage
 */
function getStoredPayments(): Payment[] {
  const stored = localStorage.getItem('shift:payments');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get user's payment history
 */
export function usePaymentHistory(userPubkey: string | undefined) {
  return useQuery({
    queryKey: ['payment-history', userPubkey],
    queryFn: async () => {
      if (!userPubkey) return [];

      const payments = getStoredPayments();
      return payments.filter(
        (p) => p.buyerPubkey === userPubkey || p.sellerPubkey === userPubkey
      );
    },
    enabled: !!userPubkey,
  });
}

/**
 * Get payment by listing ID
 */
export function usePaymentByListing(listingId: string | undefined) {
  return useQuery({
    queryKey: ['payment-by-listing', listingId],
    queryFn: async () => {
      if (!listingId) return null;

      const payments = getStoredPayments();
      return payments.find((p) => p.listingId === listingId) || null;
    },
    enabled: !!listingId,
  });
}

/**
 * Validate Lightning address format
 */
export function isValidLightningAddress(address: string): boolean {
  // Basic validation for Lightning address (user@domain.com)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Check if it's an email-like Lightning address
  if (emailRegex.test(address)) {
    return true;
  }

  // Check if it's an LNURL
  if (address.toLowerCase().startsWith('lnurl')) {
    return true;
  }

  return false;
}

/**
 * Calculate platform fee (2%)
 */
export function calculatePlatformFee(itemPrice: number): number {
  return Math.floor(itemPrice * 0.02);
}

/**
 * Calculate total amount (item price + platform fee)
 */
export function calculateTotalAmount(itemPrice: number): number {
  return itemPrice + calculatePlatformFee(itemPrice);
}

// WebLN type declarations
declare global {
  interface Window {
    webln?: {
      enable(): Promise<void>;
      sendPayment(invoice: string): Promise<{ preimage: string }>;
    };
  }
}
