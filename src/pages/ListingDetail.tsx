import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, ShieldCheck, MessageCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useListing } from '@/hooks/useListings';
import { useSellerReputation, useSellerReviews } from '@/hooks/useSellerReputation';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatPrice, formatSats } from '@/types/marketplace';
import { genUserName } from '@/lib/genUserName';
import ReactMarkdown from 'react-markdown';

export default function ListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();
  const { data: listing, isLoading } = useListing(listingId!);
  const { data: reputation } = useSellerReputation(listing?.sellerPubkey);
  const { data: reviews } = useSellerReviews(listing?.sellerPubkey, 5);
  const author = useAuthor(listing?.sellerPubkey);
  const { user } = useCurrentUser();
  const [selectedImage, setSelectedImage] = useState(0);

  const sellerMetadata = author.data?.metadata;
  const sellerName = sellerMetadata?.name || genUserName(listing?.sellerPubkey || '');
  const sellerAvatar = sellerMetadata?.picture;

  const isOwnListing = user && listing && user.pubkey === listing.sellerPubkey;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Listing not found</h2>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-2">
                <div className="text-lg font-bold text-primary-foreground">S</div>
              </div>
              <h1 className="text-xl font-bold text-primary">Shift</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/my-listings">
                <Button variant="ghost">My Listings</Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost">Messages</Button>
              </Link>
              <Link to="/create-listing">
                <Button>Sell an Item</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Link to="/search">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardContent className="p-0">
                {listing.images.length > 0 ? (
                  <div className="space-y-4">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={listing.images[selectedImage]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {listing.images.length > 1 && (
                      <div className="px-4 pb-4">
                        <div className="flex gap-2 overflow-x-auto">
                          {listing.images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImage(idx)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                selectedImage === idx
                                  ? 'border-primary'
                                  : 'border-transparent hover:border-muted-foreground'
                              }`}
                            >
                              <img
                                src={img}
                                alt={`${listing.title} ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center rounded-t-lg">
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location}</span>
                    <span>•</span>
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(listing.publishedAt * 1000).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
                {listing.status !== 'active' && (
                  <Badge variant="secondary" className="ml-4">
                    {listing.status === 'sold' ? 'Sold' : 'Reserved'}
                  </Badge>
                )}
              </div>

              <div className="bg-accent/50 rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  {formatPrice(listing.price, listing.currency)}
                </div>
                {listing.priceSats && (
                  <div className="text-muted-foreground">
                    Approximately {formatSats(listing.priceSats)}
                  </div>
                )}
              </div>

              {listing.summary && (
                <p className="text-lg text-muted-foreground mb-4">{listing.summary}</p>
              )}
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <ReactMarkdown>{listing.description}</ReactMarkdown>
              </CardContent>
            </Card>

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div key={idx}>
                      {idx > 0 && <Separator className="my-4" />}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.timestamp * 1000).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <p className="text-sm">{review.content}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Card */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={sellerAvatar} />
                    <AvatarFallback>{sellerName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{sellerName}</h3>
                      {reputation?.isVerified && (
                        <ShieldCheck className="h-5 w-5 text-primary" title="Verified Seller" />
                      )}
                    </div>
                    {reputation && reputation.totalReviews > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{reputation.averageRating.toFixed(1)}</span>
                        <span>({reputation.totalReviews} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {!isOwnListing && listing.status === 'active' && (
                  <div className="space-y-2">
                    <Button className="w-full" size="lg">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contact Seller
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      <ShieldCheck className="h-3 w-3 inline mr-1" />
                      Your payment will be protected by escrow
                    </p>
                  </div>
                )}

                {isOwnListing && (
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Edit Listing
                    </Button>
                    <Button variant="outline" className="w-full">
                      Mark as Sold
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-accent/30 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Safe Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <div className="text-primary">✓</div>
                  <p>Payment held in secure escrow until you confirm receipt</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary">✓</div>
                  <p>Seller receives payment only after delivery confirmation</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary">✓</div>
                  <p>Platform fee: 2% on successful transactions</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary">✓</div>
                  <p>14-day auto-release protection</p>
                </div>
              </CardContent>
            </Card>

            {/* Report Listing */}
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
              Report this listing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
