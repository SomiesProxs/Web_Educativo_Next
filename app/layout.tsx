"use client";

import { SessionProvider } from "next-auth/react";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <html lang="es" className="bg-black">
        <head>
          {/* Tailwind CSS con CDN usando Script de Next.js */}
          <Script 
            src="https://cdn.tailwindcss.com" 
            strategy="beforeInteractive" 
          />
          
          {/* Spline Viewer */}
          <Script
            src="https://unpkg.com/@splinetool/viewer@1.0.21/build/spline-viewer.js"
            strategy="beforeInteractive"
          />
          
          {/* Google AdSense */}
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2700415692306726"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        </head>
        <body className="bg-black text-white">{children}</body>
      </html>
    </SessionProvider>
  );
}