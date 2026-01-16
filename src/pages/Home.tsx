import { useState } from 'react';
import { Header } from '@/components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Search, TrendingUp, Shield, Zap, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useListings } from '@/hooks/useListings';
import { CATEGORIES, formatPrice, formatSats } from '@/types/marketplace';

export default function Home() {
  useSeoMeta({
    title: 'Shift - Buy and Sell Locally with Bitcoin',
    description: 'A modern peer-to-peer marketplace powered by Bitcoin Lightning and Nostr. Buy and sell securely with instant payments.',
  });

  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get recent listings instead of featured
  const { data: recentListings, isLoading } = useListings({ limit: 8 });
  
  const displayListings = recentListings;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, string> = {
      electronics: '📱',
      clothing: '👕',
      home: '🏠',
      vehicles: '🚗',
      books: '📚',
      sports: '⚽',
      toys: '🎮',
      other: '📦'
    };
    return icons[categoryId] || '📦';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold mb-6">
            Buy and Sell.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Powered by Nostr & Sats.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A UK-focused Bitcoin marketplace with instant Lightning payments and escrow protection.
            No middlemen. No fees beyond 2%.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-full border-2"
              />
              <Button 
                type="submit" 
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>{recentListings?.length || 0}+ active listings</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Escrow protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Lightning fast payments</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-2xl font-bold mb-8">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => (
              <Link key={category.id} to={`/category/${category.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{getCategoryIcon(category.id)}</div>
                    <h4 className="font-semibold">{category.label}</h4>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16 px-4 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold">Recent Listings</h3>
            <Link to="/search">
              <Button variant="ghost">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading listings...</div>
          ) : displayListings && displayListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayListings?.map((listing) => (
                <Link key={listing.id} to={`/listing/${listing.id}`}>
                  <Card className="hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="aspect-square bg-secondary/20 rounded-t-lg overflow-hidden">
                        {listing.images[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            {getCategoryIcon(listing.category)}
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="p-4">
                        <h4 className="font-semibold mb-2 line-clamp-2">{listing.title}</h4>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(listing.price, listing.currency)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatSats(listing.priceSats)}
                          </span>
                        </div>
                        {listing.location && (
                          <p className="text-sm text-muted-foreground">📍 {listing.location}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No listings yet. Be the first to list an item!</p>
              <Link to="/create-listing">
                <Button size="lg">Create Listing</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-bold mb-12">How Shift Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h4 className="font-semibold mb-2">List Your Item</h4>
              <p className="text-sm text-muted-foreground">
                Create a listing with photos and description. Price in GBP (UK pounds) or Bitcoin sats.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h4 className="font-semibold mb-2">Buyer Pays with Lightning</h4>
              <p className="text-sm text-muted-foreground">
                Instant Bitcoin payment held in escrow for buyer protection.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h4 className="font-semibold mb-2">Ship & Get Paid</h4>
              <p className="text-sm text-muted-foreground">
                Buyer confirms delivery, you receive payment. Simple and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-16">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2026 Shift. Powered by Bitcoin Lightning & Nostr.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground">
                How It Works
              </Link>
              <a href="https://github.com/nostr-protocol" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                About Nostr
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}