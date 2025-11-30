// src/app/layout.tsx
import { getServerSession } from "next-auth";  // Import getServerSession
import { authOptions } from "../pages/api/auth/[...nextauth]"; // Import your NextAuth options
import ClientSessionWrapper from "../components/ClientSessionWrapper"; // Import the wrapper
import { UserProvider } from "../contexts/UserContext"; // Import UserProvider
import { Geist, Geist_Mono } from 'next/font/google'; 
import { Metadata } from "next";  // Import Metadata for SEO
import "./globals.css";  // Import global styles

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AeroML",
  description: "Build Your Own AI Models with AEROML",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session with error handling for JWT decryption failures
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    // If JWT decryption fails (e.g., secret changed or missing), log and continue without session
    console.error('Session error (this is normal if NEXTAUTH_SECRET was recently changed):', error);
    session = null;
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap children with UserProvider and ClientSessionWrapper */}
        <UserProvider>
          <ClientSessionWrapper session={session}>
            {children}
          </ClientSessionWrapper>
        </UserProvider>
      </body>
    </html>
  );
}
