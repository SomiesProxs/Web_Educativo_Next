'use client';

import { useEffect, useState } from 'react';

interface SubtemaData {
  nivel: string;
  curso: string;
  titulo: string;
  subtema: string;
}

interface ReadingContentProps {
  selectedSubtema?: SubtemaData | null;
  localTheme?: 0 | 1 | null;
}

export function ReadingContent({ selectedSubtema, localTheme = 0 }: ReadingContentProps) {
  const [contenido, setContenido] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSubtema) return;

    async function fetchContenido() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/obtenerContenidoSubtema', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedSubtema),
        });

        if (!res.ok) throw new Error('No se pudo cargar el contenido');

        const data = await res.json();
        setContenido(data.contenido || '<p>Sin contenido disponible</p>');
      } catch (err) {
        setError('Error al cargar el contenido del subtema');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchContenido();
  }, [selectedSubtema]);

  const getContainerStyles = () => {
    return localTheme === 1
      ? 'bg-[#111827] text-white'
      : 'bg-[#d5e9ea] text-gray-900';
  };

  const getWelcomeStyles = () => {
    return localTheme === 1
      ? 'bg-[#1F2937] border-gray-600'
      : 'bg-white border-gray-200';
  };

  if (!selectedSubtema) {
    return (
      <div className={`${getContainerStyles()} min-h-screen p-2 sm:p-6`}>
        <div className={`${getWelcomeStyles()} p-4 sm:p-8 rounded-lg border-2 shadow-lg`}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Bienvenido al Curso</h1>
          <p className="text-base sm:text-lg mb-6">
            Selecciona un subtema del panel izquierdo para comenzar a estudiar.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${getContainerStyles()} min-h-screen p-2 sm:p-6`}>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">Cargando contenido del subtema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${getContainerStyles()} min-h-screen p-2 sm:p-6`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Error al cargar el contenido</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getContainerStyles()} min-h-screen w-full`}>
      <div
        className={`
          prose dark:prose-invert max-w-none
          bg-white
          p-4 sm:p-6 md:p-8
          sm:rounded-lg sm:shadow-[0_5px_15px_rgba(0,0,0,0.1)]
          font-[Segoe_UI,_Tahoma,_Geneva,_Verdana,_sans-serif]
          text-[#333]
          text-sm sm:text-base
          leading-relaxed
          w-full
          sm:m-2 md:m-4
        `}
        dangerouslySetInnerHTML={{ __html: contenido }}
      />
    </div>
  );
}