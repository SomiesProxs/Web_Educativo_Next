'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Curso {
  _id: string;
  curso: string;
  titulo: string;
}

interface SessionUser {
  _id: string;
  theme?: 0 | 1;
}

interface NivelPageProps {
  params: Promise<{
    nivel: string;
  }>;
}

export default function NivelPage({ params }: NivelPageProps) {
  const { data: session } = useSession();
  const sessionUser = session?.user ?? null; // 🔧 mejora de seguridad
  const router = useRouter();

  const resolvedParams = use(params);
  const nivel = resolvedParams.nivel.toUpperCase();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [localTheme, setLocalTheme] = useState<0 | 1 | null>(null);

  useEffect(() => {
    async function fetchCursos() {
      try {
        const res = await fetch(`/api/niveles?nivel=${nivel}`, { cache: 'no-store' });
        const data = await res.json();
        setCursos(data.cursos || []);
      } catch (error) {
        console.error('Error cargando cursos:', error);
      }
    }
    fetchCursos();
  }, [nivel]);

  useEffect(() => {
    async function setUserTheme() {
      if (!sessionUser) {
        setLocalTheme(0); // ✅ tema por defecto para usuarios sin sesión
        return;
      }

      if (sessionUser.theme === 0 || sessionUser.theme === 1) {
        setLocalTheme(sessionUser.theme);
        return;
      }

      const userId = (sessionUser as SessionUser)._id;
      if (!userId) {
        setLocalTheme(0); // fallback por si no hay _id
        return;
      }

      try {
        const res = await fetch(`/api/users/${userId}`);
        const user = await res.json();
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

  useEffect(() => {
    if (localTheme !== null) {
      document.documentElement.classList.toggle('dark', localTheme === 1);
    }
  }, [localTheme]);

  if (localTheme === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800">
        <div className="w-16 h-16 border-8 border-t-transparent border-white border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleCursoClick = (cursoId: string) => {
    router.push(`/Niveles/${resolvedParams.nivel}/cursos/${cursoId}`);
  };

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-500 ${
        localTheme === 1 ? 'bg-[#202c44] text-white' : 'bg-[#d5e9ea] text-gray-900'
      }`}
    >
      <h1 className="text-4xl font-bold mb-8">Cursos de {nivel}</h1>

      {cursos.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-300">No hay cursos disponibles.</p>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-md">
          {cursos.map((curso) => (
            <button
              key={curso._id}
              onClick={() => handleCursoClick(curso._id)}
              className={`py-6 px-8 rounded-md shadow-md text-center text-2xl font-semibold transition-transform hover:scale-105
              ${localTheme === 1 ? 'bg-[#324a72] text-white' : 'bg-white text-gray-900'}`}
            >
              {curso.curso}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}