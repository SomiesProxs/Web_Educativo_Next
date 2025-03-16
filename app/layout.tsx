"use client";

import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <html lang="es">
        <head>
          {/* Tailwind CSS con CDN */}
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body className="bg-gray-100">{children}</body>
      </html>
    </SessionProvider>
  );
}
