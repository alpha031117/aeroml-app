
      // CredentialsProvider({
      //   name: "Credentials",
      //   credentials: {
      //     username: { label: "Username", type: "text" },
      //     password: { label: "Password", type: "password" },
      //   },
      //   async authorize(credentials) {
      //     if (credentials && credentials.username === "admin" && credentials.password === "password") {
      //       return { id: "1", name: "Admin", email: "admin@example.com" };
      //     }
      //     return null;
      //   },
      // }),


// src/app/api/auth/[...nextauth].ts
// src/pages/api/auth/[...nextauth].ts

import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Build providers array conditionally - only include Google if credentials are available
const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Ensure at least one provider is configured
if (providers.length === 0) {
  console.warn(
    '[NextAuth] No authentication providers configured. ' +
    'Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local for Google OAuth, ' +
    'or configure a CredentialsProvider for username/password authentication.'
  );
}

export const authOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET, // Required for JWT encryption/decryption
  pages: {
    signIn: "/auth/login",  // Optional custom sign-in page
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Handle JWT token creation/update
      if (user) {
        // Store user ID (for Google OAuth, this is the Google account ID - token_id)
        token.id = user.id;
        // Store provider info to identify auth method
        if (account) {
          token.provider = account.provider;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Handle session creation
      if (token) {
        session.user = { 
          ...session.user, 
          id: token.id as string, // This is the token_id for Google auth
        };
        // Add provider info to session if needed
        if (token.provider) {
          (session as any).provider = token.provider;
        }
      }
      return session;
    },
  },
  events: {
    async signOut() {
      // Clear any problematic tokens on sign out
    },
  },
  // Custom logger to suppress JWT decryption errors from old/invalid tokens
  logger: {
    error(code, metadata) {
      // Suppress JWT_SESSION_ERROR for decryption failures (old tokens)
      if (code === 'JWT_SESSION_ERROR' && 
          (metadata?.error?.message?.includes('decryption operation failed') ||
           metadata?.error?.name === 'JWEDecryptionFailed')) {
        // Silently ignore - these are from old/invalid tokens that will be cleared
        return;
      }
      // Log other errors normally
      console.error('[next-auth][error]', code, metadata);
    },
    warn(code) {
      console.warn('[next-auth][warn]', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[next-auth][debug]', code, metadata);
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Check if providers are configured before initializing NextAuth
    if (providers.length === 0) {
      if (req.url?.includes('/providers')) {
        return res.status(200).json({});
      }
      if (req.url?.includes('/session')) {
        return res.status(200).json({});
      }
      return res.status(500).json({
        error: 'No authentication providers configured',
        message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local',
      });
    }
    
    return await NextAuth(req, res, authOptions);
  } catch (error: any) {
    // Handle JWT decryption errors gracefully
    if (error?.message?.includes('decryption operation failed') || 
        error?.name === 'JWEDecryptionFailed') {
      // Clear the problematic session cookie
      res.setHeader('Set-Cookie', [
        'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
        'next-auth.csrf-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
        '__Secure-next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure',
        '__Host-next-auth.csrf-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure',
      ].join(', '));
      
      // Return a clean response - redirect to sign in or return empty session
      if (req.url?.includes('/session')) {
        return res.status(200).json({});
      }
    }
    
    // Handle OAuth configuration errors
    if (error?.message?.includes('client_id is required') || 
        error?.message?.includes('clientId is required')) {
      console.error(
        '[NextAuth] OAuth provider configuration error. ' +
        'Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local'
      );
      if (req.url?.includes('/providers')) {
        return res.status(200).json({});
      }
      return res.status(500).json({
        error: 'OAuth provider not configured',
        message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local',
      });
    }
    
    // Re-throw other errors
    throw error;
  }
};

export default handler;
