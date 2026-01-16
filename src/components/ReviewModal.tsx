import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { usePublishReview } from '@/hooks/usePublishReview';
import { useToast } from '@/hooks/useToast';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerPubkey: string;
  sellerName: string;
  listingId?: string;
  listingTitle?: string;
}

export function ReviewModal({
  open,
  onOpenChange,
  sellerPubkey,
  sellerName,
  listingId,
  listingTitle,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const publishReview = usePublishReview();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating',
        variant: 'destructive',
      });
      return;
    }

    try {
      await publishReview.mutateAsync({
        sellerPubkey,
        rating,
        comment,
        listingId,
      });

      toast({
        title: 'Review submitted',
        description: 'Your review has been published to Nostr',
      });

      // Reset and close
      setRating(0);
      setComment('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to publish review:', error);
      toast({
        title: 'Failed to submit review',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {sellerName}
            {listingTitle && ` for "${listingTitle}"`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Great'}
                {rating === 3 && 'Good'}
                {rating === 2 && 'Fair'}
                {rating === 1 && 'Poor'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This review will be published to the Nostr network and cannot be deleted
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={publishReview.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={publishReview.isPending || rating === 0}>
              {publishReview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
