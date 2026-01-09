import { LN } from '@getalby/sdk';
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
    const nwc = new LN(process.env.ALBY_NWC_URL!);

    // Check invoice status
    const invoice = await nwc.lookupInvoice({ paymentHash });

    res.status(200).json({
      paymentHash,
      status: invoice.settled ? 'paid' : 'pending',
      settled: invoice.settled,
      settledAt: invoice.settledAt
    });
  } catch (error) {
    console.error('Status check failed:', error);
    res.status(500).json({ 
      error: 'Failed to check payment status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}