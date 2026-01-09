import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useListings } from '@/hooks/useListings';
import { formatPrice } from '@/types/marketplace';
import { EnhancedLoginArea } from '@/components/auth/EnhancedLoginArea';

export default function MyListings() {
  const { user } = useCurrentUser();

  const { data: activeListings, isLoading: loadingActive } = useListings({
    sellerPubkey: user?.pubkey,
    status: 'active',
  });

  const { data: soldListings, isLoading: loadingSold } = useListings({
    sellerPubkey: user?.pubkey,
    status: 'sold',
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-primary">TrustMarket</h1>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 flex justify-center">
          <EnhancedLoginArea />
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
            <Link to="/">
              <h1 className="text-xl font-bold text-primary">Shift</h1>
            </Link>
            <nav className="flex items-center gap-4">
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <Link to="/create-listing">
            <Button>
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Listing
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              Active {activeListings && `(${activeListings.length})`}
            </TabsTrigger>
            <TabsTrigger value="sold">
              Sold {soldListings && `(${soldListings.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {loadingActive ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
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
            ) : activeListings && activeListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeListings.map((listing) => (
                  <Link key={listing.id} to={`/listing/${listing.id}`}>
                    <Card className="hover:shadow-xl transition-shadow h-full">
                      <CardHeader className="p-0">
                        <div className="relative aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={listing.images[0] || 'https://placehold.co/600x400?text=No+Image'}
                            alt={listing.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                          <Badge className="absolute top-2 right-2 bg-green-500">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2">
                        <h4 className="font-semibold line-clamp-2">{listing.title}</h4>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(listing.price, listing.currency)}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <PlusCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No active listings</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first listing to start selling
                  </p>
                  <Link to="/create-listing">
                    <Button>Create Listing</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sold" className="space-y-6">
            {loadingSold ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
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
            ) : soldListings && soldListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {soldListings.map((listing) => (
                  <Link key={listing.id} to={`/listing/${listing.id}`}>
                    <Card className="hover:shadow-xl transition-shadow h-full opacity-75">
                      <CardHeader className="p-0">
                        <div className="relative aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={listing.images[0] || 'https://placehold.co/600x400?text=No+Image'}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            Sold
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2">
                        <h4 className="font-semibold line-clamp-2">{listing.title}</h4>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <div className="text-2xl font-bold text-muted-foreground">
                          {formatPrice(listing.price, listing.currency)}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <p className="text-muted-foreground">No sold listings yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
