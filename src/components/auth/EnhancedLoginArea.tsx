import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoginArea } from '@/components/auth/LoginArea';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface EnhancedLoginAreaProps {
  className?: string;
  onLoginSuccess?: () => void;
}

export function EnhancedLoginArea({ className, onLoginSuccess }: EnhancedLoginAreaProps) {
  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle>Sign In to Shift</CardTitle>
        <CardDescription>
          Connect with your Nostr account to start buying and selling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <AlertDescription className="text-sm">
            <strong>New to Nostr?</strong> Create a free account with{' '}
            
              <a href="https://primal.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              Primal <ExternalLink className="h-3 w-3" />
            </a>
            , then come back and sign in.
          </AlertDescription>
        </Alert>

        <LoginArea className="w-full" onLoginSuccess={onLoginSuccess} />

        <Alert>
          <AlertDescription className="text-xs text-muted-foreground">
            Your account is controlled by your Nostr keys, not by Shift. We never see or store your private keys.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
