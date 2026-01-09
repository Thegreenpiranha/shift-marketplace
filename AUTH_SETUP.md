# Authentication Setup Guide

Shift now supports multiple authentication methods with email/Google as the primary options and Nostr as an advanced option for privacy-focused users.

## Current Implementation

### ✅ UI Complete
- **Email/Password Form**: Full UI with validation
- **Google OAuth Button**: Styled with official Google branding
- **Nostr Login**: Hidden under "Advanced Options" collapsible section
- **Sign Up/Sign In Toggle**: Easy switching between modes
- **Responsive Design**: Works on all devices

### ⚠️ Backend Required

The following authentication methods need backend implementation:

## Option 1: Firebase Authentication (Recommended)

Firebase provides easy-to-use authentication with Google OAuth and email/password out of the box.

### Setup Steps

1. **Install Firebase**:
```bash
npm install firebase
```

2. **Create Firebase Project**:
   - Go to https://console.firebase.google.com
   - Create new project
   - Enable Authentication
   - Enable Google Sign-In provider
   - Enable Email/Password provider

3. **Get Configuration**:
   - Project Settings → General → Your apps → Web app
   - Copy Firebase configuration

4. **Create Firebase Config** (`src/lib/firebase.ts`):
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

5. **Add Environment Variables** (`.env`):
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

6. **Update EnhancedLoginArea Component**:

Replace the placeholder functions with:

```typescript
import { auth, googleProvider } from '@/lib/firebase';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// In handleGoogleLogin:
const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    toast({
      title: 'Welcome!',
      description: `Signed in as ${result.user.email}`,
    });
    onLoginSuccess?.();
  } catch (error) {
    toast({
      title: 'Sign In Failed',
      description: error instanceof Error ? error.message : 'Failed to sign in',
      variant: 'destructive',
    });
  }
};

// In handleEmailAuth:
try {
  if (isLogin) {
    await signInWithEmailAndPassword(auth, email, password);
    toast({ title: 'Welcome back!' });
  } else {
    await createUserWithEmailAndPassword(auth, email, password);
    toast({ title: 'Account created successfully!' });
  }
  onLoginSuccess?.();
} catch (error) {
  // Handle error
}
```

7. **Create Auth Context Hook** (`src/hooks/useFirebaseAuth.ts`):
```typescript
import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
```

## Option 2: Supabase Authentication

Supabase is another excellent option with built-in Google OAuth and email authentication.

### Setup Steps

1. **Install Supabase**:
```bash
npm install @supabase/supabase-js
```

2. **Create Supabase Project**:
   - Go to https://supabase.com
   - Create new project
   - Enable Email authentication
   - Configure Google OAuth provider

3. **Get Configuration**:
   - Project Settings → API
   - Copy URL and anon key

4. **Create Supabase Client** (`src/lib/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

5. **Implement Authentication**:
```typescript
// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// Email Sign Up
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
});

// Email Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
});

// Sign Out
const { error } = await supabase.auth.signOut();
```

## Option 3: Auth0

For enterprise-grade authentication with advanced features.

1. Install: `npm install @auth0/auth0-react`
2. Set up Auth0 tenant
3. Configure providers
4. Wrap app in Auth0Provider

## Hybrid Approach: Link Firebase + Nostr

To maintain Nostr compatibility while offering traditional auth:

1. **User Signs In with Email/Google** → Creates Firebase account
2. **Generate Nostr Identity** → Create nsec/npub pair for user
3. **Store Encrypted** → Save encrypted nsec in Firebase user profile
4. **Seamless Experience** → User gets both traditional auth + Nostr identity

### Implementation:

```typescript
import { generatePrivateKey, getPublicKey } from 'nostr-tools';
import { encrypt, decrypt } from '@/lib/crypto'; // Use a proper encryption library

async function createUserWithNostrIdentity(email: string, password: string) {
  // 1. Create Firebase account
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // 2. Generate Nostr keys
  const nsec = generatePrivateKey();
  const npub = getPublicKey(nsec);
  
  // 3. Encrypt private key with user's password (or derived key)
  const encryptedNsec = await encrypt(nsec, password);
  
  // 4. Store in Firestore
  await setDoc(doc(firestore, 'users', userCredential.user.uid), {
    email,
    npub,
    encryptedNsec,
    createdAt: new Date()
  });
  
  return { uid: userCredential.user.uid, npub };
}
```

**Benefits:**
- Traditional users get familiar email/Google login
- Automatically get Nostr identity for decentralized features
- Can export keys later if they want full control
- Best of both worlds

## User Migration Path

For existing Nostr users who want to add email login:

1. User logs in with Nostr
2. Offer "Add Email Login" in settings
3. Link Firebase account to Nostr pubkey
4. User can now use either method

```typescript
async function linkEmailToNostrAccount(nostrPubkey: string, email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  await setDoc(doc(firestore, 'users', userCredential.user.uid), {
    email,
    nostrPubkey,
    linkedAt: new Date()
  });
  
  await setDoc(doc(firestore, 'nostrAccounts', nostrPubkey), {
    firebaseUid: userCredential.user.uid
  });
}
```

## Security Considerations

### ✅ DO:
- Use environment variables for all API keys
- Enable email verification (Firebase/Supabase setting)
- Implement rate limiting on auth endpoints
- Use HTTPS in production
- Store sensitive data encrypted
- Implement password reset flow
- Add 2FA for high-value accounts

### ❌ DON'T:
- Never store passwords in plain text
- Don't expose Firebase/Supabase keys in frontend (they're OK if properly configured)
- Don't skip email verification
- Don't allow weak passwords
- Don't store Nostr private keys unencrypted

## Testing

### Test Accounts
Create test accounts for:
- Google OAuth (use personal Google account)
- Email/password (use temp email service)
- Nostr (use existing nsec)

### Test Scenarios
- [ ] Google sign in works
- [ ] Email sign up works
- [ ] Email sign in works
- [ ] Password reset works (if implemented)
- [ ] Sign out works for all methods
- [ ] Nostr login still works in Advanced Options
- [ ] Session persists on page reload
- [ ] Protected routes redirect to login

## Cost Estimate

**Firebase Free Tier:**
- 10,000 auth users/month: Free
- Google OAuth: Included
- Email/Password: Included
- Custom domains: Paid plans only

**Supabase Free Tier:**
- 50,000 auth users/month: Free
- Google OAuth: Included
- Email verification: Included

Both are free for moderate usage!

## Current Component Locations

The login UI is ready in:
- `src/components/auth/EnhancedLoginArea.tsx` - Main component
- Used in: CreateListing, MyListings, MessagesPage, Settings

Simply uncomment the TODO sections and add the Firebase/Supabase code!

## Next Steps

1. **Choose Provider**: Firebase or Supabase (or both!)
2. **Set Up Project**: Create account, configure providers
3. **Add Dependencies**: Install Firebase/Supabase SDK
4. **Configure**: Add environment variables
5. **Implement**: Replace TODOs with actual auth code
6. **Test**: Verify all flows work
7. **Deploy**: Push to production

## Questions?

- **Firebase Docs**: https://firebase.google.com/docs/auth
- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Nostr Tools**: https://github.com/nbd-wtf/nostr-tools
