// app/Pagar/page.tsx
'use client';

import Curso from '@/components/pagos/Curso';
import Nivel from '@/components/pagos/Nivel';
import Titulo from '@/components/pagos/Titulo';

export default function Pagar() {
  return (
    <div className="min-h-screen bg-[#000000] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-6xl font-bold text-center mb-8 text-[#A07526] overflow-hidden">
          COMPRAR SOMICOINS
        </h1>
        
        {/* Contenedor responsive - 3 columnas en desktop, 1 columna en móvil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Curso />
          <Nivel />
          <Titulo />
        </div>
      </div>
    </div>
  );
}