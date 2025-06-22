'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    import('@splinetool/viewer');

    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {isMobile ? (
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
          alt="Fallback móvil"
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none z-0"
        />
      ) : (
        <spline-viewer
          url="https://prod.spline.design/fNAfkERP-hlFefcl/scene.splinecode"
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        />
      )}

      <div className="relative z-10 flex items-center justify-center h-full text-white p-4 text-center">
        <h1 className="text-4xl font-bold">
          {isMobile
            ? 'Versión móvil con imagen estática'
            : '¡Hola desde PC con animación Spline!'}
        </h1>
      </div>
    </div>
  );
}
