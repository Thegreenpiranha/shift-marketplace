import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALBY_API_URL = 'https://dehh4jm75cudeh45vm62aecrk26lmkpsjm6zxa7cyzrnimg7fa3x52ad.local/api';

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

    // Check invoice status using Alby Hub API
    const response = await fetch(`${ALBY_API_URL}/invoices/${paymentHash}`, {
      headers: {
        'Authorization': `Bearer ${process.env.ALBY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Alby API error:', response.status, await response.text());
      return res.status(200).json({
        paymentHash,
        status: 'pending',
        message: 'Could not verify payment status'
      });
    }

    const invoice = await response.json();

    res.status(200).json({
      paymentHash,
      status: invoice.settled ? 'paid' : 'pending',
      settled: invoice.settled,
      settledAt: invoice.settled_at
    });
  } catch (error) {
    console.error('Status check failed:', error);
    res.status(500).json({ 
      error: 'Failed to check payment status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}