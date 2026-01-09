import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { LightningAddressSettings } from '@/components/LightningAddressSettings';
import { Settings as SettingsIcon, Zap, User } from 'lucide-react';

export default function Settings() {
  const { user } = useCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-2">
                  <div className="text-lg font-bold text-primary-foreground">S</div>
                </div>
                <h1 className="text-xl font-bold text-primary">Shift</h1>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access settings
          </p>
          <LoginArea className="flex justify-center" />
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            <LightningAddressSettings />

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  How payments work on Shift
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <h3 className="font-semibold">For Sellers:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Add your Lightning address to receive payments</li>
                    <li>When a buyer pays, funds are held in escrow</li>
                    <li>After you ship and buyer confirms, you receive 98% of item price</li>
                    <li>Platform keeps 2% fee automatically</li>
                    <li>Payments arrive instantly via Lightning Network</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">For Buyers:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Pay with any Lightning wallet (Alby, Phoenix, Muun, etc.)</li>
                    <li>Your payment is protected by escrow</li>
                    <li>Seller only receives payment after you confirm delivery</li>
                    <li>14-day protection window for disputes</li>
                    <li>Total cost includes 2% platform fee</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your Shift profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your profile is managed through your Nostr identity. You can update your name,
                  avatar, and bio using any Nostr client.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
