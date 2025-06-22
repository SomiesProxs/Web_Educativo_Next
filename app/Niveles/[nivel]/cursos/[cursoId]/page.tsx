'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import CourseAccordion from '@/components/union/CourseAccordion';
import ReadingContent from '@/components/union/ReadingContent';

interface Curso {
  _id: string;
  curso: string;
  titulo?: string;
  nivel: string;
}

interface SubtemaData {
  nivel: string;
  curso: string;
  titulo: string;
  subtema: string;
}

export default function CoursePage() {
  const { data: session } = useSession();
  const sessionUser = session?.user;
  const params = useParams();
  
  const [localTheme, setLocalTheme] = useState<0 | 1 | null>(null);
  const [cursoData, setCursoData] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubtema, setSelectedSubtema] = useState<SubtemaData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Obtener el ID del curso desde los parámetros de la URL
  const cursoId = (params.cursoid || params.cursoId || params.id) as string;

  // Debug: imprimir todos los parámetros disponibles
  console.log('Todos los parámetros:', params);
  console.log('cursoId obtenido:', cursoId);
  console.log('Tipo de cursoId:', typeof cursoId);
  console.log('Posibles valores:', {
    cursoid: params.cursoid,
    cursoId: params.cursoId,
    id: params.id
  });

  // Función para manejar la selección de subtemas
  const handleSubtemaSelect = (subtemaData: SubtemaData) => {
    console.log('Subtema seleccionado en CoursePage:', subtemaData);
    setSelectedSubtema(subtemaData);
    // Cerrar el menú móvil cuando se selecciona un subtema
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Cargar información del curso
  useEffect(() => {
    async function fetchCurso() {
      console.log('Intentando obtener curso con ID:', cursoId);
      
      if (!cursoId) {
        console.log('No se encontró cursoId en los parámetros');
        setError('ID del curso no encontrado');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/curso/${cursoId}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            setError('Curso no encontrado');
          } else {
            setError('Error al cargar el curso');
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setCursoData(data.curso);
        setError(null);
      } catch (err) {
        console.error('Error al obtener curso:', err);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    }

    fetchCurso();
  }, [cursoId]);

  // Cargar el tema desde la sesión o la API
  useEffect(() => {
    async function setUserTheme() {
      if (!sessionUser) {
      setLocalTheme(0);  // <--- Aquí asigna tema por defecto si no hay sesión
      return;
    }

      // Si ya viene en la sesión, úsalo directamente
      if (sessionUser.theme === 0 || sessionUser.theme === 1) {
        setLocalTheme(sessionUser.theme);
        return;
      }

      // Sino, intentar obtenerlo desde la API
      const userId = (sessionUser as any)._id;
      try {
        const res = await fetch(`/api/users/${userId}`);
        
        // Verificar si la respuesta es exitosa
        if (!res.ok) {
          console.error(`Error HTTP: ${res.status} - ${res.statusText}`);
          setLocalTheme(0);
          return;
        }

        // Verificar si hay contenido antes de hacer .json()
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('La respuesta no es JSON válido');
          setLocalTheme(0);
          return;
        }

        const text = await res.text();
        if (!text) {
          console.error('Respuesta vacía del servidor');
          setLocalTheme(0);
          return;
        }

        let user;
        try {
          user = JSON.parse(text);
        } catch (parseError) {
          console.error('Error al parsear JSON:', parseError);
          console.error('Respuesta recibida:', text);
          setLocalTheme(0);
          return;
        }

        if (user.theme === 0 || user.theme === 1) {
          setLocalTheme(user.theme);
        } else {
          setLocalTheme(0);
        }
      } catch (err) {
        console.error('Fallo al obtener theme:', err);
        setLocalTheme(0);
      }
    }

    setUserTheme();
  }, [sessionUser]);

  // Aplicar clase 'dark' al html
  useEffect(() => {
    if (localTheme !== 0) {
      const isDark = localTheme === 1;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [localTheme]);

  // Cerrar menú móvil al hacer scroll en el contenido (solo en móvil)
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen && window.innerWidth < 768) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobileMenuOpen]);

  if (localTheme === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800">
        <div className="w-16 h-16 border-8 border-t-transparent border-white border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const containerClass = localTheme === 1 ? 'bg-[#111827] text-white' : 'bg-[#d5e9ea] text-gray-900';

  return (
    <div className={`flex flex-col lg:flex-row h-screen transition-colors duration-500 ${containerClass}`}>
      {/* Botón hamburguesa - Solo visible en móvil */}
      <button
        onClick={toggleMobileMenu}
        className={`lg:hidden fixed top-3 left-4 z-50 p-3 rounded-lg transition-all duration-300 ${
          localTheme === 1 ? 'bg-[#1F2937] text-white hover:bg-[#374151]' : 'bg-[#80BACE] text-gray-800 hover:bg-[#6BA3B8]'
        }`}
        aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
      >
        <svg
          className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : 'rotate-0'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >

          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

{/* Panel Izquierdo */}
<div className={`
  /* MODO PC - Mantiene el comportamiento original */
  lg:w-1/5 lg:h-screen lg:overflow-y-auto lg:fixed lg:left-0 lg:top-0 lg:p-6 lg:border-b-0 lg:border-gray-700 lg:z-10 lg:block
  /* MODO MÓVIL - Animaciones de aparecer/desaparecer */
  ${isMobileMenuOpen ? 'block' : 'hidden'}
  w-4/5 max-w-sm h-screen overflow-y-auto fixed left-0 top-0 p-4 z-40
  transform transition-all duration-500 ease-in-out
  ${isMobileMenuOpen ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-full opacity-0 scale-95 lg:translate-x-0 lg:opacity-100 lg:scale-100'}
  ${localTheme === 1 ? 'bg-[#030712]' : 'bg-[#BEE1E5]'}
  shadow-lg lg:shadow-none
`}>

{/* Contenido del panel - Igual para PC y móvil */}
<div className="mt-12 lg:mt-0">
  {loading ? (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-300 rounded mb-6"></div>
    </div>
  ) : error ? (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-red-500">Error</h1>
      <p className="text-sm text-red-400">{error}</p>
    </div>
  ) : (
    <div className={`rounded-lg shadow-md p-6 mb-8 max-w-md mx-auto mt-2 lg:mt-0 ${localTheme === 1 ? 'bg-[#1F2937]' : 'bg-[#80BACE]'}`}>
             
      {/* Curso */}
      <h1 className="text-2xl lg:text-3xl font-extrabold mb-3 tracking-wide break-words leading-tight flex flex-wrap items-center gap-2">
        <span>Curso:</span>
        {cursoData?.curso ? (
          <a
            href={`/Niveles/${encodeURIComponent(cursoData.nivel)}`}
            className="hover:underline break-words"
          >
            {cursoData.curso}
          </a>
        ) : (
          <span className="text-gray-500">Curso no encontrado</span>
        )}
      </h1>
       
      {/* Nivel */}
      {cursoData?.nivel && (
        <p className="text-sm font-medium uppercase tracking-widest mb-4">
          Nivel:{' '}
          <a
            href="/"
            className="hover:underline"
          >
            {cursoData.nivel}
          </a>
        </p>
      )}

      {/* Botón Comprar Estrellas */}
      <a
        href="/Pagar"
        className={`inline-blockfont-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg ${localTheme === 1 ? 'bg-[#030712]' : 'bg-[#BEE1E5]'}`}>
      Comprar Somicoins
      </a>
    </div>

    
          )}
          
          {/* Pasar los datos del curso, el tema y el callback al CourseAccordion */}
          <CourseAccordion 
            cursoData={cursoData} 
            localTheme={localTheme} 
            onSubtemaSelect={handleSubtemaSelect}
          />
        </div>
      </div>

      {/* Panel Derecho */}
      <div className={`
        /* MODO PC - Mantiene el comportamiento original */
        lg:w-4/5 lg:ml-[20%] lg:h-screen lg:overflow-y-auto lg:p-6
        /* MODO MÓVIL - Ocupa toda la pantalla con padding-top para el botón hamburguesa */
        w-full h-screen overflow-y-auto pt-16 lg:pt-0 p-4
      `}>
        <ReadingContent 
          selectedSubtema={selectedSubtema} 
          localTheme={localTheme}
        />
      </div>
    </div>
  );
}