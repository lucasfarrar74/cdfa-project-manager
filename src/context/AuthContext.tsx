import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authBridge, isInIframe, type AuthUser } from '../services/authBridge';

interface AuthContextType {
  user: AuthUser | null;
  idToken: string | null;
  isLoading: boolean;
  isInHub: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInHub = isInIframe();

  useEffect(() => {
    // Start listening for auth messages from Hub
    authBridge.startListening();

    // Subscribe to auth changes
    const unsubscribe = authBridge.onAuthChange((authUser, token) => {
      setUser(authUser);
      setIdToken(token);
      setIsLoading(false);
    });

    // If not in iframe, stop loading after a short delay
    // (no auth will come from parent)
    if (!isInHub) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => {
        clearTimeout(timeout);
        unsubscribe();
        authBridge.stopListening();
      };
    }

    // Request auth state again after a short delay
    // (in case the initial request was too early)
    const retryTimeout = setTimeout(() => {
      if (!user) {
        authBridge.requestAuthState();
      }
    }, 1000);

    return () => {
      clearTimeout(retryTimeout);
      unsubscribe();
      authBridge.stopListening();
    };
  }, [isInHub, user]);

  return (
    <AuthContext.Provider value={{ user, idToken, isLoading, isInHub }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Re-export AuthUser type
export type { AuthUser };
