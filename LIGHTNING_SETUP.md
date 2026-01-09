# Lightning Network Payment Setup Guide

This guide explains how to set up the Lightning Network payment system for Shift marketplace.

## Overview

Shift uses **Nostr Wallet Connect (NWC)** with your Alby Hub wallet to process Lightning payments with automated fee splitting:

- **Buyer pays**: 100% item price + 2% platform fee = 102% total
- **Platform receives**: Full 102% to your Alby Hub wallet
- **On delivery confirmation**: Platform sends 98% to seller, keeps 2% fee

## Your Alby Hub Connection

```
[REDACTED - Use environment variable ALBY_NWC_URL]
```

**⚠️ CRITICAL SECURITY NOTICE**: This connection string contains your wallet secret and must NEVER be exposed in frontend code. It should only be stored server-side as an environment variable.

## Current Implementation Status

### ✅ Implemented (Frontend)

- **Payment UI**: Complete payment modal with QR code display
- **WebLN Integration**: One-click payments with browser extensions (Alby, etc.)
- **Payment Status**: Real-time monitoring and status updates
- **Lightning Address Management**: Sellers can configure their Lightning address in settings
- **Fee Calculation**: Automatic 2% platform fee calculation
- **Payment History**: Local storage of payment records
- **Error Handling**: Comprehensive error messages and validation

### ⚠️ Requires Backend Implementation

The following API endpoints need to be implemented as serverless functions or backend service:

1. **POST `/api/invoices/create`** - Create Lightning invoice using NWC
2. **GET `/api/invoices/:hash/status`** - Check payment status
3. **POST `/api/payouts/send`** - Send payment to seller
4. **GET `/api/lightning/validate/:address`** - Validate Lightning address

See `api-reference/LIGHTNING_API.md` for complete API documentation.

## Backend Setup Options

### Option 1: Vercel Serverless Functions (Recommended)

1. Create `/api` directory in project root
2. Install dependencies:
```bash
npm install @getalby/sdk
```

3. Create `/api/invoices/create.ts`:
```typescript
import { webln } from '@getalby/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, description, metadata } = req.body;

    // Initialize NWC connection
    const nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: process.env.ALBY_NWC_URL!
    });

    await nwc.enable();

    // Create invoice
    const invoice = await nwc.makeInvoice({
      amount,
      defaultMemo: description,
    });

    // Store payment record in database (not shown)
    // await db.payments.create({ ...metadata, invoice: invoice.paymentRequest });

    res.status(200).json({
      invoice: invoice.paymentRequest,
      paymentHash: invoice.paymentHash,
      expiresAt: invoice.expiresAt,
      amount
    });
  } catch (error) {
    console.error('Invoice creation failed:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
}
```

4. Add environment variable in Vercel dashboard:
```
ALBY_NWC_URL=nostr+walletconnect://b562deabef6d6695f1d4323ab6f34a29080760304906f38de4e7f5b50359e79d?relay=wss://relay.getalby.com/v1&secret=99fa036d22e408fabd239ed50716e497d43cabb4848eabd98c5f272143aca606&lud16=21sean@getalby.com
```

### Option 2: Netlify Functions

Create `/netlify/functions` directory with similar implementation.

### Option 3: CloudFlare Workers

Deploy as Workers with D1 database for payment records.

## Payment Flow

### 1. Buyer Initiates Purchase

```typescript
// Frontend calls backend API
const response = await fetch('/api/invoices/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 102000, // 102,000 sats (100k item + 2k fee)
    description: 'Shift Marketplace - Listing abc123',
    metadata: {
      listingId: 'abc123',
      itemPrice: 100000,
      platformFee: 2000,
      sellerPubkey: 'seller_hex',
      buyerPubkey: 'buyer_hex'
    }
  })
});

const { invoice, paymentHash } = await response.json();
```

### 2. Display Payment Modal

Frontend displays QR code and invoice string. Supports:
- **QR Code Scanning**: For mobile wallets
- **WebLN**: One-click payment if browser extension installed
- **Manual Copy**: Copy invoice string for any Lightning wallet

### 3. Monitor Payment Status

```typescript
// Poll every 2 seconds until paid
const checkStatus = async () => {
  const res = await fetch(`/api/invoices/${paymentHash}/status`);
  const { status } = await res.json();
  
  if (status === 'paid') {
    // Update UI, notify seller
    showSuccessMessage();
  }
};
```

### 4. Delivery Confirmation & Payout

When buyer confirms receipt:

```typescript
// Frontend calls payout API
await fetch('/api/payouts/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lightningAddress: 'seller@getalby.com',
    amount: 98000, // 98% of item price
    description: 'Shift - Payment for listing abc123',
    paymentHash: originalPaymentHash
  })
});
```

Backend sends 98,000 sats to seller, platform keeps 2,000 sats in Alby Hub wallet.

## Database Schema

You'll need to store payment records. Recommended schema:

```typescript
interface Payment {
  id: string;
  paymentHash: string;
  invoice: string;
  listingId: string;
  itemPrice: number; // sats
  platformFee: number; // sats (2%)
  totalAmount: number; // sats (item + fee)
  status: 'pending' | 'paid' | 'settled' | 'failed' | 'expired';
  buyerPubkey: string;
  sellerPubkey: string;
  sellerLightningAddress?: string;
  createdAt: number;
  paidAt?: number;
  settledAt?: number;
  payoutTxId?: string;
  expiresAt: number;
}
```

Use PostgreSQL, MongoDB, or serverless DB (Vercel KV, Netlify Blobs, CloudFlare D1).

## Testing

### Testnet Setup

1. Create Alby testnet account at https://testnet.getalby.com
2. Get testnet NWC connection
3. Update environment variable with testnet URL
4. Use testnet Bitcoin for testing

### Testing Checklist

- [ ] Create invoice successfully
- [ ] QR code displays correctly
- [ ] WebLN payment works (if extension installed)
- [ ] Payment status updates in real-time
- [ ] Expired invoices handled properly
- [ ] Seller can configure Lightning address
- [ ] Payout to seller works
- [ ] Fee calculation is correct (2%)
- [ ] Error handling for invalid Lightning addresses
- [ ] Payment history displays correctly

## Security Best Practices

### ✅ DO:
- Store NWC connection in environment variables only
- Validate all Lightning addresses before sending payments
- Implement rate limiting on API endpoints
- Log all transactions for audit trail
- Use HTTPS in production
- Set min/max payment amounts
- Verify payment hashes match before payouts
- Handle webhook signatures if using Alby webhooks

### ❌ DON'T:
- Never expose NWC connection in frontend code
- Never trust client-side payment amounts (validate server-side)
- Don't skip Lightning address validation
- Don't allow unlimited payment amounts
- Don't process payouts without delivery confirmation

## Monitoring & Alerts

Set up monitoring for:
- Failed invoice creations
- Payment timeouts
- Failed payouts
- Unusual payment volumes
- Low Alby Hub wallet balance

## Support & Resources

- **Alby Documentation**: https://guides.getalby.com/developer-guide/nostr-wallet-connect
- **NWC Spec**: https://github.com/nostr-protocol/nips/blob/master/47.md
- **WebLN API**: https://webln.dev/
- **Nostr Wallet Connect SDK**: https://github.com/getalby/js-sdk

## Troubleshooting

### Invoice Creation Fails
- Check NWC connection URL is correct
- Verify Alby Hub wallet has capacity
- Check relay is online (wss://relay.getalby.com/v1)
- Ensure amount is within limits

### Payment Not Detected
- Verify payment hash matches
- Check invoice hasn't expired (typically 15 min)
- Ensure status polling is running
- Check Alby Hub connection

### Payout to Seller Fails
- Validate seller's Lightning address
- Check seller's wallet is online
- Verify sufficient balance in Alby Hub
- Check for typos in Lightning address

## Next Steps

1. **Deploy Backend Functions**: Choose Vercel, Netlify, or CloudFlare
2. **Set Environment Variables**: Add NWC connection securely
3. **Test Thoroughly**: Use testnet first
4. **Monitor Payments**: Set up logging and alerts
5. **Go Live**: Switch to mainnet when ready

## Cost Estimate

- **Lightning Network Fees**: ~0.1-1 sat per payment (minimal)
- **Alby Hub**: Free for standard usage
- **Serverless Functions**: Free tier usually sufficient
- **Database**: Free tier for most serverless DBs

Total operating cost: ~$0-5/month for moderate usage.

## Questions?

See full API documentation in `api-reference/LIGHTNING_API.md`
