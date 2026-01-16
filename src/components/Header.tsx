import { Link } from 'react-router-dom';
import { Menu, Heart } from 'lucide-react';
import { LocationSelector } from './LocationSelector';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function Header() {
  const { user } = useCurrentUser();

  return (
    <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Shift
            </h1>
          </Link>

          {/* Desktop Nav */}
            <LocationSelector />
          <nav className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/my-listings">
                  <Button variant="ghost">My Listings</Button>
                </Link>
                <Link to="/messages">
                <Link to="/favorites">
                  <Button variant="ghost">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                </Link>
                  <Button variant="ghost">Messages</Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost">Settings</Button>
                </Link>
                <Link to="/create-listing">
                  <Button>Sell an Item</Button>
                </Link>
              </>
            ) : (
              <Link to="/create-listing">
                <Button>Sign In</Button>
              </Link>
            )}
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden">
            {user ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <div className="mb-4">
                      <LocationSelector />
                    </div>
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link to="/my-listings" className="w-full">
                      <Button variant="ghost" className="w-full justify-start">My Listings</Button>
                    </Link>
                    <Link to="/messages" className="w-full">
                    <Link to="/favorites" className="w-full">
                      <Button variant="ghost" className="w-full justify-start">
                        <Heart className="h-4 w-4 mr-2" />
                        Favorites
                      </Button>
                    </Link>
                <Link to="/favorites">
                  <Button variant="ghost">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                </Link>
                      <Button variant="ghost" className="w-full justify-start">Messages</Button>
                    </Link>
                    <Link to="/settings" className="w-full">
                      <Button variant="ghost" className="w-full justify-start">Settings</Button>
                    </Link>
                    <Link to="/create-listing" className="w-full">
                      <Button className="w-full">Sell an Item</Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            ) : (
              <Link to="/create-listing">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
