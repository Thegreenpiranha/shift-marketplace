import { webln } from '@getalby/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: process.env.ALBY_NWC_URL!
    });

    await nwc.enable();

    // Try to look up the invoice
    try {
      const result = await nwc.lookupInvoice({ payment_hash: paymentHash });
      
      res.status(200).json({
        paymentHash,
        status: result.settled ? 'paid' : 'pending',
        settled: result.settled,
        settledAt: result.settled_at
      });
    } catch (lookupError) {
      // lookupInvoice not supported, return pending
      console.log('lookupInvoice not available:', lookupError);
      res.status(200).json({
        paymentHash,
        status: 'pending',
        message: 'Payment verification in progress'
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
