
"use client";

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect, useState } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const VALID_THEME_CLASSES = ['theme-light', 'dark', 'theme-oceanic', 'theme-sunset', 'theme-forest'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState('dark'); // Default theme

  useEffect(() => {
    // This effect runs once on mount to set the initial theme based on localStorage or system preference
    let initialTheme = 'dark'; // Default
    const storedTheme = localStorage.getItem('nexusAlpriTheme');
    
    if (storedTheme && VALID_THEME_CLASSES.includes(storedTheme)) {
      initialTheme = storedTheme;
    } else {
      // If no stored theme, check system preference (only if window is defined)
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches && !VALID_THEME_CLASSES.includes('light')) {
        // If system prefers light and 'light' is not the one represented by :root or theme-light
        // For now, we default to 'dark' if no stored theme, or 'theme-light' if we make it explicit.
        // Let's simplify: if no stored theme, default to 'dark' or 'theme-light'
         initialTheme = 'theme-light'; // Or 'dark' if that's preferred default without storage
      }
    }
    setTheme(initialTheme);
  }, []);


  useEffect(() => {
    // This effect applies the theme class to <html> whenever 'theme' state changes
    if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        // Remove all known theme classes first
        VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
        
        // Add the current theme class
        if (theme !== 'theme-light') { // Assuming 'theme-light' is represented by :root or .theme-light
            root.classList.add(theme);
        } else {
            root.classList.add('theme-light'); // Explicitly add light if it's the one
        }
        localStorage.setItem('nexusAlpriTheme', theme);
    }
  }, [theme]);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

    