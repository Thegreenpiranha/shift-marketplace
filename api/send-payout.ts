import { webln } from '@getalby/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { invoice, amount, description } = req.body;

    if (!invoice) {
      return res.status(400).json({ error: 'Invoice required' });
    }

    // Initialize NWC connection
    const nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: process.env.ALBY_NWC_URL!
    });

    await nwc.enable();

    // Send payment to seller
    const result = await nwc.sendPayment(invoice);

    res.status(200).json({
      success: true,
      preimage: result.preimage,
      amount,
      description
    });
  } catch (error) {
    console.error('Payout failed:', error);
    res.status(500).json({ 
      error: 'Failed to send payout',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}