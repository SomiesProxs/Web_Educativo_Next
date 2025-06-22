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
            nivel: 'COCINA',
            curso: 'PASTELERIA',
            titulo: 'Torta de gelatina', // Usar título original para buscar en BD
            subtema: 'Diseño' // Usar subtema original para buscar en BD
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

  if (cargando) return <div className="flex justify-center items-center h-64">
    <div className="text-lg">Cargando contenido...</div>
  </div>;
  
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    {error}
  </div>;

  return (
    <div className="subtema-container bg-gray-100 p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Torta de gelatina</h1>
      <h2 className="text-xl font-semibold mb-6 text-gray-700">Diseño</h2>
      <div
        className="contenido-subtema bg-white p-4 rounded-lg shadow-sm text-gray-700 space-y-4"
        dangerouslySetInnerHTML={{ __html: contenido }}
      />
    </div>
  );
}