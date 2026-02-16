// Authentication utilities

const AUTH_TOKEN_KEY = 'authToken';

export const authManager = {
  // Get JWT token from localStorage
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Save JWT token to localStorage
  setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  // Remove JWT token from localStorage
  removeToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Basic check - you can add JWT expiry validation here
    try {
      // Decode JWT to check expiry (optional)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp && payload.exp * 1000 < Date.now();
      return !isExpired;
    } catch {
      // If token is malformed, consider it invalid
      return false;
    }
  },

  // Get user info from token (if needed)
  getUserInfo(): { userId?: string; email?: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.sub || payload.userId,
        email: payload.email,
      };
    } catch {
      return null;
    }
  },
};
