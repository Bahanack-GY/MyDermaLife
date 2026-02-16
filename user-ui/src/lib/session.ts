// Session Token Management for Guest Carts

const SESSION_TOKEN_KEY = 'sessionToken';

export const sessionManager = {
  // Get session token from localStorage
  getToken(): string | null {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  },

  // Save session token to localStorage
  setToken(token: string): void {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  },

  // Remove session token from localStorage
  removeToken(): void {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  },

  // Check if session token exists
  hasToken(): boolean {
    return !!this.getToken();
  },

  // Extract session token from response headers
  extractFromHeaders(headers: any): string | null {
    // Try multiple possible header names (case-insensitive)
    return (
      headers['x-session-token'] ||
      headers['X-Session-Token'] ||
      headers['session-token'] ||
      headers['Session-Token'] ||
      null
    );
  },
};
