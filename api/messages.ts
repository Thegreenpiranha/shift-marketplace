import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage (resets on deploy - good enough for MVP)
// For production, use a database like Supabase, Vercel KV, or Postgres
let messages: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Retrieve messages for a user
  if (req.method === 'GET') {
    const { pubkey } = req.query;
    
    if (!pubkey || typeof pubkey !== 'string') {
      return res.status(400).json({ error: 'pubkey required' });
    }

    // Return messages where user is sender or recipient
    const userMessages = messages.filter(
      m => m.from === pubkey || m.to === pubkey
    );

    return res.status(200).json({ messages: userMessages });
  }

  // POST - Send a new message
  if (req.method === 'POST') {
    const { from, to, content } = req.body;

    if (!from || !to || !content) {
      return res.status(400).json({ error: 'from, to, and content required' });
    }

    const message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      from,
      to,
      content,
      timestamp: Date.now(),
      read: false
    };

    messages.push(message);

    return res.status(201).json({ message });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
