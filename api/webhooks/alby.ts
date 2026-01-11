import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    
    console.log('Alby webhook received:', event);

    // Alby sends events like: { type: 'invoice.settled', data: { ... } }
    if (event.type === 'invoice.settled') {
      const paymentHash = event.data.payment_hash;
      
      // Update payment status in localStorage
      // In production, you'd update a database
      // For now, we'll just log it
      console.log('Payment confirmed:', paymentHash);
      
      // You could emit a WebSocket event here to notify the frontend
      // Or the frontend can poll less frequently
      
      return res.status(200).json({ received: true });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}