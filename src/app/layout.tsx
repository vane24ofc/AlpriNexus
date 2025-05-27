
"use client";

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect, useState } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const VALID_THEME_CLASSES = [
  'theme-light', 
  'dark', 
  'theme-oceanic', 
  'theme-sunset', 
  'theme-forest', 
  'theme-monochrome-midnight',
  'theme-crimson-night',
  'theme-lavender-haze',
  'theme-spring-meadow'
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState('dark'); // Default theme

  useEffect(() => {
    let initialTheme = 'dark'; 
    const storedTheme = localStorage.getItem('nexusAlpriTheme');
    
    if (storedTheme && VALID_THEME_CLASSES.includes(storedTheme)) {
      initialTheme = storedTheme;
    } else {
      // Check system preference if no theme is stored or stored theme is invalid
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
         // If system prefers light and no valid theme is stored, set to 'theme-light'
         // This ensures 'light' is explicitly 'theme-light' for CSS class logic
         initialTheme = 'theme-light'; 
      }
      // If system prefers dark or no preference, it defaults to 'dark' (our initial state)
    }
    setTheme(initialTheme);
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        // Remove all known theme classes first
        VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));
        
        // Add the selected theme class
        // The default light theme is applied by :root, so 'theme-light' class explicitly adds it.
        // Other themes (dark, oceanic, etc.) will have their specific classes.
        if (theme) { // Ensure theme is not empty or null
            root.classList.add(theme);
        }
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
    
    