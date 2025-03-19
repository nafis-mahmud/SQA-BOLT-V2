import { supabase } from './supabase';

// Define our custom JWT payload interface
export interface UserJwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Generates a simple auth token for the extension
 * This is a simplified version that doesn't use JWT in the browser
 * @returns Promise with the token or null
 */
export async function generateAuthToken() {
  try {
    // Get current session from Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error("No authenticated session found:", sessionError);
      return null;
    }
    
    const user = sessionData.session.user;
    
    // Create a simple token with user data and expiration
    // In a real implementation, this would be a JWT created on the server
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    };
    
    // Base64 encode the payload
    const token = btoa(JSON.stringify(payload));
    
    return token;
  } catch (error) {
    console.error("Error generating auth token:", error);
    return null;
  }
}

/**
 * Verifies a token
 * This is a simplified version that doesn't use JWT verification in the browser
 * @param token The token to verify
 * @returns Object with validation result and decoded data
 */
export function verifyAuthToken(token: string): { valid: boolean, data?: UserJwtPayload, error?: string } {
  try {
    // Decode the base64 token
    const payloadStr = atob(token);
    const payload = JSON.parse(payloadStr) as UserJwtPayload;
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token expired' };
    }
    
    // Check if payload has required fields
    if (!payload.userId || !payload.email || !payload.role) {
      return { valid: false, error: 'Invalid token payload' };
    }
    
    return { valid: true, data: payload };
  } catch (error) {
    console.error("Token verification error:", error);
    return { valid: false, error: error.message };
  }
}

/**
 * Stores the authentication token in localStorage
 * @param token Token to store
 */
export function storeAuthToken(token: string) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('auth_token_timestamp', Date.now().toString());
  
  // Notify the extension about the token update
  try {
    // Send a message to the extension's content script
    window.postMessage({
      source: "extension-bridge",
      action: "authTokenResponse",
      token: token
    }, "*");
    
    console.log("Notified extension about token update");
  } catch (error) {
    console.error("Error notifying extension:", error);
  }
}

/**
 * Retrieves the authentication token from localStorage
 * @returns The stored token or null
 */
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Clears the authentication token from localStorage
 */
export function clearAuthToken() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('auth_token_timestamp');
}

/**
 * Checks if the stored token is expired
 * @returns Boolean indicating if token is expired
 */
export function isTokenExpired() {
  const token = getAuthToken();
  if (!token) return true;
  
  try {
    // Decode the base64 token
    const payloadStr = atob(token);
    const payload = JSON.parse(payloadStr) as UserJwtPayload;
    
    if (!payload || !payload.exp) return true;
    
    // Token exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
}
