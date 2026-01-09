import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
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
            You need to be logged in to view your messages
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
              <Link to="/create-listing">
                <Button>Sell an Item</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <Card className="border-dashed">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle>Secure Messaging</CardTitle>
            <CardDescription>
              Direct messaging between buyers and sellers will be available here
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-sm text-muted-foreground mb-6">
              When you contact a seller or receive a message about your listing, it will appear here.
              All messages are encrypted for your privacy.
            </p>
            <Link to="/search">
              <Button>Browse Listings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
