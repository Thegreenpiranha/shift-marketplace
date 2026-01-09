import { webln } from '@getalby/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Function to convert Lightning address to invoice
async function getLightningInvoice(lightningAddress: string, amount: number): Promise<string> {
  const [name, domain] = lightningAddress.split('@');
  
  if (!name || !domain) {
    throw new Error('Invalid Lightning address format');
  }

  const lnurlResponse = await fetch(`https://${domain}/.well-known/lnurlp/${name}`);
  
  if (!lnurlResponse.ok) {
    throw new Error('Failed to fetch Lightning address data');
  }

  const lnurlData = await lnurlResponse.json();
  const invoiceResponse = await fetch(`${lnurlData.callback}?amount=${amount * 1000}`);
  
  if (!invoiceResponse.ok) {
    throw new Error('Failed to get invoice');
  }

  const invoiceData = await invoiceResponse.json();
  
  if (invoiceData.status === 'ERROR') {
    throw new Error(invoiceData.reason || 'Error getting invoice');
  }

  return invoiceData.pr;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const { lightningAddress, invoice, amount, description } = req.body;

    let finalInvoice = invoice;

    // If they gave us a Lightning address, convert it to an invoice
    if (lightningAddress) {
      if (!amount) {
        return res.status(400).json({ error: 'Amount required with Lightning address' });
      }
      finalInvoice = await getLightningInvoice(lightningAddress, amount);
    }

    // If we still don't have an invoice, error
    if (!finalInvoice) {
      return res.status(400).json({ error: 'Need invoice or Lightning address' });
    }

    // Connect to wallet
    const nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: process.env.ALBY_NWC_URL!
    });

    await nwc.enable();

    // Send the payment
    const result = await nwc.sendPayment(finalInvoice);

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