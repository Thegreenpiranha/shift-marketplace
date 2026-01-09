import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Search, ShieldCheck, Lock, MessageSquare, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedListings } from '@/hooks/useListings';
import { CATEGORIES, formatPrice } from '@/types/marketplace';

export default function Home() {
  useSeoMeta({
    title: 'TrustMarket UK - Buy & Sell with Bitcoin Lightning',
    description: 'The UK\'s most trusted peer-to-peer marketplace with escrow protection. Buy and sell electronics, clothing, vehicles, and more using Bitcoin Lightning Network.',
    ogTitle: 'TrustMarket UK - Trusted P2P Marketplace',
    ogDescription: 'Buy & sell safely with escrow protection and Lightning payments',
  });

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: featuredListings, isLoading } = useFeaturedListings(6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">TrustMarket</h1>
                <p className="text-xs text-muted-foreground">UK's Trusted Marketplace</p>
              </div>
            </div>
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

      {/* Hero Section with Search */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Buy & Sell with Confidence
            </h2>
            <p className="text-lg text-muted-foreground">
              The UK's most trusted peer-to-peer marketplace with escrow protection
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for items, services, or sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 text-lg shadow-lg"
              />
            </form>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <div className="flex items-center gap-2 text-sm">
                <Lock className="h-5 w-5 text-primary" />
                <span className="font-medium">Escrow Protection</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="font-medium">Verified Sellers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">Secure Messaging</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 container mx-auto px-4">
        <h3 className="text-2xl font-bold mb-6">Browse by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((category) => (
            <Link key={category.id} to={`/category/${category.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <h4 className="font-semibold text-sm">{category.label}</h4>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Featured Listings</h3>
            <Link to="/search">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {isLoading ? (
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
          ) : featuredListings && featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <Link key={listing.id} to={`/listing/${listing.id}`}>
                  <Card className="hover:shadow-xl transition-shadow h-full">
                    <CardHeader className="p-0">
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={listing.images[0] || 'https://placehold.co/600x400?text=No+Image'}
                          alt={listing.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                        {listing.status === 'sold' && (
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            Sold
                          </Badge>
                        )}
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
                    <CardFooter className="p-4 pt-0 flex items-center justify-between">
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
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No featured listings yet. Be the first to create a listing!
                </p>
                <Link to="/create-listing">
                  <Button className="mt-4">Create Listing</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 container mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12">How TrustMarket Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h4 className="font-semibold text-lg">List Your Item</h4>
            <p className="text-muted-foreground text-sm">
              Create a listing with photos and details. Set your price in GBP.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h4 className="font-semibold text-lg">Buyer Pays Securely</h4>
            <p className="text-muted-foreground text-sm">
              Payment goes into escrow via Lightning Network. Your funds are protected.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h4 className="font-semibold text-lg">Complete the Trade</h4>
            <p className="text-muted-foreground text-sm">
              Seller ships the item. Buyer confirms receipt through our messaging system.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary">4</span>
            </div>
            <h4 className="font-semibold text-lg">Funds Released</h4>
            <p className="text-muted-foreground text-sm">
              Once both parties confirm, funds are released to the seller automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">About TrustMarket</h4>
              <p className="text-sm text-muted-foreground">
                The UK's most trusted peer-to-peer marketplace, powered by Bitcoin Lightning for
                secure, instant payments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/how-it-works" className="hover:text-primary">How It Works</Link></li>
                <li><Link to="/how-it-works" className="hover:text-primary">Buyer Protection</Link></li>
                <li><Link to="/search" className="hover:text-primary">Browse Listings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/create-listing" className="hover:text-primary">Create Listing</Link></li>
                <li><Link to="/how-it-works" className="hover:text-primary">Seller Guide</Link></li>
                <li><Link to="/how-it-works" className="hover:text-primary">Fees & Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/how-it-works" className="hover:text-primary">Help Centre</Link></li>
                <li><Link to="/how-it-works" className="hover:text-primary">Safety Tips</Link></li>
                <li><a href="https://github.com/nostr-protocol/nips" target="_blank" rel="noopener noreferrer" className="hover:text-primary">About Nostr</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              Vibed with{' '}
              <a
                href="https://shakespeare.diy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Shakespeare
              </a>{' '}
              · © 2025 TrustMarket UK
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
