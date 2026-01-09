import { webln } from '@getalby/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Function to convert Lightning address to invoice
async function getLightningInvoice(lightningAddress: string, amount: number): Promise<string> {
  // Parse lightning address (user@domain.com)
  const [name, domain] = lightningAddress.split('@');
  
  if (!name || !domain) {
    throw new Error('Invalid Lightning address format');
  }

  // Fetch LNURL data
  const lnurlResponse = await fetch(`https://${domain}/.well-known/lnurlp/${name}`);
  
  if (!lnurlResponse.ok) {
    throw new Error('Failed to fetch Lightning address data');
  }

  const lnurlData = await lnurlResponse.json();

  // Request invoice from callback URL
  const invoiceResponse = await fetch(`${lnurlData.callback}?amount=${amount * 1000}`); // Convert sats to millisats
  
  if (!invoiceResponse.ok) {
    throw new Error('Failed to get invoice from Lightning address');
  }

  const invoiceData = await invoiceResponse.json();
  
  if (invoiceData.status === 'ERROR') {
    throw new Error(invoiceData.reason || 'Lightning address returned error');
  }

  return invoiceData.pr; // Return the invoice
}

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
    const { lightningAddress, invoice: providedInvoice, amount, description } = req.body;

    let invoice = providedInvoice;

    // If Lightning address provided instead of invoice, convert it
    if (lightningAddress && !invoice) {
      if (!amount) {
        return res.status(400).json({ error: 'Amount required when using Lightning address' });
      }
      invoice = await getLightningInvoice(lightningAddress, amount);
    }

    if (!invoice) {
      return res.status(400).json({ error: 'Invoice or Lightning address required' });
    }

    // Initialize NWC connection
    const nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: process.env.ALBY_NWC_URL!
    });

    await nwc.enable();

    // Send payment
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