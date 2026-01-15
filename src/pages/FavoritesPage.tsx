import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthor } from '@/hooks/useAuthor';
import { EnhancedLoginArea } from '@/components/auth/EnhancedLoginArea';
import { Heart, Package } from 'lucide-react';

function FavoritedSeller({ sellerPubkey }: { sellerPubkey: string }) {
  const author = useAuthor(sellerPubkey);
  
  return (
    <Link to={`/profile/${sellerPubkey}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={author?.data?.metadata?.picture} />
              <AvatarFallback className="text-xl">
                {(author?.data?.metadata?.display_name || author?.data?.metadata?.name || 'U')[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {author?.data?.metadata?.display_name || author?.data?.metadata?.name || 'Anonymous'}
              </h3>
              {author?.data?.metadata?.about && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {author.data.metadata.about}
                </p>
              )}
            </div>
            <Heart className="h-5 w-5 text-red-500 fill-current flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function FavoritesPage() {
  const { user } = useCurrentUser();
  const { data: favoritesData, isLoading } = useFavorites(user?.pubkey);
  const favorites = favoritesData?.favorites || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <EnhancedLoginArea />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Favorite Sellers</h1>
          </div>
          <p className="text-muted-foreground">
            Sellers you've favorited for quick access
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Start favoriting sellers to keep track of your trusted traders
            </p>
            <Button asChild>
              <Link to="/search">
                <Package className="h-4 w-4 mr-2" />
                Browse Listings
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <FavoritedSeller key={favorite.sellerPubkey} sellerPubkey={favorite.sellerPubkey} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
