import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Favorite {
  sellerPubkey: string;
  createdAt: number;
}

// Get all favorites for a user
export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return { favorites: [], counts: {} };

      const response = await fetch(`/api/favorites?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      return {
        favorites: data.favorites as Favorite[],
        counts: data.counts as Record<string, number>
      };
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
}

// Check if a specific seller is favorited
export function useIsFavorited(userId: string | undefined, sellerPubkey: string | undefined) {
  return useQuery({
    queryKey: ['is-favorited', userId, sellerPubkey],
    queryFn: async () => {
      if (!userId || !sellerPubkey) return false;

      const response = await fetch(`/api/favorites?userId=${userId}&sellerPubkey=${sellerPubkey}`);
      
      if (!response.ok) {
        throw new Error('Failed to check favorite status');
      }

      const data = await response.json();
      return data.isFavorited as boolean;
    },
    enabled: !!userId && !!sellerPubkey,
    staleTime: 30000,
  });
}

// Get follower count for a seller
export function useFollowerCount(sellerPubkey: string | undefined) {
  return useQuery({
    queryKey: ['follower-count', sellerPubkey],
    queryFn: async () => {
      if (!sellerPubkey) return 0;

      // We need to fetch all counts to get this seller's count
      // In production, you'd want a dedicated endpoint for this
      const response = await fetch(`/api/favorites?userId=_count_only_${sellerPubkey}`);
      
      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return data.counts[sellerPubkey] || 0;
    },
    enabled: !!sellerPubkey,
    staleTime: 60000, // 1 minute
  });
}

// Add a favorite
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, sellerPubkey }: { userId: string; sellerPubkey: string }) => {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sellerPubkey }),
      });

      if (!response.ok) {
        throw new Error('Failed to add favorite');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['is-favorited', variables.userId, variables.sellerPubkey] });
      queryClient.invalidateQueries({ queryKey: ['follower-count', variables.sellerPubkey] });
    },
  });
}

// Remove a favorite
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, sellerPubkey }: { userId: string; sellerPubkey: string }) => {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sellerPubkey }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['is-favorited', variables.userId, variables.sellerPubkey] });
      queryClient.invalidateQueries({ queryKey: ['follower-count', variables.sellerPubkey] });
    },
  });
}
