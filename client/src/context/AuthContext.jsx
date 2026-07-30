import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { firebaseAuth } from '../firebase/app.js';
import { isFirebaseConfigured } from '../firebase/config.js';

/**
 * Who is signed in, when Firebase is configured.
 *
 * With no Firebase project the app runs in local mode: there is no account, no
 * sign-in screen, and progress goes to localStorage. That keeps a fresh clone
 * runnable with nothing to set up.
 *
 * Sign-in uses a popup rather than a redirect. A redirect round-trips through
 * the Firebase auth domain, and browsers that partition third-party storage can
 * lose the result on the way back — which would break sign-in on GitHub Pages.
 */
const AuthContext = createContext(null);

const LOCAL_MODE = {
  isEnabled: false,
  user: null,
  isLoading: false,
  error: null,
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
};

function FirebaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(
    () =>
      onAuthStateChanged(firebaseAuth(), (nextUser) => {
        setUser(nextUser);
        setIsLoading(false);
      }),
    [],
  );

  const handleSignIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(firebaseAuth(), new GoogleAuthProvider());
    } catch (signInError) {
      // Closing the popup is a normal thing to do, not something to report.
      if (signInError.code === 'auth/popup-closed-by-user') return;
      setError(signInError);
    }
  }, []);

  const handleSignOut = useCallback(() => signOut(firebaseAuth()), []);

  const value = useMemo(
    () => ({
      isEnabled: true,
      user,
      isLoading,
      error,
      signIn: handleSignIn,
      signOut: handleSignOut,
    }),
    [user, isLoading, error, handleSignIn, handleSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }) {
  if (!isFirebaseConfigured) {
    return <AuthContext.Provider value={LOCAL_MODE}>{children}</AuthContext.Provider>;
  }
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
