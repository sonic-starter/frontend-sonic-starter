"use client";

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from './auth/Providers';
import Footer from '@/components/ui/Footer';

import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/ui/header';


const inter = Inter({ subsets: ['latin'] });

const metadata: Metadata = {
  title: 'Gintonic AI Agents',
  description: 'Browse and create AI agents for your specific needs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <Providers>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <aside className="w-64 h-full py-6 border-r border-borderColor flex flex-col fixed">
        <Header />
      </aside>
              {children}
              {/* <Footer /> */}
            </ThemeProvider>
          </Providers>

        </AuthProvider>
      </body>
    </html>
  );
}