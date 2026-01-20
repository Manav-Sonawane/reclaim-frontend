import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reclaim",
  description: "Your trusted platform for lost and found items",
  icons: {
    icon: '/logo.png',
  },
};

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import SmartSearchChat from '../components/ai/SmartSearchChat';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <Navbar />
              <main className="min-h-[calc(100vh-4rem)]">
                {children}
              </main>
              <SmartSearchChat user={null} />
              <Toaster position="top-center" />
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
