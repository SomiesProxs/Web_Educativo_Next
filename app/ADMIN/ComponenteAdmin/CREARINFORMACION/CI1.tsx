'use client';

import React, { useEffect, useState } from 'react';

type Subtema = {
  nombre: string;
  contenido?: string;
  _id?: string;
  imagenes?: ImageData[];
};

type ImageData = {
  id: string | number;
  name: string;
  originalName?: string;
  url: string;
  publicId?: string;
  uploadedAt?: string;
  file?: File;
};

type CursoData = {
  _id: string;
  nivel: string;
  curso: string;
  titulo: string;
  subtemas: Subtema[];
  creadoEn: string;
  imagenes?: ImageData[];
};

export default function CI1() {
  const [niveles, setNiveles] = useState<string[]>([]);
  const [cursos, setCursos] = useState<string[]>([]);
  const [titulos, setTitulos] = useState<string[]>([]);
  const [subtemas, setSubtemas] = useState<string[]>([]);

  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedTitulo, setSelectedTitulo] = useState('');
  const [selectedSubtema, setSelectedSubtema] = useState('');
  const [selectedSubtemaIndex, setSelectedSubtemaIndex] = useState<number | null>(null);
  const [info, setInfo] = useState<CursoData | null>(null);

  // Modal para contenido
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contenidoTemp, setContenidoTemp] = useState('');

  // Estados para imágenes
  const [imagenes, setImagenes] = useState<ImageData[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isChangingImage, setIsChangingImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Función para convertir archivo a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Función para cargar imágenes del subtema actual
  const cargarImagenesSubtema = async () => {
    if (!selectedNivel || !selectedCurso || !selectedTitulo || !selectedSubtema) {
      setImagenes([]);
      return;
    }

    try {
      const response = await fetch(`/api/informacion?nivel=${encodeURIComponent(selectedNivel)}&curso=${encodeURIComponent(selectedCurso)}&titulo=${encodeURIComponent(selectedTitulo)}`);
      const data: CursoData[] = await response.json();
      
      if (data && data.length > 0) {
        const tituloData = data[0];
        const subtemaData = tituloData.subtemas.find(s => s.nombre === selectedSubtema);
        
        if (subtemaData && subtemaData.imagenes && Array.isArray(subtemaData.imagenes)) {
          setImagenes(subtemaData.imagenes);
        } else {
          setImagenes([]);
        }
      }
    } catch (error) {
      console.error('Error cargando imágenes del subtema:', error);
      setImagenes([]);
    }
  };

  // Cargar los niveles al inicio
  useEffect(() => {
    console.log("Cargando niveles iniciales...");
    fetch('/api/informacion')
      .then((res) => {
        console.log("Respuesta recibida:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Datos recibidos:", data);
        if (Array.isArray(data)) {
          const nivelesDisponibles = Array.from(new Set(data.map((item: CursoData) => item.nivel))) as string[];
          console.log("Niveles disponibles:", nivelesDisponibles);
          setNiveles(nivelesDisponibles);
        } else {
          console.error("Formato de datos incorrecto:", data);
        }
      })
      .catch(error => {
        console.error("Error al cargar niveles:", error);
      });
  }, []);

  // Cuando cambia el nivel
  useEffect(() => {
    setCursos([]);
    setTitulos([]);
    setSubtemas([]);
    setInfo(null);
    setImagenes([]);
    setSelectedImageIndex(null);
    setSelectedCurso('');
    setSelectedTitulo('');
    setSelectedSubtema('');
    setSelectedSubtemaIndex(null);

    if (selectedNivel) {
      console.log(`Cargando cursos para nivel: ${selectedNivel}`);
      fetch(`/api/informacion?nivel=${encodeURIComponent(selectedNivel)}`)
        .then((res) => res.json())
        .then((data: CursoData[]) => {
          console.log("Datos de cursos:", data);
          const cursosUnicos = Array.from(new Set(data.map((d) => d.curso))) as string[];
          console.log("Cursos únicos:", cursosUnicos);
          setCursos(cursosUnicos);
        })
        .catch(error => {
          console.error(`Error al cargar cursos para ${selectedNivel}:`, error);
        });
    }
  }, [selectedNivel]);

  // Cuando cambia el curso
  useEffect(() => {
    setTitulos([]);
    setSubtemas([]);
    setInfo(null);
    setImagenes([]);
    setSelectedImageIndex(null);
    setSelectedTitulo('');
    setSelectedSubtema('');
    setSelectedSubtemaIndex(null);

    if (selectedNivel && selectedCurso) {
      console.log(`Cargando títulos para nivel: ${selectedNivel}, curso: ${selectedCurso}`);
      fetch(`/api/informacion?nivel=${encodeURIComponent(selectedNivel)}&curso=${encodeURIComponent(selectedCurso)}`)
        .then((res) => res.json())
        .then((data: CursoData[]) => {
          console.log("Datos de títulos:", data);
          const titulosUnicos = Array.from(new Set(data.map((d) => d.titulo))) as string[];
          console.log("Títulos únicos:", titulosUnicos);
          setTitulos(titulosUnicos);
        })
        .catch(error => {
          console.error(`Error al cargar títulos para ${selectedNivel} - ${selectedCurso}:`, error);
        });
    }
  }, [selectedNivel, selectedCurso]);

  // Cuando cambia el título
  useEffect(() => {
    setSubtemas([]);
    setInfo(null);
    setImagenes([]);
    setSelectedImageIndex(null);
    setSelectedSubtema('');
    setSelectedSubtemaIndex(null);

    if (selectedNivel && selectedCurso && selectedTitulo) {
      console.log(`Cargando subtemas para nivel: ${selectedNivel}, curso: ${selectedCurso}, título: ${selectedTitulo}`);
      fetch(`/api/informacion?nivel=${encodeURIComponent(selectedNivel)}&curso=${encodeURIComponent(selectedCurso)}&titulo=${encodeURIComponent(selectedTitulo)}`)
        .then((res) => res.json())
        .then((data: CursoData[]) => {
          console.log("Datos de subtemas:", data);
          if (data && data.length > 0) {
            setInfo(data[0]);
            setSubtemas(data[0].subtemas.map((s) => s.nombre));
          }
        })
        .catch(error => {
          console.error(`Error al cargar subtemas para ${selectedNivel} - ${selectedCurso} - ${selectedTitulo}:`, error);
        });
    }
  }, [selectedNivel, selectedCurso, selectedTitulo]);

  // Cuando cambia el subtema, cargar sus imágenes
  useEffect(() => {
    cargarImagenesSubtema();
  }, [selectedSubtema]);

  // Función para manejar la selección de archivos
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, isReplacement = false) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validar que todos sean imágenes
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Por favor selecciona archivos de imagen válidos');
      return;
    }

    if (validFiles.length !== files.length) {
      alert('Algunos archivos no son imágenes válidas y fueron omitidos');
    }

    if (!selectedNivel || !selectedCurso || !selectedTitulo || !selectedSubtema) {
      alert('Por favor selecciona nivel, curso, título y subtema antes de subir imágenes');
      return;
    }

    setIsUploading(true);

    try {
      if (isReplacement && selectedImageIndex !== null) {
        // Reemplazar imagen existente
        const file = validFiles[0];
        const base64 = await fileToBase64(file);
        
        const response = await fetch('/api/imagen', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nivel: selectedNivel,
            curso: selectedCurso,
            titulo: selectedTitulo,
            subtema: selectedSubtema,
            indexImagen: selectedImageIndex,
            nuevaImagen: {
              base64: base64,
              name: file.name
            }
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          alert(`Imagen actualizada: ${result.imagenNueva}`);
          await cargarImagenesSubtema(); // Refrescar imágenes
          setIsChangingImage(false);
        } else {
          throw new Error(result.message || 'Error al actualizar imagen');
        }
      } else {
        // Agregar nuevas imágenes
        const imagenesBase64 = await Promise.all(
          validFiles.map(async (file) => ({
            base64: await fileToBase64(file),
            name: file.name
          }))
        );

        const response = await fetch('/api/imagen', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nivel: selectedNivel,
            curso: selectedCurso,
            titulo: selectedTitulo,
            subtema: selectedSubtema,
            nuevasImagenesBase64: imagenesBase64
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          alert(`${result.imagenesAgregadas} imagen(es) agregada(s) exitosamente`);
          await cargarImagenesSubtema(); // Refrescar imágenes
        } else {
          throw new Error(result.message || 'Error al subir imágenes');
        }
      }
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
      alert(`Error al procesar las imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
      // Limpiar input
      event.target.value = '';
    }
  };

  // Función para eliminar imagen
  const handleDeleteImage = async (index: number) => {
    const confirmar = confirm('¿Estás seguro de eliminar esta imagen?');
    if (!confirmar) return;

    if (!selectedNivel || !selectedCurso || !selectedTitulo || !selectedSubtema) {
      alert('Error: Faltan parámetros de selección');
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch('/api/imagen', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nivel: selectedNivel,
          curso: selectedCurso,
          titulo: selectedTitulo,
          subtema: selectedSubtema,
          indexImagen: index
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Imagen eliminada: ${result.imagenEliminada}`);
        await cargarImagenesSubtema(); // Refrescar imágenes
        
        // Ajustar selección si es necesario
        if (selectedImageIndex === index) {
          setSelectedImageIndex(null);
        } else if (selectedImageIndex !== null && selectedImageIndex > index) {
          setSelectedImageIndex(selectedImageIndex - 1);
        }
      } else {
        throw new Error(result.message || 'Error al eliminar imagen');
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      alert(`Error al eliminar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Select de Nivel */}
      <div>
        <label htmlFor="nivel-select" className="block font-semibold">NIVEL:</label>
        <select
          id="nivel-select"
          value={selectedNivel}
          onChange={(e) => setSelectedNivel(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Seleccione un nivel</option>
          {niveles.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Select de Curso */}
      <div>
        <label htmlFor="curso-select" className="block font-semibold">CURSO:</label>
        <select
          id="curso-select"
          value={selectedCurso}
          onChange={(e) => setSelectedCurso(e.target.value)}
          disabled={!selectedNivel}
          className="border p-2 rounded w-full"
        >
          <option value="">{selectedNivel ? 'Seleccione un curso' : 'Bloqueado'}</option>
          {cursos.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Select de Título */}
      <div>
        <label htmlFor="titulo-select" className="block font-semibold">TÍTULO:</label>
        <select
          id="titulo-select"
          value={selectedTitulo}
          onChange={(e) => setSelectedTitulo(e.target.value)}
          disabled={!selectedCurso}
          className="border p-2 rounded w-full"
        >
          <option value="">{selectedCurso ? 'Seleccione un título' : 'Bloqueado'}</option>
          {titulos.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Select de Subtema */}
      <div>
        <label htmlFor="subtema-select" className="block font-semibold">SUBTEMA:</label>
        <select
          id="subtema-select"
          value={selectedSubtema}
          onChange={(e) => {
            setSelectedSubtema(e.target.value);
            if (info && info.subtemas) {
              const index = info.subtemas.findIndex(s => s.nombre === e.target.value);
              setSelectedSubtemaIndex(index >= 0 ? index : null);
            } else {
              setSelectedSubtemaIndex(null);
            }
            setSelectedImageIndex(null); // Reset image selection
          }}
          disabled={!selectedTitulo}
          className="border p-2 rounded w-full"
        >
          <option value="">{selectedTitulo ? 'Seleccione un subtema' : 'Bloqueado'}</option>
          {subtemas.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Contenedor de información */}
      <div className="p-4 mt-6 border rounded bg-gray-100">
        <h2 className="font-bold text-lg mb-2">Información:</h2>
        {!info ? (
          <p className="text-gray-600">Rellena información</p>
        ) : (
          <div className="text-sm whitespace-pre-wrap">
            <strong>Nivel:</strong> {info.nivel}<br />
            <strong>Curso:</strong> {info.curso}<br />
            <strong>Títulos:</strong> {info.titulo}<br />
            
            {selectedSubtemaIndex !== null && selectedSubtema ? (
              <div className="mt-4">
                <div className="font-semibold text-base mb-2">Subtema: {selectedSubtema}</div>
                <div className="border p-3 rounded bg-white">
                  <div className="mb-2">
                    <div className="text-sm font-semibold mb-1">Contenido:</div>
                    <div className="relative">
                      <div className="border rounded p-2 min-h-[100px] bg-gray-50">
                        {info.subtemas[selectedSubtemaIndex].contenido ? (
                          <div className="whitespace-pre-wrap">{info.subtemas[selectedSubtemaIndex].contenido}</div>
                        ) : (
                          <div className="text-gray-400 italic">Rellene este campo</div>
                        )}
                      </div>
                      <button 
                        className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                        onClick={() => {
                          setContenidoTemp(info.subtemas[selectedSubtemaIndex].contenido || '');
                          setIsModalOpen(true);
                        }}
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedTitulo ? (
              <div className="mt-4 text-gray-600">Seleccione un subtema para ver su contenido</div>
            ) : null}
            
            <div className="mt-4">
              <strong>Creado En:</strong> {info.creadoEn ? new Date(info.creadoEn).toLocaleString() : 'No disponible'}
            </div>

            {/* Sección de Imágenes */}
            {selectedSubtema && (
              <div className="mt-6 border-t pt-4">
                <div className="font-semibold text-base mb-3">Imágenes del Subtema:</div>
                
                {/* Input para agregar imágenes */}
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e, false)}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`inline-block px-4 py-2 rounded cursor-pointer transition-colors ${
                      isUploading 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {isUploading ? 'Subiendo...' : 
                     imagenes.length === 0 ? 'Insertar primera imagen' : 'Agregar más imágenes'}
                  </label>
                  
                  {imagenes.length > 0 && (
                    <span className="ml-3 text-sm text-gray-600">
                      {imagenes.length} imagen{imagenes.length > 1 ? 'es' : ''} en este subtema
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección para ver imágenes */}
      {imagenes.length > 0 && selectedSubtema && (
        <div className="p-4 mt-6 border rounded bg-gray-100">
          <h2 className="font-bold text-lg mb-4">Imágenes del Subtema "{selectedSubtema}":</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de imágenes */}
            <div>
              <h3 className="font-semibold mb-3">Seleccionar imagen:</h3>
              <div className="space-y-2">
                {imagenes.map((imagen, index) => (
                  <div
                    key={imagen.id}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedImageIndex === index 
                        ? 'bg-blue-100 border-blue-500' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Imagen {index + 1}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(index);
                        }}
                        disabled={isUploading}
                        className={`text-sm ${
                          isUploading 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-500 hover:text-red-700'
                        }`}
                      >
                        {isUploading ? 'Procesando...' : 'Eliminar'}
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 truncate">{imagen.name}</div>
                    {imagen.uploadedAt && (
                      <div className="text-xs text-gray-500">
                        Subida: {new Date(imagen.uploadedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview de imagen seleccionada */}
            <div>
              {selectedImageIndex !== null ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Preview:</h3>
                    <div className="space-x-2">
                      {!isChangingImage ? (
                        <button
                          onClick={() => setIsChangingImage(true)}
                          disabled={isUploading}
                          className={`px-3 py-1 rounded text-sm ${
                            isUploading 
                              ? 'bg-gray-400 text-white cursor-not-allowed' 
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                        >
                          Cambiar imagen
                        </button>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, true)}
                            className="hidden"
                            id="image-replace"
                            disabled={isUploading}
                          />
                          <label
                            htmlFor="image-replace"
                            className={`inline-block px-3 py-1 rounded text-sm cursor-pointer ${
                              isUploading 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {isUploading ? 'Subiendo...' : 'Seleccionar nueva'}
                          </label>
                          <button
                            onClick={() => setIsChangingImage(false)}
                            disabled={isUploading}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 disabled:bg-gray-400"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="border rounded p-2 bg-white">
                    <img
                      src={imagenes[selectedImageIndex].url}
                      alt={imagenes[selectedImageIndex].name}
                      className="w-full h-auto max-h-96 object-contain rounded"
                    />

                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <div><strong>Nombre:</strong> {imagenes[selectedImageIndex].name}</div>
                      {imagenes[selectedImageIndex].originalName && (
                        <div><strong>Nombre original:</strong> {imagenes[selectedImageIndex].originalName}</div>
                      )}
                      {imagenes[selectedImageIndex].uploadedAt && (
                        <div><strong>Subida:</strong> {new Date(imagenes[selectedImageIndex].uploadedAt!).toLocaleString()}</div>
                      )}<div className="flex items-start gap-2"><strong>URL:</strong>
                        <div className="flex-1">
                          <span className="break-all text-blue-600 text-xs">{imagenes[selectedImageIndex].url}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(imagenes[selectedImageIndex].url)}
                            className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 text-center py-8">
                  Selecciona una imagen de la lista para ver el preview
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay imágenes */}
      {selectedSubtema && imagenes.length === 0 && (
        <div className="p-4 mt-6 border rounded bg-yellow-50">
          <h3 className="font-semibold text-yellow-800 mb-2">Sin imágenes</h3>
          <p className="text-yellow-700">
            El subtema "{selectedSubtema}" no tiene imágenes aún. Usa el botón "Insertar primera imagen" para agregar una.
          </p>
        </div>
      )}

      {/* Modal para editar contenido */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Editar contenido del subtema</h2>
            
            <label htmlFor="contenidoSubtema" className="block text-sm font-medium text-gray-700 mb-2">
              Contenido del subtema
            </label>
            
            <textarea
              id="contenidoSubtema"
              className="w-full border rounded p-2 mb-4 h-40"
              value={contenidoTemp}
              onChange={(e) => setContenidoTemp(e.target.value)}
              placeholder="Escribe el contenido del subtema aquí..."
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const confirmar = confirm(`¿Estás seguro de actualizar el contenido del subtema "${selectedSubtema}"?`);
                  if (!confirmar) return;

                  try {
                    const response = await fetch('/api/actualizar-subtema', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        cursoId: info?._id,
                        titulo: selectedTitulo,
                        subtemaIndex: selectedSubtemaIndex,
                        nuevoContenido: contenidoTemp,
                      }),
                    });

                    const result = await response.json();

                    if (result.success) {
                      alert('Contenido actualizado correctamente');
                      if (info && selectedSubtemaIndex !== null) {
                        const updatedInfo = { ...info };
                        updatedInfo.subtemas[selectedSubtemaIndex].contenido = contenidoTemp;
                        setInfo(updatedInfo);
                      }
                      setIsModalOpen(false);
                    } else {
                      alert(`Error: ${result.message}`);
                      console.error('Error del servidor:', result);
                    }
                  } catch (error) {
                    console.error('Error al actualizar:', error);
                    alert('Error al actualizar el contenido. Inténtalo de nuevo.');
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}