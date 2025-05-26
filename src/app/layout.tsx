
"use client"; // Convert to client component to manage theme state

// import type { Metadata } from 'next'; // No longer used here
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect, useState } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Metadata cannot be exported from a Client Component.
// If you need to set a global title or description,
// you might need to do it in a different way or accept the default behavior.
// For example, individual pages can still export their own metadata.
// export const metadata: Metadata = {
//   title: 'NexusAlpri - Plataforma de Aprendizaje',
//   description: 'Una plataforma de aprendizaje moderna para estudiantes, instructores y administradores.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState('dark'); // Default theme

  useEffect(() => {
    const storedTheme = localStorage.getItem('nexusAlpriTheme');
    // Ensure window is defined (runs only on client)
    if (typeof window !== 'undefined') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (storedTheme) {
          setTheme(storedTheme);
        } else if (systemPrefersDark) {
          setTheme('dark');
        } else {
          setTheme('light'); // Default to light if no preference or storage
        }
    }
  }, []);

  useEffect(() => {
    // Ensure window is defined (runs only on client)
    if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
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
