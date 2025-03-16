"use client";

import { SessionProvider } from "next-auth/react";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <html lang="es">
        <head>
          {/* Tailwind CSS con CDN usando Script de Next.js */}
          <Script 
            src="https://cdn.tailwindcss.com" 
            strategy="beforeInteractive" 
          />
        </head>
        <body className="bg-gray-100">{children}</body>
      </html>
    </SessionProvider>
  );
}