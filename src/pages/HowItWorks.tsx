import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Lock, MessageSquare, Zap, CheckCircle, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  useSeoMeta({
    title: 'How It Works - TrustMarket UK',
    description: 'Learn how to buy and sell safely on TrustMarket with escrow protection and Lightning Network payments.',
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary">TrustMarket</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/search">
                <Button variant="ghost">Browse</Button>
              </Link>
              <Link to="/create-listing">
                <Button>Sell an Item</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">How TrustMarket Works</h1>
          <p className="text-xl text-muted-foreground">
            Safe, secure peer-to-peer trading with escrow protection
          </p>
        </div>

        {/* For Buyers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">For Buyers</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <div>
                    <CardTitle>Find What You Need</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-muted-foreground">
                  Browse listings by category or search for specific items. Filter by location to find
                  items near you. Check seller ratings and reviews before making a decision.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Contact the Seller
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-muted-foreground">
                  Send a secure, encrypted message to the seller to discuss the item. Ask questions,
                  negotiate the price, and arrange collection or delivery details.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Pay Securely
                      <Lock className="h-5 w-5 text-primary" />
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-muted-foreground mb-4">
                  When you're ready to buy, pay using Bitcoin Lightning Network. Your payment is held
                  in secure escrow - the seller won't receive it until you confirm you've received the
                  item.
                </p>
                <div className="bg-accent/30 border border-primary/20 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Your Payment is Protected</span>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground pl-7">
                    <li>• Funds held until delivery confirmed</li>
                    <li>• 2% platform fee on successful transactions</li>
                    <li>• 14-day buyer protection window</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">4</span>
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Confirm Receipt
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-muted-foreground">
                  Once you receive the item and are satisfied with it, confirm the receipt through our
                  messaging system. This releases the payment to the seller. Leave a review to help
                  other buyers.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* For Sellers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">For Sellers</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <div>
                    <CardTitle>Create Your Listing</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-muted-foreground">
                  Take clear photos, write a detailed description, and set your price in GBP. Choose
                  the right category and add your location to help buyers find your item.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <div>
                    <CardTitle>Communicate with Buyers</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-muted-foreground">
                  Respond promptly to buyer inquiries. Answer questions honestly and arrange a
                  convenient time for collection or shipping.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Deliver the Item
                      <Zap className="h-5 w-5 text-primary" />
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-muted-foreground">
                  Once the buyer pays, the funds are held in escrow. Ship or hand over the item as
                  agreed. Confirm delivery through the messaging system.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">4</span>
                  </div>
                  <div>
                    <CardTitle>Get Paid Instantly</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-muted-foreground mb-4">
                  After the buyer confirms receipt, the escrowed funds are released to you instantly
                  via Lightning Network. Build your reputation by providing great service!
                </p>
                <div className="bg-accent/30 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Build Your Reputation</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Get 10+ positive reviews with an average rating of 4.5+ to become a Verified
                    Seller and gain buyer trust.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Safety Tips</h2>
          <Card className="bg-accent/30 border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Do
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground pl-7">
                    <li>• Check seller ratings and reviews</li>
                    <li>• Ask for additional photos if needed</li>
                    <li>• Meet in safe, public places for collections</li>
                    <li>• Use the platform's messaging system</li>
                    <li>• Confirm receipt after inspection</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Don't
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground pl-7">
                    <li>• Pay outside the platform</li>
                    <li>• Share personal banking details</li>
                    <li>• Accept deals that seem too good to be true</li>
                    <li>• Meet in isolated locations</li>
                    <li>• Rush into a purchase</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search">
              <Button size="lg" variant="outline">
                Browse Listings
              </Button>
            </Link>
            <Link to="/create-listing">
              <Button size="lg">
                Create Your First Listing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
