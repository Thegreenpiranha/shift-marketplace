import type { NostrEvent } from '@nostrify/nostrify';

export interface ListingData {
  id: string;
  title: string;
  summary?: string;
  description: string;
  price: number;
  currency: string;
  priceSats?: number;
  category: string[];
  location: string;
  geohash?: string;
  images: string[];
  status: 'active' | 'sold' | 'reserved';
  publishedAt: number;
  sellerPubkey: string;
}

export interface Review {
  rating: number;
  content: string;
  reviewerPubkey: string;
  listingId?: string;
  timestamp: number;
}

export interface SellerReputation {
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
}

export const CATEGORIES = [
  { id: 'electronics', label: 'Electronics', icon: '💻' },
  { id: 'clothing', label: 'Clothing & Fashion', icon: '👔' },
  { id: 'services', label: 'Services', icon: '🔧' },
  { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
  { id: 'home-garden', label: 'Home & Garden', icon: '🏡' },
  { id: 'sports', label: 'Sports & Leisure', icon: '⚽' },
  { id: 'books', label: 'Books & Media', icon: '📚' },
  { id: 'toys', label: 'Toys & Games', icon: '🎮' },
  { id: 'collectibles', label: 'Collectibles', icon: '🎨' },
  { id: 'other', label: 'Other', icon: '📦' },
] as const;

export function parseListingEvent(event: NostrEvent): ListingData | null {
  try {
    // Debug: Log what we receive
    if (!event) {
      console.error('Event is null/undefined');
      return null;
    }
    if (!event.tags) {
      console.error('Event has no tags property:', event);
      return null;
    }
    if (!Array.isArray(event.tags)) {
      console.error('Event.tags is not an array:', typeof event.tags);
      return null;
    }
    // Safety check for malformed events
    if (!event || !event.tags || !Array.isArray(event.tags)) {
      return null;
    }
    const getTag = (name: string) => event.tags.find(([t]) => t === name)?.[1];
    const getAllTags = (name: string) => event.tags.filter(([t]) => t === name).map(([, v]) => v);

    const id = getTag('d');
    const title = getTag('title');
    const priceTag = event.tags.find(([t]) => t === 'price');
    const location = getTag('location');
    const status = (getTag('status') || 'active') as 'active' | 'sold' | 'reserved';
    const publishedAt = getTag('published_at');

    if (!id || !title || !priceTag || !location) {
      console.warn('Listing missing required fields:', {
        id: !!id,
        title: !!title,
        priceTag: !!priceTag,
        location: !!location,
        eventId: event.id,
        tags: event.tags.slice(0, 5)
      });
      return null;
    }

    const [, priceStr, currency] = priceTag;
    const price = parseFloat(priceStr);

    if (isNaN(price)) {
      return null;
    }

    const priceSatsTag = getTag('price_sats');
    const priceSats = priceSatsTag ? parseInt(priceSatsTag) : undefined;

    return {
      id,
      title,
      summary: getTag('summary'),
      description: event.content,
      price,
      currency,
      priceSats,
      category: getAllTags('t'),
      location,
      geohash: getTag('g'),
      images: event.tags.filter(([t]) => t === 'image').map(([, url]) => url),
      status,
      publishedAt: publishedAt ? parseInt(publishedAt) : event.created_at,
      sellerPubkey: event.pubkey,
    };
  } catch (error) {
    console.error('Error parsing listing event:', error);
    return null;
  }
}

export function parseReviewEvent(event: NostrEvent): Review | null {
  try {
    const ratingTag = event.tags.find(([t]) => t === 'rating')?.[1];
    const listingEventId = event.tags.find(([t]) => t === 'e')?.[1];

    if (!ratingTag) {
      return null;
    }

    const rating = parseInt(ratingTag);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return null;
    }

    return {
      rating,
      content: event.content,
      reviewerPubkey: event.pubkey,
      listingId: listingEventId,
      timestamp: event.created_at,
    };
  } catch (error) {
    console.error('Error parsing review event:', error);
    return null;
  }
}

export function calculateReputation(reviews: Review[]): SellerReputation {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      isVerified: false,
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  const isVerified = reviews.length >= 10 && averageRating >= 4.5;

  return {
    averageRating,
    totalReviews: reviews.length,
    isVerified,
  };
}

// Convert GBP to satoshis (using approximate rate, should be fetched from API in production)
export function convertGBPToSats(gbp: number, btcPriceGBP: number = 50000): number {
  const btc = gbp / btcPriceGBP;
  return Math.round(btc * 100_000_000);
}

// Convert satoshis to GBP
export function convertSatsToGBP(sats: number, btcPriceGBP: number = 50000): number {
  const btc = sats / 100_000_000;
  return btc * btcPriceGBP;
}

// Format price for display
export function formatPrice(amount: number, currency: string): string {
  if (currency === 'GBP') {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  }
  return `${amount} ${currency}`;
}

// Format sats for display
export function formatSats(sats: number): string {
  return new Intl.NumberFormat('en-GB').format(sats) + ' sats';
}
