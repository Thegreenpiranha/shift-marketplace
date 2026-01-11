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
    const { amount, description, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Initialize NWC connection with WebLN provider
    const nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: process.env.ALBY_NWC_URL!
    });

    await nwc.enable();

    // Create invoice
    const invoice = await nwc.makeInvoice({
      amount,
      defaultMemo: description || 'Shift Marketplace Payment',
    });

    // Extract payment hash from bolt11 invoice
    const bolt11 = invoice.paymentRequest;
    const paymentHashMatch = bolt11.match(/pp([a-z0-9]{52})/);
    const paymentHash = paymentHashMatch ? paymentHashMatch[1] : "unknown";

    res.status(200).json({
      invoice: invoice.paymentRequest,
      paymentHash: paymentHash,
      amount,
      metadata
    });
  } catch (error) {
    console.error('Invoice creation failed:', error);
    res.status(500).json({ 
      error: 'Failed to create invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}