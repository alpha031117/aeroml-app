// src/app/layout.tsx
import { getServerSession } from "next-auth";  // Import getServerSession
import { authOptions } from "../pages/api/auth/[...nextauth]"; // Import your NextAuth options
import ClientSessionWrapper from "../components/ClientSessionWrapper"; // Import the wrapper
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
  const session = await getServerSession(authOptions);  // Fetch session

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap children with ClientSessionWrapper */}
        <ClientSessionWrapper session={session}>
          {children}
        </ClientSessionWrapper>
      </body>
    </html>
  );
}
