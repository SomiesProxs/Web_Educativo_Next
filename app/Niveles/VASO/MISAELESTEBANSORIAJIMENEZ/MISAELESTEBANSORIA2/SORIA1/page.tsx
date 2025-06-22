'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const [contenido, setContenido] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarContenido() {
      try {
        const response = await fetch('/api/obtenerContenidoSubtema', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nivel: 'VASO',
            curso: 'MISAELESTEBANSORIAJIMENEZ',
            titulo: 'MISAELESTEBANSORIA2',
            subtema: 'SORIA1'
          }),
        });

        if (!response.ok) throw new Error('Error al cargar el contenido');

        const data = await response.json();
        const contenidoModificado = (typeof data.contenido === 'string' ? data.contenido : '');

        setContenido(contenidoModificado || "Sin contenido disponible");
      } catch (err) {
        console.error("Error:", err);
        setError("No se pudo cargar el contenido. Por favor, intenta más tarde.");
      } finally {
        setCargando(false);
      }
    }

    cargarContenido();
  }, []);

  if (cargando) return <div>Cargando contenido...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="subtema-container bg-gray-100 p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
      <div
        className="contenido-subtema bg-white p-4 rounded-lg shadow-sm text-gray-700 space-y-4"
        dangerouslySetInnerHTML={{ __html: contenido }}
      />
    </div>
  );
}