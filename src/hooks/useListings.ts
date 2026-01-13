import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { parseListingEvent, type ListingData } from '@/types/marketplace';

export interface ListingsFilters {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: 'active' | 'sold' | 'reserved';
  sellerPubkey?: string;
}

export function useListings(filters: ListingsFilters = {}) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Build Nostr filter
      const nostrFilter: Record<string, unknown> = {
        kinds: [30402],
        limit: 100,
      };

      // Filter by category using #t tag
      if (filters.category) {
        nostrFilter['#t'] = [filters.category];
      }

      // Filter by seller
      if (filters.sellerPubkey) {
        nostrFilter.authors = [filters.sellerPubkey];
      }

      const events = await nostr.query([nostrFilter], { signal });

      // Parse events into listings
      let listings: ListingData[] = events
        .map(parseListingEvent)
        .filter((listing): listing is ListingData => listing !== null);
      
      // Filter to UK-based listings by default (unless location filter specified)
      if (!filters.location) {
        const isUKListing = (l: ListingData) => {
          const loc = l.location?.toLowerCase() || "";
          return (
            l.currency === "GBP" ||
            loc.includes("uk") ||
            loc.includes("united kingdom") ||
            loc.includes("england") ||
            loc.includes("scotland") ||
            loc.includes("wales") ||
            loc.includes("northern ireland")
          );
        };
        listings = listings.filter(isUKListing);
      }

      // Apply client-side filters
      if (filters.status) {
        listings = listings.filter((l) => l.status === filters.status);
      }

      if (filters.location) {
        const searchLocation = filters.location.toLowerCase();
        listings = listings.filter((l) =>
          l.location.toLowerCase().includes(searchLocation)
        );
      }

      if (filters.minPrice !== undefined) {
        listings = listings.filter((l) => l.price >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        listings = listings.filter((l) => l.price <= filters.maxPrice!);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        listings = listings.filter(
          (l) =>
            l.title.toLowerCase().includes(searchLower) ||
            l.description.toLowerCase().includes(searchLower) ||
            (l.summary && l.summary.toLowerCase().includes(searchLower))
        );
      }

      // Sort by published date, newest first
      listings.sort((a, b) => b.publishedAt - a.publishedAt);

      return listings;
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useListing(listingId: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['listing', listingId],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);

      const events = await nostr.query(
        [
          {
            kinds: [30402],
            '#d': [listingId],
            limit: 1,
          },
        ],
        { signal }
      );

      if (events.length === 0) {
        return null;
      }

      return parseListingEvent(events[0]);
    },
    enabled: !!listingId,
  });
}

export function useFeaturedListings(limit: number = 6) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['featured-listings', limit],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [
          {
            kinds: [30402],
            limit: limit * 2, // Fetch more to filter
          },
        ],
        { signal }
      );

      let listings = events
        .map(parseListingEvent)
        .filter((listing): listing is ListingData => listing !== null)
        .filter((l) => l.status === 'active' && l.images.length > 0);

      // Sort by published date and take the limit
      listings.sort((a, b) => b.publishedAt - a.publishedAt);

      return listings.slice(0, limit);
    },
    staleTime: 60000, // 1 minute
  });
}
