
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
  'theme-spring-meadow',
  'theme-steel-blue',
  'theme-vintage-paper',
  'theme-royal-gold',
  'theme-sakura-blossom',
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
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
         initialTheme = 'theme-light';
      }
    }
    setTheme(initialTheme);
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        VALID_THEME_CLASSES.forEach(cls => root.classList.remove(cls));

        if (theme) {
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
    
    