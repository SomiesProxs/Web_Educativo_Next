import { useEffect } from 'react';

// Declaración global para TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function Anuncios() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Adsense error:', e);
    }
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Anuncios de prueba</h2>

      {/* Anuncio responsivo */}
      <ins
        className="adsbygoogle block text-center"
        data-ad-client="ca-pub-2700415692306726"
        data-ad-slot="1234567890" // pon un ad slot válido aquí
        data-ad-format="auto"
        data-full-width-responsive="true"
      />

      {/* Otro anuncio, ejemplo banner */}
      <ins
        className="adsbygoogle block w-80 h-64 mx-auto my-5"
        data-ad-client="ca-pub-2700415692306726"
        data-ad-slot="0987654321" // otro ad slot válido
      />
    </div>
  );
}