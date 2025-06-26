'use client';

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import Image from 'next/image';
import Hero from '@/components/Hero';

import './cabecera.css';
import './portada.css';
import './pie.css';

type Nivel = {
  nombre: string;
  ruta: string;
};

const Bienvenida = () => {
  const [showAnimation, setShowAnimation] = useState(true);
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // Estado para el menú desplegable
  // Estado para mostrar/ocultar contenido adicional
  const [mostrarContenido, setMostrarContenido] = useState<boolean>(false);

  //animacion con spline
   const [isMobile, setIsMobile] = useState(false);
const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  
  const closeMenu = () => {
    setMenuVisible(false);
  };
  useEffect(() => {
    const fetchNiveles = async () => {
      try {
        const res = await fetch("/api/niveles");
        const data = await res.json();
        setNiveles(data.niveles);
      } catch (err) {
        console.error("Error al cargar niveles:", err);
      }
    };
    fetchNiveles();
  }, []);


  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!session?.user?.email) return;
  
      try {
        const response = await fetch(`/api/getUser?email=${session.user.email}`);
        const data = await response.json();
  
        if (response.ok && data.image) {
          setProfileImage(data.image); // ✅ Guardar imagen en el estado
        }
      } catch (error) {
        console.error("❌ Error al obtener la imagen de perfil:", error);
      }
    };
  
    fetchProfileImage();
  }, [session?.user?.email]);
  
  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      // Podrías hacer algo con la sesión aquí si es necesario
      console.log("Sesión actualizada:", session);
    };
    fetchSession();
  }, []);
  

  
   // Recargar la página
   const handleReload = () => {
     if (typeof window !== 'undefined') {
       window.location.reload();
     }
   };
  
   // Alternar la visibilidad del menú desplegable
   const toggleMenu = () => {
     setMenuVisible(!menuVisible);
   };
  
   // Alternar el contenido adicional
   const toggleContenido = () => {
     setMostrarContenido(!mostrarContenido);
   };
    
  

   const [animationCompleted, setAnimationCompleted] = useState(false);
 
   useEffect(() => {
     const hasVisited = localStorage.getItem('hasVisited');
     if (!hasVisited) {
       setShowAnimation(true);
       localStorage.setItem('hasVisited', 'true');
     } else {
       setAnimationCompleted(true); // Ya la vio, mostrar contenido directamente
     }
   }, []);
 
   const handleAnimationComplete = () => {
     setAnimationCompleted(true);
   };
 //spline
 useEffect(() => {
    import('@splinetool/viewer');
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

   return (
     <main>
       {showAnimation && !animationCompleted ? (
         <Hero onAnimationComplete={handleAnimationComplete} />
       ) : (
        <div className="xdportada">
            {/* 
        <button
          type="button"
          onClick={toggleTheme}
          title="Cambiar tema"
          aria-label="Cambiar tema"
          disabled={loading}
          className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 z-50 disabled:opacity-50 
            ${localTheme === 1 ? "bg-black text-white" : "bg-white text-black"}`}
        >
          {localTheme === 1 ? "🌙" : "☀️"}
        </button>
        */}
             <nav className='cabezaportada'>
               <section className="subcabeza1portada">
                 <section className="cuadro1cabeza1portada">
                  
                   <div className="logocuadro1cabeza1portada">
                     <Image
                       src="/logo.jpg"
                       alt="logo"
                       width={100}
                       height={50}
                       onClick={handleReload}
                       style={{ cursor: 'pointer' }}
                     />
                   </div>
        
                   <section className="cuentacuadro1cabeza1portada">
        
        
                   <div className="header flex items-center justify-between px-4 py-2 bg-black">
              {status === "loading" ? ( 
                <p className="text-white">Cargando...</p>
              ) : session?.user ? ( 
                <div className="relative flex items-center">
                  {/* 📌 Mostrar el nombre SOLO en pantallas grandes si tiene <= 6 letras */}
                  {(session.user.name || "").length <= 100 && (
                    <span 
                      className="text-white mr-2 hidden sm:inline-block truncate max-w-[150px]" 
                      title={session.user.name || ""}
                    >
                      {session.user.name || ""}
                    </span>
                  )}
        
                  {/* ✅ Mostrar imagen de perfil si existe, sino mostrar la inicial */}
        <div 
          className="user-circle cursor-pointer w-12 h-12 bg-[#A0753A] rounded-full flex items-center justify-center text-white text-lg overflow-hidden border-2 border-[#A0753A]"
          onClick={() => setShowMenu(!showMenu)}
        >
        {profileImage ? (
          <Image  
            src={profileImage} 
            alt="Foto de perfil" 
            width={40}  // ✅ Ajusta el tamaño según necesites
            height={40} // ✅ Ajusta el tamaño según necesites
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          (session.user.name || "").charAt(0).toUpperCase()
        )}
        
        </div>
        {showMenu && (
          <div className="dropdown-menu absolute right-0 mt-2 w-40 bg-[#1E1E1E] rounded-lg shadow-lg p-2 flex flex-col border border-[#A0753A]">
            <button 
              onClick={() => router.push("/Dashboard")}
              className="text-white text-left py-2 px-3 hover:bg-[#A0753A] rounded transition"
            >
              Ver perfil
            </button>
            <button 
              onClick={() => signOut()} 
              className="text-red-400 text-left py-2 px-3 hover:bg-red-600 hover:text-white rounded transition"
            >
              Cerrar sesión
            </button>
          </div>
                  )}
                </div>
              ) : (
        <a
          href="/login"
          className="bg-[#A0753A] text-white px-4 py-2 rounded text-base sm:text-lg md:text-xl sm:px-3 sm:py-1"
        >
          Sin Cuenta
        </a>
              )}
            </div>
                   </section>
                 </section>
               </section>
        

                 <section className="sub1cabeza2portada">
        {/* Botón de hamburguesa */}
        <div className="hamburguesaportada" onClick={toggleMenu}>
          &#9776;
        </div>

        {/* Overlay para cerrar el menú al hacer clic fuera */}
        {menuVisible && (
          <div 
            className={`menu-overlay ${menuVisible ? 'visible' : ''}`}
            onClick={closeMenu}
          />
        )}

        {/* Menú desplegable */}
        <div className={`menusub1cabeza2portada modern ${menuVisible ? 'visible' : ''}`}>
          {niveles.map((nivel) => (
            <a
              key={nivel.nombre}
              href={`/Niveles/${nivel.nombre.toLowerCase().replace(/\s+/g, '')}`}
              onClick={closeMenu} // Cerrar menú al hacer clic en un enlace
            >
              {nivel.nombre}
            </a>
          ))}
        </div>
      </section>
                  
             </nav>
        



    <main className="cuerpoportada">
      <section className="sub1cuerpoportada relative w-full overflow-hidden bg-black">
        {/* Fondo: Spline o imagen móvil */}
{isMobile ? (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
    <video
      src="/robotcelular.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
    />
  </div>
) : (
  <>
    <video
      src="/robotportada.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none z-0"
    />
    {/* Parche para cubrir figura circular en esquina inferior derecha */}
    <div className="absolute bottom-0 right-0 w-40 h-40 bg-black z-10"></div>
  </>
)}



        {/* Contenido encima del fondo */}
        <section className="espaciosub1cuerpoportada relative z-20"></section>
        <section className="cuadro1sub1cuerpoportada relative z-20 text-white text-center">
          <h1>¡Desbloquea tu futuro ahora!</h1>
          <p>
            Explora recursos y herramientas para ti: <br />
            ✔ Aprende lo básico hasta lo avanzado. <br />
            ✔ Mejora tus habilidades a tu ritmo. <br />
            ✔ Construye el camino hacia tus metas. <br />
            📲 ¡Empieza a crecer hoy!
          </p>
        </section>
      </section>
    </main>

        
             <footer>
               <section className="pieportada">
                 <section className="sub1pieportada">
                   {/* Información general */}
                   <div className="infoportada">
                     <h3 className="font-bold text-[#A0753A]">Sobre Nosotros</h3>
                     <p>
                       Enseñamos cursos gratuitos para inicial, primaria, secundaria, inglés y programación (frontend-backend).
                     </p>
                     {/* Texto adicional */}
                     <div className={mostrarContenido ? "mostrarportada" : "ocultarportada"}>
                       {/* Enlaces rápidos */}
                       <div className='informacionportada'>
                         <div className="enlacesportada">
                           <h3 className="font-bold text-[#A0753A]">Categorías</h3>
                           <ul>
                             
                             <li>{niveles.map((nivel) => (
            <a
              key={nivel.nombre}
              href={`/Niveles/${nivel.nombre.toLowerCase().replace(/\s+/g, '')}`}
              onClick={closeMenu} // Cerrar menú al hacer clic en un enlace
            >
              {nivel.nombre}
            </a>
          ))}</li>
                           </ul>
                         </div>
        
                         {/* Redes sociales */}
                         <div className="redesportada">
                           <h3 className="font-bold text-[#A0753A]">Conecta conmigo</h3>
                           <div className="iconsportada">
                           <a href="https://portafolio-web-bay-iota.vercel.app/" title="github" aria-label="github">
                            <Image src="/facebook.png" alt="github" width={24} height={24} />
                          </a>
        
                           </div>
                         </div>
                       </div>
                     </div>
                     {/* Flecha para mostrar/ocultar el contenido */}
                     <span className="flechaportada" onClick={toggleContenido}>
                       {mostrarContenido ? "▲" : "▼"}
                     </span>
                   </div>
                   <div className="enlacesportada">
                     <h3 className="font-bold text-[#A0753A]">Categorías</h3>
                     <ul>
                       <li>{niveles.map((nivel) => (
                        <a
                          key={nivel.nombre}
                          href={`/Niveles/${nivel.nombre.toLowerCase().replace(/\s+/g, '')}`}
                          onClick={closeMenu} // Cerrar menú al hacer clic en un enlace
                        >
                          {nivel.nombre}
                        </a>
                      ))}
                      </li>
                     </ul>
                   </div>
        
                   {/* Redes sociales */}
                   <div className="redesportada">
                     <h3 className="font-bold text-[#A0753A]">Conecta conmigo</h3>
                     <div className="iconsportada">
                     <a href="https://portafolio-web-bay-iota.vercel.app/" target="_blank" rel="noopener noreferrer" title="github">
                      <Image src="/facebook.png" alt="github" width={24} height={24} />
                    </a>
        
                     </div>
                   </div>
                 </section>
               </section>
             </footer>
           </div>
      )}
    </main>
  );
};

export default Bienvenida;
