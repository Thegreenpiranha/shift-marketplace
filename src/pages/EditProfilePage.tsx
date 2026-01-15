import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useShiftProfile, useUpdateShiftProfile } from '@/hooks/useShiftProfile';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { EnhancedLoginArea } from '@/components/auth/EnhancedLoginArea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function EditProfilePage() {
  const { user } = useCurrentUser();
  const author = useAuthor(user?.pubkey);
  const { data: shiftProfile } = useShiftProfile(user?.pubkey);
  const updateShiftProfile = useUpdateShiftProfile();
  const { publishMetadata } = useNostrPublish();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Nostr profile fields
  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [picture, setPicture] = useState('');
  const [website, setWebsite] = useState('');
  const [nip05, setNip05] = useState('');

  // Shift-specific fields
  const [customBio, setCustomBio] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [shippingInfo, setShippingInfo] = useState('');
  const [preferredPaymentMethods, setPreferredPaymentMethods] = useState('');
  const [location, setLocation] = useState('');

  const [isUpdatingNostr, setIsUpdatingNostr] = useState(false);
  const [isUpdatingShift, setIsUpdatingShift] = useState(false);

  // Load existing data
  useEffect(() => {
    if (author?.data?.metadata) {
      const metadata = author.data.metadata;
      setDisplayName(metadata.display_name || '');
      setName(metadata.name || '');
      setAbout(metadata.about || '');
      setPicture(metadata.picture || '');
      setWebsite(metadata.website || '');
      setNip05(metadata.nip05 || '');
    }
  }, [author]);

  useEffect(() => {
    if (shiftProfile) {
      setCustomBio(shiftProfile.customBio || '');
      setBusinessHours(shiftProfile.businessHours || '');
      setShippingInfo(shiftProfile.shippingInfo || '');
      setPreferredPaymentMethods(shiftProfile.preferredPaymentMethods?.join(', ') || '');
      setLocation(shiftProfile.location || '');
    }
  }, [shiftProfile]);

  const handleUpdateNostrProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingNostr(true);
    try {
      await publishMetadata({
        display_name: displayName,
        name,
        about,
        picture,
        website,
        nip05,
      });

      toast({
        title: 'Success',
        description: 'Nostr profile updated successfully',
      });
    } catch (error) {
      console.error('Failed to update Nostr profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update Nostr profile',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingNostr(false);
    }
  };

  const handleUpdateShiftProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingShift(true);
    try {
      await updateShiftProfile.mutateAsync({
        pubkey: user.pubkey,
        customBio,
        businessHours,
        shippingInfo,
        preferredPaymentMethods: preferredPaymentMethods.split(',').map(m => m.trim()).filter(Boolean),
        location,
      });

      toast({
        title: 'Success',
        description: 'Shift profile updated successfully',
      });

      // Navigate back to profile
      navigate(`/profile/${user.pubkey}`);
    } catch (error) {
      console.error('Failed to update Shift profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update Shift profile',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingShift(false);
    }
  };

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your Nostr profile (universal) and Shift-specific information
          </p>
        </div>

        <div className="space-y-6">
          {/* Nostr Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Nostr Profile</CardTitle>
              <CardDescription>
                This information is stored on the Nostr network and visible across all Nostr apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateNostrProfile} className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={picture} />
                    <AvatarFallback>{displayName[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="picture">Profile Picture URL</Label>
                    <Input
                      id="picture"
                      value={picture}
                      onChange={(e) => setPicture(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Username</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="username"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="about">About / Bio</Label>
                  <Textarea
                    id="about"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Tell people about yourself..."
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nip05">NIP-05 Identifier</Label>
                    <Input
                      id="nip05"
                      value={nip05}
                      onChange={(e) => setNip05(e.target.value)}
                      placeholder="you@domain.com"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isUpdatingNostr}>
                  {isUpdatingNostr && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Nostr Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* Shift-Specific Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Shift Marketplace Profile</CardTitle>
              <CardDescription>
                This information is only visible on Shift and helps buyers understand your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateShiftProfile} className="space-y-4">
                <div>
                  <Label htmlFor="customBio">Seller Bio (Shift-specific)</Label>
                  <Textarea
                    id="customBio"
                    value={customBio}
                    onChange={(e) => setCustomBio(e.target.value)}
                    placeholder="Additional information for Shift buyers..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., London, UK"
                  />
                </div>

                <div>
                  <Label htmlFor="businessHours">Business Hours</Label>
                  <Input
                    id="businessHours"
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    placeholder="e.g., Mon-Fri 9am-5pm GMT"
                  />
                </div>

                <div>
                  <Label htmlFor="shippingInfo">Shipping Information</Label>
                  <Textarea
                    id="shippingInfo"
                    value={shippingInfo}
                    onChange={(e) => setShippingInfo(e.target.value)}
                    placeholder="Delivery areas, shipping times, costs..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="preferredPaymentMethods">Preferred Payment Methods</Label>
                  <Input
                    id="preferredPaymentMethods"
                    value={preferredPaymentMethods}
                    onChange={(e) => setPreferredPaymentMethods(e.target.value)}
                    placeholder="Lightning, On-chain, Cash (comma separated)"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={isUpdatingShift}>
                    {isUpdatingShift && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Shift Profile
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/profile/${user.pubkey}`)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
