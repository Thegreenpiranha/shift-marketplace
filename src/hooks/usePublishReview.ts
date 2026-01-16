import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';

interface PublishReviewParams {
  sellerPubkey: string;
  rating: number;
  comment: string;
  listingId?: string;
}

export function usePublishReview() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sellerPubkey, rating, comment, listingId }: PublishReviewParams) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Create the review event
      const tags: string[][] = [
        ['p', sellerPubkey], // Tag the seller
        ['rating', rating.toString()],
      ];

      if (listingId) {
        tags.push(['e', listingId]); // Reference the listing
      }

      const event = {
        kind: 1985, // Review event kind
        content: comment,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      };

      // Publish to Nostr
      await nostr.publish(event);

      return event;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['seller-reputation', variables.sellerPubkey] });
      queryClient.invalidateQueries({ queryKey: ['seller-reviews', variables.sellerPubkey] });
    },
  });
}
