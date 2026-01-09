# Lightning Payment API Reference

This document describes the backend API endpoints needed for Lightning payments. These should be implemented as serverless functions or a backend service.

## Security Notice

**CRITICAL**: Never expose the NWC connection string in frontend code. All Lightning operations must go through a secure backend.

## NWC Connection Details

```
Connection String: nostr+walletconnect://b562deabef6d6695f1d4323ab6f34a29080760304906f38de4e7f5b50359e79d?relay=wss://relay.getalby.com/v1&secret=99fa036d22e408fabd239ed50716e497d43cabb4848eabd98c5f272143aca606&lud16=21sean@getalby.com

Wallet Pubkey: b562deabef6d6695f1d4323ab6f34a29080760304906f38de4e7f5b50359e79d
Relay: wss://relay.getalby.com/v1
Secret: 99fa036d22e408fabd239ed50716e497d43cabb4848eabd98c5f272143aca606
Lightning Address: 21sean@getalby.com
```

## API Endpoints

### 1. Create Invoice

**POST** `/api/invoices/create`

Creates a Lightning invoice using Alby Hub NWC.

**Request Body:**
```json
{
  "amount": 102000,
  "description": "Shift Marketplace - Listing abc123",
  "metadata": {
    "listingId": "abc123",
    "itemPrice": 100000,
    "platformFee": 2000,
    "sellerPubkey": "seller_pubkey_hex",
    "buyerPubkey": "buyer_pubkey_hex"
  }
}
```

**Response:**
```json
{
  "invoice": "lnbc1020n1...",
  "paymentHash": "a1b2c3...",
  "expiresAt": 1234567890,
  "amount": 102000
}
```

**Implementation:**
```javascript
// Using Nostr Wallet Connect SDK
import { webln } from '@getalby/sdk';

const nwc = new webln.NostrWebLNProvider({
  nostrWalletConnectUrl: process.env.ALBY_NWC_URL
});

await nwc.enable();

const invoice = await nwc.makeInvoice({
  amount: requestBody.amount,
  defaultMemo: requestBody.description,
});

return {
  invoice: invoice.paymentRequest,
  paymentHash: invoice.paymentHash,
  expiresAt: invoice.expiresAt,
  amount: requestBody.amount
};
```

### 2. Check Invoice Status

**GET** `/api/invoices/:paymentHash/status`

Checks the payment status of an invoice.

**Response:**
```json
{
  "paymentHash": "a1b2c3...",
  "status": "paid",
  "paidAt": 1234567890,
  "amount": 102000,
  "preimage": "abc123..."
}
```

**Possible Status Values:**
- `pending` - Invoice created, waiting for payment
- `paid` - Payment received and confirmed
- `settled` - Payment settled (for internal tracking)
- `expired` - Invoice expired without payment
- `failed` - Payment failed

**Implementation:**
```javascript
// Check invoice status via NWC or Alby API
const status = await nwc.checkInvoice(paymentHash);

return {
  paymentHash,
  status: status.settled ? 'paid' : 'pending',
  paidAt: status.settledAt,
  amount: status.amount,
  preimage: status.preimage
};
```

### 3. Send Payout to Seller

**POST** `/api/payouts/send`

Sends payment to seller's Lightning address (escrow release).

**Request Body:**
```json
{
  "lightningAddress": "seller@getalby.com",
  "amount": 98000,
  "description": "Shift - Payment for listing abc123",
  "paymentHash": "original_payment_hash"
}
```

**Response:**
```json
{
  "txId": "tx_abc123",
  "amount": 98000,
  "fee": 100,
  "status": "settled",
  "sentAt": 1234567890
}
```

**Implementation:**
```javascript
// 1. Validate Lightning address
const isValid = await validateLightningAddress(lightningAddress);
if (!isValid) {
  throw new Error('Invalid Lightning address');
}

// 2. Send payment via NWC
const result = await nwc.sendPayment({
  invoice: await getLNURLInvoice(lightningAddress, amount),
  amount: requestBody.amount,
});

// 3. Record payout
await database.recordPayout({
  paymentHash: requestBody.paymentHash,
  txId: result.preimage,
  amount: requestBody.amount,
  sentAt: Date.now(),
});

return {
  txId: result.preimage,
  amount: requestBody.amount,
  fee: result.fee || 0,
  status: 'settled',
  sentAt: Date.now()
};
```

### 4. Validate Lightning Address

**GET** `/api/lightning/validate/:address`

Validates a Lightning address format and availability.

**Response:**
```json
{
  "valid": true,
  "address": "user@getalby.com",
  "domain": "getalby.com"
}
```

**Implementation:**
```javascript
// Check LNURL endpoint
const [username, domain] = address.split('@');
const lnurlEndpoint = `https://${domain}/.well-known/lnurlp/${username}`;

const response = await fetch(lnurlEndpoint);
const data = await response.json();

return {
  valid: response.ok && data.callback,
  address,
  domain
};
```

## Payment Flow

### 1. Buyer Initiates Purchase

1. Buyer clicks "Pay with Lightning" on listing
2. Frontend calls `/api/invoices/create` with item details
3. Backend creates invoice via NWC (100% + 2% = 102% total)
4. Invoice returned to frontend
5. Payment modal displays QR code and invoice string

### 2. Buyer Pays Invoice

**Option A: WebLN (Browser Extension)**
1. User has Alby/similar extension installed
2. Frontend calls `window.webln.sendPayment(invoice)`
3. User confirms in extension popup
4. Payment sent automatically

**Option B: Mobile/External Wallet**
1. User scans QR code with wallet app
2. User confirms payment in wallet
3. Payment sent to Alby Hub

### 3. Payment Confirmation

1. Frontend polls `/api/invoices/:hash/status` every 2 seconds
2. When status becomes `paid`, update UI
3. Store payment record with status `paid`
4. Notify seller via Nostr DM

### 4. Escrow Release (Delivery Confirmation)

1. Seller ships item, buyer confirms receipt
2. Frontend calls `/api/payouts/send` with seller's Lightning address
3. Backend validates seller address
4. Backend sends 98% of item price to seller via NWC
5. Platform keeps 2% fee (already in Alby Hub wallet)
6. Payment marked as `settled`
7. Both parties notified

## Fee Split Calculation

```javascript
// Example: Item price = 100,000 sats
const itemPrice = 100000;

// Platform fee (2%)
const platformFee = Math.floor(itemPrice * 0.02); // 2,000 sats

// Total buyer pays
const totalAmount = itemPrice + platformFee; // 102,000 sats

// Seller receives (after escrow release)
const sellerAmount = itemPrice; // 100,000 sats

// Platform keeps
const platformKeeps = platformFee; // 2,000 sats (stays in Alby Hub)
```

The buyer pays 102,000 sats to the platform's Alby Hub. When escrow releases, the platform sends 100,000 sats to the seller, keeping the 2,000 sats fee.

## Error Handling

### Common Errors

1. **Invoice Creation Failed**
   - Check NWC connection
   - Verify amount is within limits
   - Ensure Alby Hub has capacity

2. **Payment Timeout**
   - Invoices typically expire after 15 minutes
   - Show expiry countdown in UI
   - Allow user to create new invoice

3. **Payout Failed**
   - Validate seller's Lightning address first
   - Check if seller's wallet is online
   - Retry with exponential backoff
   - Notify user if payout cannot be completed

4. **Invalid Lightning Address**
   - Validate format before saving
   - Test LNURL endpoint accessibility
   - Show helpful error messages

## Rate Limits

- Invoice creation: 100 per minute
- Status checks: 1000 per minute (allow polling)
- Payouts: 50 per minute

## Amount Limits

```javascript
const LIMITS = {
  MIN_AMOUNT: 1000, // 1,000 sats (~£0.50)
  MAX_AMOUNT: 10000000, // 10M sats (~£5,000)
  MAX_DAILY_VOLUME: 100000000, // 100M sats per day
};
```

## Database Schema

```typescript
interface PaymentRecord {
  id: string;
  paymentHash: string;
  invoice: string;
  listingId: string;
  itemPrice: number; // sats
  platformFee: number; // sats
  totalAmount: number; // sats
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

## Webhook Support (Optional)

Alby Hub can send webhooks for payment updates:

**POST** `/api/webhooks/alby`

```json
{
  "event": "payment.received",
  "paymentHash": "a1b2c3...",
  "amount": 102000,
  "paidAt": 1234567890
}
```

Use webhooks instead of polling for better performance.

## Testing

Use Alby's testnet or Bitcoin testnet for development:

1. Create testnet Alby account
2. Get testnet NWC connection
3. Use testnet sats for testing
4. Test full flow: create invoice → pay → release escrow

## Security Checklist

- [ ] NWC connection stored in environment variables only
- [ ] API endpoints authenticated (check user signatures)
- [ ] Amount validation (min/max limits)
- [ ] Lightning address validation before payouts
- [ ] Payment hash verification
- [ ] Rate limiting implemented
- [ ] Logs for all transactions
- [ ] Error handling for all edge cases
- [ ] HTTPS only in production
- [ ] CORS configured properly

## Deployment

### Vercel Serverless Functions

Create files in `/api` directory:

- `/api/invoices/create.ts`
- `/api/invoices/[hash]/status.ts`
- `/api/payouts/send.ts`
- `/api/lightning/validate/[address].ts`

### Environment Variables

```bash
ALBY_NWC_URL="nostr+walletconnect://..."
ALBY_API_KEY="your_api_key"
BITCOIN_NETWORK="mainnet"
MIN_PAYMENT_AMOUNT="1000"
MAX_PAYMENT_AMOUNT="10000000"
```

### Netlify Functions

Create files in `/netlify/functions` directory with same structure.

### CloudFlare Workers

Deploy as Workers with KV storage for payment records.
