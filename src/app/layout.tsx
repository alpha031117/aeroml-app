// src/app/layout.tsx
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap children with UserProvider */}
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
