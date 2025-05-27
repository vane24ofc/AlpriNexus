"use client";

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React from 'react'; // Removed useEffect, useState as theme logic moves

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// VALID_THEME_CLASSES is no longer needed here as RootLayout doesn't manage theme classes.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Theme logic (useState, useEffect for applying theme class to <html>) is removed from here.
  // It will be handled by DashboardLayout.

  return (
    <html lang="es" suppressHydrationWarning>
      {/* The <html> tag will no longer have a dynamic theme class applied by RootLayout */}
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
