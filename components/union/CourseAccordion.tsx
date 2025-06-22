'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

interface Subtema {
  _id?: string;
  nombre: string;
  estado?: string | number;
  contenido?: string;
}

interface Titulo {
  titulo: string;
  estado: number;
  subtemas: Subtema[];
}

interface CursoData {
  _id: string;
  nivel: string;
  curso: string;
  titulos?: Titulo[];
}

interface CourseAccordionProps {
  cursoData?: CursoData | null;
  localTheme?: 0 | 1 | null;
  onSubtemaSelect?: (subtemaData: {
    nivel: string;
    curso: string;
    titulo: string;
    subtema: string;
  }) => void;
}

// Componente Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDark?: boolean;
}

// Interface for API response item
interface ApiResponseItem {
  titulo?: string;
  estado?: number;
  subtemas?: Subtema[];
}

function Modal({ isOpen, onClose, title, children, isDark = false }: ModalProps) {
  if (!isOpen) return null;

  const modalStyles = {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    modal: isDark 
      ? 'bg-[#1F2937] border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4'
      : 'bg-white border border-gray-300 rounded-lg p-6 max-w-md w-full mx-4',
    title: isDark ? 'text-white text-lg font-bold mb-4' : 'text-gray-900 text-lg font-bold mb-4',
    closeButton: isDark 
      ? 'absolute top-4 right-4 text-gray-400 hover:text-white text-xl cursor-pointer'
      : 'absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-xl cursor-pointer'
  };

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div className={`${modalStyles.modal} relative`} onClick={(e) => e.stopPropagation()}>
        <button className={modalStyles.closeButton} onClick={onClose}>×</button>
        <h3 className={modalStyles.title}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function CourseAccordion({ 
  cursoData, 
  localTheme = 0, 
  onSubtemaSelect 
}: CourseAccordionProps) {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [openTitulos, setOpenTitulos] = useState<{ [key: number]: boolean }>({});
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubtema, setSelectedSubtema] = useState<string | null>(null);
  
  // Estado local para las estrellas del usuario (se sincroniza con la sesión)
  const [localUserStars, setLocalUserStars] = useState<number>(0);
  
  // Estados para modales
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'insufficient_stars' | 'purchase_confirm' | null;
    titulo?: Titulo;
    userStars?: number;
  }>({ isOpen: false, type: null });

  // Sincronizar estrellas locales con la sesión
  useEffect(() => {
    if (session?.user?.stars !== undefined) {
      setLocalUserStars(session.user.stars);
    }
  }, [session?.user?.stars]);

  // Función para obtener estrellas actuales del servidor
  const fetchCurrentStars = async (): Promise<number> => {
    if (!session?.user?.id) return 0;
    
    try {
      const response = await fetch(`/api/user-stars?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        const currentStars = data.stars || 0;
        console.log(`=== FETCH CURRENT STARS ===`);
        console.log(`Stars from server: ${currentStars}`);
        console.log(`Previous local stars: ${localUserStars}`);
        console.log(`===========================`);
        
        setLocalUserStars(currentStars);
        
        // Actualizar también la sesión para mantener consistencia
        if (session) {
          await update({
            ...session,
            user: {
              ...session.user,
              stars: currentStars
            }
          });
        }
        
        return currentStars;
      }
    } catch (error) {
      console.error('Error fetching current stars:', error);
    }
    
    return localUserStars;
  };

  // DEBUG: Ver datos de sesión
  console.log('=== SESSION DEBUG ===');
  console.log('session:', session);
  console.log('session.user.isAdmin:', session?.user?.isAdmin);
  console.log('session.user.stars:', session?.user?.stars);
  console.log('localUserStars:', localUserStars);
  console.log('status:', status);
  console.log('====================');

  // Cargar títulos del curso
  useEffect(() => {
    async function fetchTitulos() {
      if (!cursoData) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/informacion?nivel=${cursoData.nivel}&curso=${cursoData.curso}`);
        
        const data: ApiResponseItem[] | ApiResponseItem = await response.json();
        console.log('Datos recibidos de la API:', data);
        console.log('Tipo de data:', typeof data, 'Es array:', Array.isArray(data));
        
        // Verificar que data sea un array
        if (!Array.isArray(data)) {
          console.error('La API no devolvió un array:', data);
          if (data && typeof data === 'object') {
            console.log('Intentando procesar objeto como array unitario');
            setTitulos([{
              titulo: data.titulo || 'Título sin nombre',
              estado: data.estado || 0,
              subtemas: data.subtemas || []
            }]);
          } else {
            console.log('Creando título por defecto');
            setTitulos([{
              titulo: 'Sin contenido disponible',
              estado: 0,
              subtemas: []
            }]);
          }
          return;
        }
        
        // La API devuelve un array de títulos separados, necesitamos agruparlos
        const titulosAgrupados: { [key: string]: Titulo } = {};
        
        data.forEach((item: ApiResponseItem) => {
          const tituloKey = item.titulo || 'Título sin nombre';
          if (!titulosAgrupados[tituloKey]) {
            titulosAgrupados[tituloKey] = {
              titulo: tituloKey,
              estado: item.estado !== undefined ? item.estado : 0,
              subtemas: Array.isArray(item.subtemas) ? item.subtemas : []
            };
          }
        });
        
        const titulosArray = Object.values(titulosAgrupados);
        console.log('Títulos procesados:', titulosArray);
        
        if (titulosArray.length === 0) {
          console.log('No hay títulos, creando título por defecto');
          setTitulos([{
            titulo: 'Sin títulos disponibles',
            estado: 0,
            subtemas: []
          }]);
        } else {
          setTitulos(titulosArray);
        }
      } catch (error) {
        console.error('Error al obtener títulos:', error);
        setTitulos([{
          titulo: 'Error al cargar contenido',
          estado: 0,
          subtemas: []
        }]);
      } finally {
        setLoading(false);
      }
    }

    fetchTitulos();
  }, [cursoData]);

  const toggleTitulo = (index: number) => {
    setOpenTitulos(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Estado para manejar cursos comprados
  const [purchasedCourses, setPurchasedCourses] = useState<{ [key: string]: boolean }>({});

  // Cargar cursos comprados por el usuario
  useEffect(() => {
    async function fetchPurchasedCourses() {
      if (!session?.user?.id || !cursoData || titulos.length === 0) return;
      
      const purchased: { [key: string]: boolean } = {};
      
      for (const titulo of titulos) {
        if (titulo.estado === 1) {
          try {
            const response = await fetch(
              `/api/check-course-access?userId=${session.user.id}&nivel=${cursoData.nivel}&curso=${cursoData.curso}&titulo=${titulo.titulo}`
            );
            
            if (response.ok) {
              const data = await response.json();
              purchased[titulo.titulo] = data.hasPurchased;
            }
          } catch (error) {
            console.error('Error al verificar compra:', error);
          }
        }
      }
      
      setPurchasedCourses(purchased);
    }

    fetchPurchasedCourses();
  }, [session, cursoData, titulos]);

  const checkAccess = (titulo: Titulo): { canAccess: boolean; reason?: string } => {
    console.log('=== CHECK ACCESS DEBUG ===');
    console.log('titulo.estado:', titulo.estado);
    console.log('session?.user?.isAdmin:', session?.user?.isAdmin);
    console.log('status:', status);
    
    // Si no hay sesión cargada aún, permitir acceso a contenido público
    if (status === 'loading') {
      return titulo.estado === 0 ? { canAccess: true } : { canAccess: false, reason: 'loading' };
    }
    
    // Admin puede acceder a todo
    if (session?.user?.isAdmin === true) {
      console.log('✅ Admin access granted');
      return { canAccess: true };
    }
    
    // Título con estado 0 (desbloqueado por defecto) - todos pueden acceder
    if (titulo.estado === 0) {
      console.log('✅ Public content access granted');
      return { canAccess: true };
    }
    
    // Título con estado 1 (bloqueado por defecto) - requiere compra con estrellas
    if (titulo.estado === 1) {
      // Usuario sin register - necesita register
      if (!session || !session.user) {
        console.log('❌ Need register for premium content');
        return { canAccess: false, reason: 'register' };
      }
      
      // Verificar si ya compró este curso
      if (purchasedCourses[titulo.titulo]) {
        console.log('✅ Course already purchased');
        return { canAccess: true };
      }
      
      // Usuario logueado - verificar si tiene estrellas suficientes
      console.log('Current local user stars:', localUserStars);
      
      if (localUserStars < 5) {
        console.log('❌ Insufficient stars');
        return { canAccess: false, reason: 'insufficient_stars' };
      }
      
      // Tiene estrellas pero necesita comprar
      console.log('❌ Needs to purchase with stars');
      return { canAccess: false, reason: 'needs_purchase' };
    }
    
    console.log('✅ Default access granted');
    return { canAccess: true };
  };

  const handleTituloClick = async (titulo: Titulo, index: number) => {
    const access = checkAccess(titulo);
    
    if (!access.canAccess) {
      switch (access.reason) {
        case 'loading':
          // Esperar a que se cargue la sesión
          return;
          
        case 'register':
          // Redirigir a register
          router.push('/register');
          return;
          
        case 'insufficient_stars':
          // Obtener estrellas actuales del servidor antes de mostrar el modal
          const currentStarsForInsufficient = await fetchCurrentStars();
          console.log('=== INSUFFICIENT STARS DEBUG ===');
          console.log('Current stars from server:', currentStarsForInsufficient);
          console.log('Required stars: 5');
          
          setModalState({
            isOpen: true,
            type: 'insufficient_stars',
            titulo,
            userStars: currentStarsForInsufficient
          });
          return;
          
        case 'needs_purchase':
          // CRÍTICO: Obtener estrellas actuales del servidor antes de mostrar el modal
          const currentStarsForPurchase = await fetchCurrentStars();
          console.log('=== PURCHASE CHECK DEBUG ===');
          console.log('Current stars from server:', currentStarsForPurchase);
          console.log('Required stars: 5');
          
          // Si no tiene suficientes estrellas, forzar modal de insuficientes
          if (currentStarsForPurchase < 5) {
            console.log('❌ FORCING insufficient_stars modal');
            setModalState({
              isOpen: true,
              type: 'insufficient_stars',
              titulo,
              userStars: currentStarsForPurchase
            });
            return;
          }
          
          // Solo si realmente tiene >= 5 estrellas
          console.log('✅ Showing purchase confirmation');
          setModalState({
            isOpen: true,
            type: 'purchase_confirm',
            titulo,
            userStars: currentStarsForPurchase
          });
          return;
          
        default:
          alert('No tienes permisos para acceder a este contenido.');
          return;
      }
    }
    
    // Si puede acceder, toggle normal
    toggleTitulo(index);
  };

  const handlePurchaseCourse = async (titulo: Titulo) => {
    if (!session?.user || !cursoData) return;
    
    // Mostrar spinner o deshabilitar botón
    console.log('=== STARTING PURCHASE ===');
    console.log('Titulo:', titulo.titulo);
    console.log('User ID:', session.user.id);
    console.log('========================');
    
    try {
      const response = await fetch('/api/purchase-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          nivel: cursoData.nivel,
          curso: cursoData.curso,
          titulo: titulo.titulo,
          cost: 5
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('=== PURCHASE SUCCESS ===');
        console.log('Remaining stars:', data.remainingStars);
        console.log('========================');
        
        alert(`¡Curso desbloqueado exitosamente! Te quedan ${data.remainingStars} estrellas.`);
        
        // Actualizar las estrellas locales inmediatamente
        setLocalUserStars(data.remainingStars);
        
        // Actualizar la sesión
        await update({
          ...session,
          user: {
            ...session.user,
            stars: data.remainingStars
          }
        });
        
        // Actualizar cursos comprados
        setPurchasedCourses(prev => ({
          ...prev,
          [titulo.titulo]: true
        }));
        
        // Cerrar modal
        setModalState({ isOpen: false, type: null });
        
        // Abrir el título desbloqueado
        const tituloIndex = titulos.findIndex(t => t.titulo === titulo.titulo);
        if (tituloIndex !== -1) {
          toggleTitulo(tituloIndex);
        }
      } else {
        console.log('=== PURCHASE FAILED ===');
        console.log('Error:', data.message);
        console.log('======================');
        
        // Si el error es por estrellas insuficientes, actualizar las estrellas locales
        if (data.currentStars !== undefined) {
          console.log('Updating local stars from error response:', data.currentStars);
          setLocalUserStars(data.currentStars);
          
          // Actualizar la sesión también
          await update({
            ...session,
            user: {
              ...session.user,
              stars: data.currentStars
            }
          });
          
          // Cerrar modal actual y mostrar modal de estrellas insuficientes
          setModalState({
            isOpen: true,
            type: 'insufficient_stars',
            titulo,
            userStars: data.currentStars
          });
        } else {
          alert(data.message || 'Error al desbloquear el curso');
        }
      }
    } catch (error) {
      console.error('Error al comprar curso:', error);
      alert('Error al desbloquear el curso. Intenta de nuevo.');
    }
  };

  const handleGetStars = () => {
    // Aquí puedes redirigir a donde el usuario puede obtener estrellas
    // Por ejemplo, a una página de tareas, juegos, etc.
    router.push('/get-stars'); // Cambia esta ruta según tu implementación
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
  };

  const handleSubtemaClick = (titulo: string, subtema: string) => {
    if (!cursoData) return;
    
    const subtemaKey = `${titulo}-${subtema}`;
    setSelectedSubtema(subtemaKey);
    
    const subtemaData = {
      nivel: cursoData.nivel,
      curso: cursoData.curso,
      titulo: titulo,
      subtema: subtema
    };
    
    console.log('Subtema seleccionado:', subtemaData);
    
    if (onSubtemaSelect) {
      onSubtemaSelect(subtemaData);
    }
  };

  const getAccessIcon = (titulo: Titulo) => {
    const access = checkAccess(titulo);
    
    if (access.canAccess) {
      return '';
    }
    
    switch (access.reason) {
      case 'register':
        return '';
      case 'insufficient_stars':
        return '';
      case 'needs_purchase':
        return '';
      case 'loading':
        return '⏳';
      default:
        return '';
    }
  };

  const getStyles = () => {
    const isDark = localTheme === 1;
    return {
      container: isDark ? '' : '',
      button: isDark 
        ? 'bg-[#1F2937] hover:bg-[#374151] ' 
        : 'bg-[#80BACE] hover:bg-[#D1E7DD] ',
      
      buttonBlocked: isDark
        ? 'bg-[#1F2937] hover:bg-[#374151] opacity-75 cursor-pointer'
        : 'bg-[#80BACE] hover:bg-[#D1E7DD] opacity-75 cursor-pointer',
      
      accordion: isDark ? 'bg-[#1F2937]' : 'bg-[#80BACE]',

      subtitle: isDark 
        ? 'bg-[#374151] hover:bg-[#404a59]' 
        : 'bg-[#aed5e2] hover:bg-[#D1E7DD]',
      
      subtitleSelected: isDark
        ? 'bg-[#4F46E5] hover:bg-[#4338CA]'
        : 'bg-[#3B82F6] hover:bg-[#2563EB]',

      // Estilos para modales
      modalButton: isDark
        ? 'px-4 py-2 rounded bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium'
        : 'px-4 py-2 rounded bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium',
      
      modalButtonSecondary: isDark
        ? 'px-4 py-2 rounded bg-[#6B7280] hover:bg-[#4B5563] text-white font-medium'
        : 'px-4 py-2 rounded bg-[#6B7280] hover:bg-[#4B5563] text-white font-medium',

      modalButtonSuccess: isDark
        ? 'px-4 py-2 rounded bg-[#10B981] hover:bg-[#059669] text-white font-medium'
        : 'px-4 py-2 rounded bg-[#10B981] hover:bg-[#059669] text-white font-medium',

      modalText: isDark ? 'text-gray-300' : 'text-gray-700'
    };
  };

  const styles = getStyles();

  if (!cursoData) {
    return (
      <div className={`p-4 rounded ${styles.container}`}>
        <p className="text-gray-500 text-sm">No se encontró información del curso.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-4 rounded ${styles.container}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (titulos.length === 0) {
    return (
      <div className={`p-4 rounded ${styles.container}`}>
        <p className="text-gray-500 text-sm">No hay títulos disponibles para este curso.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`rounded ${styles.container} space-y-2`}>
        {titulos.map((titulo, tituloIndex) => {
          const access = checkAccess(titulo);
          
          return (
            <div key={tituloIndex} className="mb-2">
              <button
                className={`w-full text-left px-4 py-3 font-semibold rounded-t transition-colors duration-200 ${
                  access.canAccess ? styles.button : styles.buttonBlocked
                }`}
                onClick={() => handleTituloClick(titulo, tituloIndex)}
              >
                <div className="flex justify-between items-center">
                  <span className="break-words leading-tight">{titulo.titulo}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getAccessIcon(titulo)}</span>
                    
                    <span className={`text-xs px-2 py-1 rounded ${
                      titulo.estado === 0
                        ? ''
                        : access.canAccess
                        ? ''
                        : 'bg-[#891616] text-white'
                    }`}>
                      {titulo.estado === 0 
                        ? '' 
                        : access.canAccess 
                        ? '' 
                        : session?.user?.isAdmin ? 'Admin' : 'Bloqueado'}
                    </span>
                    
                    <span className="text-sm">{openTitulos[tituloIndex] ? '−' : '+'}</span>
                  </div>
                </div>
              </button>

              {openTitulos[tituloIndex] && (
                <div className={`px-4 py-2 space-y-2 rounded-b ${styles.accordion}`}>
                  {titulo.subtemas && titulo.subtemas.length > 0 ? (
                    titulo.subtemas.map((subtema, subtemaIndex) => {
                      const subtemaKey = `${titulo.titulo}-${subtema.nombre}`;
                      const isSelected = selectedSubtema === subtemaKey;
                      
                      return (
                        <button
                          key={subtemaIndex}
                          className={`w-full text-left px-3 py-2 rounded transition-colors duration-200 ${
                            isSelected ? styles.subtitleSelected : styles.subtitle
                          }`}
                          onClick={() => handleSubtemaClick(titulo.titulo, subtema.nombre)}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`text-sm break-words ${isSelected ? 'text-white font-medium' : ''}`}>
                              {subtema.nombre}
                            </span>
                            <div className="flex items-center space-x-2">
                              {isSelected && (
                                <span className="text-white text-xs">●</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 px-3 py-2">No hay subtemas disponibles</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal para estrellas insuficientes */}
      <Modal 
        isOpen={modalState.isOpen && modalState.type === 'insufficient_stars'} 
        onClose={closeModal}
        title="Estrellas Insuficientes"
        isDark={localTheme === 1}
      >
        <div className="space-y-4">
          <p className={styles.modalText}>
            Necesitas 5 estrellas para desbloquear este curso. 
            Actualmente tienes {modalState.userStars} estrellas.
          </p>
          
          <div className="flex flex-col space-y-3">
            <button 
              className={styles.modalButtonSuccess}
              onClick={handleGetStars}
            >
              Clic para obtener hasta 5 estrellas
            </button>
            
            <button 
              className={styles.modalButtonSecondary}
              onClick={closeModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para confirmación de compra */}
      <Modal 
        isOpen={modalState.isOpen && modalState.type === 'purchase_confirm'} 
        onClose={closeModal}
        title="Confirmar Desbloqueo"
        isDark={localTheme === 1}
      >
        <div className="space-y-4">
          <p className={styles.modalText}>
            ¿Deseas desbloquear &quot;{modalState.titulo?.titulo}&quot; por 5 estrellas?
          </p>
          
          <div className="flex space-x-3">
            <button 
              className={styles.modalButton}
              onClick={() => modalState.titulo && handlePurchaseCourse(modalState.titulo)}
            >
              Confirmar
            </button>
            
            <button 
              className={styles.modalButtonSecondary}
              onClick={closeModal}
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}