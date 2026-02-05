// Auth Bridge - Listen for authentication from CDFA Hub parent window

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthMessage {
  type: 'CDFA_AUTH';
  action: 'AUTH_STATE_CHANGED' | 'LOGOUT';
  payload: {
    user: AuthUser | null;
    idToken: string | null;
  };
}

export interface AuthRequest {
  type: 'CDFA_AUTH_REQUEST';
  action: 'REQUEST_AUTH_STATE';
}

type AuthCallback = (user: AuthUser | null, idToken: string | null) => void;

// Check if running in an iframe
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true; // If we can't access window.top, we're likely in a cross-origin iframe
  }
}

// Auth bridge class for receiving auth from Hub
class AuthBridge {
  private callbacks: Set<AuthCallback> = new Set();
  private currentUser: AuthUser | null = null;
  private currentToken: string | null = null;
  private isListening = false;

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
  }

  private handleMessage(event: MessageEvent) {
    const data = event.data as AuthMessage;

    // Validate message type
    if (data?.type !== 'CDFA_AUTH') return;

    if (data.action === 'AUTH_STATE_CHANGED') {
      this.currentUser = data.payload.user;
      this.currentToken = data.payload.idToken;
      this.notifyCallbacks();
    } else if (data.action === 'LOGOUT') {
      this.currentUser = null;
      this.currentToken = null;
      this.notifyCallbacks();
    }
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => {
      callback(this.currentUser, this.currentToken);
    });
  }

  // Start listening for auth messages
  startListening() {
    if (this.isListening) return;

    window.addEventListener('message', this.handleMessage);
    this.isListening = true;

    // Request current auth state from parent if in iframe
    if (isInIframe()) {
      this.requestAuthState();
    }
  }

  // Stop listening for auth messages
  stopListening() {
    if (!this.isListening) return;

    window.removeEventListener('message', this.handleMessage);
    this.isListening = false;
  }

  // Request auth state from parent window
  requestAuthState() {
    if (!isInIframe()) return;

    const request: AuthRequest = {
      type: 'CDFA_AUTH_REQUEST',
      action: 'REQUEST_AUTH_STATE',
    };

    try {
      window.parent.postMessage(request, '*');
    } catch (e) {
      console.warn('Failed to request auth state from parent:', e);
    }
  }

  // Subscribe to auth changes
  onAuthChange(callback: AuthCallback): () => void {
    this.callbacks.add(callback);

    // Immediately call with current state
    callback(this.currentUser, this.currentToken);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  // Get current user
  getUser(): AuthUser | null {
    return this.currentUser;
  }

  // Get current token
  getToken(): string | null {
    return this.currentToken;
  }
}

// Singleton instance
export const authBridge = new AuthBridge();
