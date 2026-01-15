import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useListings } from '@/hooks/useListings';
import { useSellerReputation, useSellerReviews } from '@/hooks/useSellerReputation';
import { 
  MessageCircle, 
  Share2, 
  Heart, 
  Star, 
  MapPin, 
  Calendar,
  ExternalLink,
  Edit,
  Package
} from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { pubkey } = useParams<{ pubkey: string }>();
  const { user } = useCurrentUser();
  const author = useAuthor(pubkey);
  const navigate = useNavigate();
  
  // Fetch seller's active listings
  const { data: allListings = [] } = useListings({ sellerPubkey: pubkey });
  const activeListings = allListings.filter(l => l.status === 'active');
  
  // Fetch reputation and reviews
  const { data: reputation } = useSellerReputation(pubkey);
  const { data: reviews = [] } = useSellerReviews(pubkey, 10);
  
  const [isFavorited, setIsFavorited] = useState(false);
  const [followersCount] = useState(0); // TODO: Implement followers

  const isOwnProfile = user?.pubkey === pubkey;

  const handleContactSeller = () => {
    navigate(`/messages?recipient=${pubkey}`);
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${pubkey}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${author?.data?.metadata?.display_name || 'Seller'}'s Profile on Shift`,
          text: `Check out ${author?.data?.metadata?.display_name || 'this seller'} on Shift - UK Bitcoin Marketplace`,
          url: profileUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(profileUrl);
      alert('Profile link copied to clipboard!');
    }
  };

  const handleToggleFavorite = () => {
    // TODO: API call to favorite/unfavorite seller
    setIsFavorited(!isFavorited);
  };

  // Extract location from first listing or Nostr metadata
  const userLocation = activeListings[0]?.location || author?.data?.metadata?.location || 'UK';
  
  // Calculate member since date (use first listing or default)
  const memberSince = activeListings.length > 0 
    ? new Date(Math.min(...allListings.map(l => l.publishedAt * 1000)))
    : new Date();

  if (!pubkey) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={author?.data?.metadata?.picture} />
                  <AvatarFallback className="text-4xl">
                    {(author?.data?.metadata?.display_name || author?.data?.metadata?.name || 'U')[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Action Buttons */}
                <div className="flex gap-2 w-full">
                  {isOwnProfile ? (
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to="/settings">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleContactSeller} className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleToggleFavorite}
                        className={isFavorited ? 'text-red-500' : ''}
                      >
                        <Heart className={isFavorited ? 'fill-current' : ''} className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="icon" onClick={handleShareProfile}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {author?.data?.metadata?.display_name || author?.data?.metadata?.name || 'Anonymous'}
                    </h1>
                    {author?.data?.metadata?.nip05 && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {author.data.metadata.nip05}
                      </p>
                    )}
                  </div>
                  {reputation && reputation.totalReviews > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span>{reputation.averageRating.toFixed(1)}</span>
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-6 mb-4">
                  <div>
                    <p className="text-2xl font-bold">{activeListings.length}</p>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{followersCount}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reputation?.totalReviews || 0}</p>
                    <p className="text-sm text-muted-foreground">Reviews</p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{userLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {memberSince.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>Active on Shift</span>
                  </div>
                </div>

                {/* Bio */}
                {author?.data?.metadata?.about && (
                  <div className="mt-4">
                    <p className="text-sm">{author.data.metadata.about}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Active Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Active Listings ({activeListings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {activeListings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground mb-4">No active listings at the moment</p>
                    {isOwnProfile && (
                      <Button asChild>
                        <Link to="/create-listing">Create Your First Listing</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {activeListings.slice(0, 6).map((listing) => (
                      <Link
                        key={listing.id}
                        to={`/listing/${listing.id}`}
                        className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-square bg-muted relative overflow-hidden">
                          {listing.images[0] && (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">{listing.location}</p>
                          <p className="font-bold mt-1">
                            {listing.currency} {listing.price.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {activeListings.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" asChild>
                      <Link to={`/search?seller=${pubkey}`}>View All Listings</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Feedback ({reputation?.totalReviews || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.timestamp * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {author?.data?.metadata?.website && (
                  <div>
                    <p className="text-muted-foreground mb-1">Website</p>
                    <a 
                      href={author.data.metadata.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {author.data.metadata.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <p className="text-muted-foreground mb-1">Nostr Public Key</p>
                  <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                    {pubkey.slice(0, 16)}...{pubkey.slice(-16)}
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Trust & Safety</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Verified Nostr</span>
                  <Badge variant="secondary">{reputation?.isVerified ? '✓' : '—'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Sales</span>
                  <span className="font-medium">{allListings.filter(l => l.status === 'sold').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Listings</span>
                  <span className="font-medium">{activeListings.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
