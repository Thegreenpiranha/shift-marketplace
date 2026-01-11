import { webln } from '@getalby/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentHash } = req.query;

    if (!paymentHash || typeof paymentHash !== 'string') {
      return res.status(400).json({ error: 'Payment hash required' });
    }

    // Initialize NWC connection
    const nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: process.env.ALBY_NWC_URL!
    });

    await nwc.enable();

    // Check if we can get transaction list and find this payment
    try {
      // Try to look up the invoice using the payment hash
      const invoice = await nwc.lookupInvoice({
        payment_hash: paymentHash
      });

      res.status(200).json({
        paymentHash,
        status: invoice.settled ? 'paid' : 'pending',
        settled: invoice.settled,
        settledAt: invoice.settled_at
      });
    } catch (lookupError) {
      // If lookupInvoice doesn't work, return pending
      // In production you'd check your database or use Alby's webhooks
      console.error('Lookup not supported:', lookupError);
      res.status(200).json({
        paymentHash,
        status: 'unknown',
        message: 'Payment status checking via Alby Hub API not fully implemented. Use webhooks in production.'
      });
    }
  } catch (error) {
    console.error('Status check failed:', error);
    res.status(500).json({ 
      error: 'Failed to check payment status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}