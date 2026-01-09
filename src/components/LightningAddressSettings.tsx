import { useState, useEffect } from 'react';
import { Zap, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { isValidLightningAddress } from '@/hooks/useAlbyPayments';

export function LightningAddressSettings() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const { mutate: publishEvent, isPending } = useNostrPublish();
  const [lightningAddress, setLightningAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load saved Lightning address from localStorage
    if (user) {
      const saved = localStorage.getItem(`shift:lightning:${user.pubkey}`);
      if (saved) {
        setLightningAddress(saved);
      }
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    if (!lightningAddress.trim()) {
      toast({
        title: 'Lightning Address Required',
        description: 'Please enter your Lightning address to receive payments',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidLightningAddress(lightningAddress)) {
      toast({
        title: 'Invalid Lightning Address',
        description: 'Please enter a valid Lightning address (e.g., user@getalby.com)',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    // Save to localStorage
    localStorage.setItem(`shift:lightning:${user.pubkey}`, lightningAddress);

    // Also publish to Nostr as kind 0 metadata update
    // This allows other clients to discover the Lightning address
    publishEvent(
      {
        kind: 0,
        content: JSON.stringify({
          lud16: lightningAddress, // NIP-57 Lightning address field
        }),
      },
      {
        onSuccess: () => {
          toast({
            title: 'Lightning Address Saved! ⚡',
            description: 'You can now receive payments from buyers',
          });
          setIsSaving(false);
        },
        onError: (error) => {
          toast({
            title: 'Failed to Save',
            description: error.message,
            variant: 'destructive',
          });
          setIsSaving(false);
        },
      }
    );
  };

  if (!user) {
    return null;
  }

  const hasAddress = lightningAddress && isValidLightningAddress(lightningAddress);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Lightning Address
        </CardTitle>
        <CardDescription>
          Add your Lightning address to receive payments from buyers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lightning-address">Lightning Address</Label>
          <Input
            id="lightning-address"
            type="text"
            placeholder="user@getalby.com"
            value={lightningAddress}
            onChange={(e) => setLightningAddress(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Format: username@domain.com (e.g., yourname@getalby.com)
          </p>
        </div>

        {hasAddress ? (
          <Alert className="bg-green-500/10 border-green-500/20">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              Lightning address configured! You can receive payments.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> You must add a Lightning address to receive payments when
              you sell items.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button onClick={handleSave} disabled={isSaving || isPending} className="w-full">
            {isSaving || isPending ? 'Saving...' : 'Save Lightning Address'}
          </Button>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-semibold">How to get a Lightning address:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                Sign up at{' '}
                <a
                  href="https://getalby.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Alby
                </a>
                ,{' '}
                <a
                  href="https://wallet.mutinywallet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Mutiny
                </a>
                , or another Lightning wallet
              </li>
              <li>Get your Lightning address (format: user@domain.com)</li>
              <li>Paste it here and click Save</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Get seller's Lightning address from storage
 */
export function getSellerLightningAddress(sellerPubkey: string): string | null {
  return localStorage.getItem(`shift:lightning:${sellerPubkey}`);
}
