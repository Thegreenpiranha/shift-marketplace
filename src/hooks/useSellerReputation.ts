import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { parseReviewEvent, calculateReputation, type Review } from '@/types/marketplace';

export function useSellerReputation(sellerPubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['seller-reputation', sellerPubkey],
    queryFn: async (c) => {
      if (!sellerPubkey) {
        return { averageRating: 0, totalReviews: 0, isVerified: false };
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);

      // Query kind 1985 (review) events tagged with the seller's pubkey
      const events = await nostr.query(
        [
          {
            kinds: [1985],
            '#p': [sellerPubkey],
            limit: 100,
          },
        ],
        { signal }
      );

      const reviews: Review[] = events
        .map(parseReviewEvent)
        .filter((review): review is Review => review !== null);

      return calculateReputation(reviews);
    },
    enabled: !!sellerPubkey,
    staleTime: 60000, // 1 minute
  });
}

export function useSellerReviews(sellerPubkey: string | undefined, limit: number = 10) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['seller-reviews', sellerPubkey, limit],
    queryFn: async (c) => {
      if (!sellerPubkey) {
        return [];
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);

      const events = await nostr.query(
        [
          {
            kinds: [1985],
            '#p': [sellerPubkey],
            limit,
          },
        ],
        { signal }
      );

      const reviews: Review[] = events
        .map(parseReviewEvent)
        .filter((review): review is Review => review !== null);

      // Sort by timestamp, newest first
      reviews.sort((a, b) => b.timestamp - a.timestamp);

      return reviews;
    },
    enabled: !!sellerPubkey,
    staleTime: 60000,
  });
}
