import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useListings } from '@/hooks/useListings';
import { CATEGORIES, formatPrice } from '@/types/marketplace';

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = CATEGORIES.find((c) => c.id === categoryId);

  const { data: listings, isLoading } = useListings({
    category: categoryId,
    status: 'active',
  });

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Category not found</h2>
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
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{category.label}</h1>
              <p className="text-muted-foreground">
                {isLoading
                  ? 'Loading...'
                  : listings
                    ? `${listings.length} ${listings.length === 1 ? 'item' : 'items'} available`
                    : 'No items'}
              </p>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Link key={listing.id} to={`/listing/${listing.id}`}>
                <Card className="hover:shadow-xl transition-shadow h-full">
                  <CardHeader className="p-0">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={listing.images[0] || 'https://placehold.co/600x400?text=No+Image'}
                        alt={listing.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <h4 className="font-semibold line-clamp-2">{listing.title}</h4>
                    <p className="text-sm text-muted-foreground">{listing.location}</p>
                    {listing.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {listing.summary}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(listing.price, listing.currency)}
                      </div>
                      {listing.priceSats && (
                        <div className="text-xs text-muted-foreground">
                          {new Intl.NumberFormat('en-GB').format(listing.priceSats)} sats
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">{category.icon}</div>
              <h3 className="text-lg font-semibold mb-2">No listings in this category yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to list an item in {category.label}
              </p>
              <Link to="/create-listing">
                <Button>Create Listing</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
