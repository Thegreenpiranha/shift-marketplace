import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage (resets on deploy - good enough for MVP)
// For production, use a database like Supabase, Vercel KV, or Postgres
interface ShiftProfile {
  pubkey: string;
  customBio?: string;
  businessHours?: string;
  shippingInfo?: string;
  preferredPaymentMethods?: string[];
  responseTime?: string;
  location?: string;
  lastActive?: number;
  updatedAt: number;
}

let profiles: Map<string, ShiftProfile> = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Retrieve profile for a user
  if (req.method === 'GET') {
    const { pubkey } = req.query;
    
    if (!pubkey || typeof pubkey !== 'string') {
      return res.status(400).json({ error: 'pubkey required' });
    }

    const profile = profiles.get(pubkey);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json({ profile });
  }

  // POST - Create or update profile
  if (req.method === 'POST' || req.method === 'PUT') {
    const { 
      pubkey, 
      customBio, 
      businessHours, 
      shippingInfo, 
      preferredPaymentMethods,
      responseTime,
      location
    } = req.body;

    if (!pubkey) {
      return res.status(400).json({ error: 'pubkey required' });
    }

    const profile: ShiftProfile = {
      pubkey,
      customBio,
      businessHours,
      shippingInfo,
      preferredPaymentMethods,
      responseTime,
      location,
      lastActive: Date.now(),
      updatedAt: Date.now()
    };

    profiles.set(pubkey, profile);

    return res.status(200).json({ profile });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
