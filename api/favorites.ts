import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage (resets on deploy - good enough for MVP)
interface Favorite {
  userId: string;      // The user who favorited
  sellerPubkey: string; // The seller being favorited
  createdAt: number;
}

let favorites: Favorite[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Get favorites for a user OR check if favorited
  if (req.method === 'GET') {
    const { userId, sellerPubkey } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId required' });
    }

    // If sellerPubkey provided, check if this specific seller is favorited
    if (sellerPubkey && typeof sellerPubkey === 'string') {
      const isFavorited = favorites.some(
        f => f.userId === userId && f.sellerPubkey === sellerPubkey
      );
      return res.status(200).json({ isFavorited });
    }

    // Otherwise return all favorites for this user
    const userFavorites = favorites
      .filter(f => f.userId === userId)
      .map(f => ({
        sellerPubkey: f.sellerPubkey,
        createdAt: f.createdAt
      }));

    // Get count of favorites (followers) for each seller
    const favoriteCounts: Record<string, number> = {};
    favorites.forEach(f => {
      favoriteCounts[f.sellerPubkey] = (favoriteCounts[f.sellerPubkey] || 0) + 1;
    });

    return res.status(200).json({ 
      favorites: userFavorites,
      counts: favoriteCounts
    });
  }

  // POST - Add a favorite
  if (req.method === 'POST') {
    const { userId, sellerPubkey } = req.body;

    if (!userId || !sellerPubkey) {
      return res.status(400).json({ error: 'userId and sellerPubkey required' });
    }

    // Check if already favorited
    const existing = favorites.find(
      f => f.userId === userId && f.sellerPubkey === sellerPubkey
    );

    if (existing) {
      return res.status(200).json({ message: 'Already favorited' });
    }

    const favorite: Favorite = {
      userId,
      sellerPubkey,
      createdAt: Date.now()
    };

    favorites.push(favorite);

    return res.status(201).json({ favorite });
  }

  // DELETE - Remove a favorite
  if (req.method === 'DELETE') {
    const { userId, sellerPubkey } = req.body;

    if (!userId || !sellerPubkey) {
      return res.status(400).json({ error: 'userId and sellerPubkey required' });
    }

    const initialLength = favorites.length;
    favorites = favorites.filter(
      f => !(f.userId === userId && f.sellerPubkey === sellerPubkey)
    );

    if (favorites.length === initialLength) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    return res.status(200).json({ message: 'Favorite removed' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
