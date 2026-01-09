import { useState } from 'react';
import { Mail, KeyRound, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';
import { LoginArea } from '@/components/auth/LoginArea';
import { cn } from '@/lib/utils';

interface EnhancedLoginAreaProps {
  className?: string;
  onLoginSuccess?: () => void;
}

export function EnhancedLoginArea({ className, onLoginSuccess }: EnhancedLoginAreaProps) {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showNostrOptions, setShowNostrOptions] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    toast({
      title: 'Google Sign In',
      description: 'Google OAuth integration coming soon. For now, use email or Nostr.',
    });
    // TODO: Implement Google OAuth
    // const provider = new GoogleAuthProvider();
    // const result = await signInWithPopup(auth, provider);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your email and password',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please make sure your passwords match',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implement email/password authentication
      // For now, show placeholder message
      toast({
        title: isLogin ? 'Email Sign In' : 'Email Sign Up',
        description: 'Email/password authentication coming soon. For now, use Nostr login below.',
      });

      // Simulated authentication
      // if (isLogin) {
      //   await signInWithEmailAndPassword(auth, email, password);
      // } else {
      //   await createUserWithEmailAndPassword(auth, email, password);
      // }

      // onLoginSuccess?.();
    } catch (error) {
      toast({
        title: 'Authentication Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle>{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
        <CardDescription>
          {isLogin
            ? 'Sign in to your Shift account'
            : 'Join Shift to start buying and selling'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Sign In */}
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
            disabled={isLoading}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNostrOptions(!showNostrOptions)}
              className="bg-background px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {showNostrOptions ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  Hide Advanced Options
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  Advanced Options
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Nostr Login (Advanced) */}
        {showNostrOptions && (
          <div className="space-y-3">
            <Alert>
              <AlertDescription className="text-xs">
                <strong>For Advanced Users:</strong> Sign in with Nostr for maximum privacy and
                decentralization. Your account is controlled by your private key, not by Shift.
              </AlertDescription>
            </Alert>
            <LoginArea className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
