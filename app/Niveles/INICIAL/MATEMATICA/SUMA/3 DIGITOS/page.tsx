'use client';
                    
                    import { useEffect, useState } from 'react';
                    import { useParams } from 'next/navigation';
                    // Componente para mostrar el contenido del subtema
                    export default function Page() {
                      const params = useParams();
                      const [contenido, setContenido] = useState<string>("");
                      const [cargando, setCargando] = useState<boolean>(true);
                      const [error, setError] = useState<string | null>(null);
                    
                      useEffect(() => {
                        async function cargarContenido() {
                          try {
                            // Llamada a la API para obtener el contenido actualizado
                            const response = await fetch('/api/obtenerContenidoSubtema', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                              nivel: 'INICIAL',
                              curso: 'MATEMATICA',
                              titulo: 'SUMA',
                              subtema: '3 DIGITOS'
                            }),
                            });
                    
                            if (!response.ok) {
                              throw new Error('Error al cargar el contenido');
                            }
                    
                            const data = await response.json();
                            setContenido(data.contenido || "Sin contenido disponible");
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
                    
// En tu API, dentro del fs.writeFileSync, cambia la parte del contenidoModificado por esto:
const contenidoModificado = (typeof contenido === 'string' ? contenido : '')
                    
                      return (
                        <div className="subtema-container bg-gray-100 p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
                          <div
                            className="contenido-subtema bg-white p-4 rounded-lg shadow-sm text-gray-700 space-y-4"
                            dangerouslySetInnerHTML={{
                              __html: contenidoModificado
                            }}
                          />
                        </div>
                      );
                    }