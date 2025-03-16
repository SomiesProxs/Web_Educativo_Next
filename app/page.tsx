'use client';

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import Image from 'next/image';

// You'll need to move these CSS imports to a proper place in Next.js
// For example, you can import them in your layout.tsx or create a global.css file
import './cabecera.css';
import './portada.css';
import './pie.css';

const Portada: React.FC = () => {
const { data: session, status } = useSession();  
const [showMenu, setShowMenu] = useState(false);
const router = useRouter();

useEffect(() => {
  const fetchSession = async () => {
    const session = await getSession();
    // Podrías hacer algo con la sesión aquí si es necesario
    console.log("Sesión actualizada:", session);
  };
  fetchSession();
}, []);

const handleLogout = async () => {
  await signOut();
  router.push("/login");
};

 // Estado para el menú desplegable
 const [menuVisible, setMenuVisible] = useState<boolean>(false);

 // Estado para mostrar/ocultar contenido adicional
 const [mostrarContenido, setMostrarContenido] = useState<boolean>(false);



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

 //cuenta dx
  
 return (
   <div className="xdportada">
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

      {/* ✅ Ícono del usuario (SIEMPRE VISIBLE) */}
      <div 
        className="user-circle cursor-pointer w-10 h-10 bg-[#A0753A] rounded-full flex items-center justify-center text-white text-lg"
        onClick={() => setShowMenu(!showMenu)}
      >
        {(session.user.name || "").charAt(0).toUpperCase()} 
      </div>

      {/* 📌 Dropdown Menu */}
      {showMenu && (
        <div className="dropdown-menu absolute right-0 mt-2 w-40 bg-[#1E1E1E] rounded-lg shadow-lg p-2 flex flex-col border border-[#A0753A]">
          <button 
            onClick={() => router.push("/Dashboard")}
            className="text-white text-left py-2 px-3 hover:bg-[#A0753A] rounded transition"
          >
            Ver perfil
          </button>
          <button 
            onClick={handleLogout} 
            className="text-red-400 text-left py-2 px-3 hover:bg-red-600 hover:text-white rounded transition"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  ) : (
    <a href="/login" className="bg-[#A0753A] text-white px-4 py-2 rounded">
      Iniciar sesión
    </a>
  )}
</div>








           </section>
            

         </section>
       </section>

       <section className="cabeza2portada">
         <section className="sub1cabeza2portada">
           {/* Botón de hamburguesa */}
           <div className="hamburguesaportada" onClick={toggleMenu}>
             &#9776;
           </div>

           {/* Menú desplegable */}
           <div className={`menusub1cabeza2portada ${menuVisible ? 'visible' : ''}`}>
             <a href="/inicial">Inicial</a>
             <a href="/primaria">Primaria</a>
             <a href="/secundaria">Secundaria</a>
             <a href="/ingles">Ingles</a>
             <a href="/programacion">Programación</a>
           </div>
         </section>
       </section>
     </nav>

     <main className="cuerpoportada">
       <section className="sub1cuerpoportada">
         <section className='espaciosub1cuerpoportada'></section>
         <section className="cuadro1sub1cuerpoportada">
           <h1>¡Desbloquea tu futuro ahora!</h1>
           <p>Explora recursos y herramientas para ti: <br />
           ✔ Aprende lo básico hasta lo avanzado.  <br />
           ✔ Mejora tus habilidades a tu ritmo.  <br />
           ✔ Construye el camino hacia tus metas.  <br />
           📲 ¡Empieza a crecer hoy!</p>
         </section>
       </section>
     </main>

     <footer>
       <section className="pieportada">
         <section className="sub1pieportada">
           {/* Información general */}
           <div className="infoportada">
             <h3>Sobre Nosotros</h3>
             <p>
               Enseñamos cursos gratuitos para inicial, primaria, secundaria, inglés y programación (frontend-backend).
             </p>
             {/* Texto adicional */}
             <div className={mostrarContenido ? "mostrarportada" : "ocultarportada"}>
               {/* Enlaces rápidos */}
               <div className='informacionportada'>
                 <div className="enlacesportada">
                   <h3>Categorías</h3>
                   <ul>
                     <li><a href="#inicial">Inicial</a></li>
                     <li><a href="#primaria">Primaria</a></li>
                     <li><a href="#secundaria">Secundaria</a></li>
                     <li><a href="#ingles">Inglés</a></li>
                     <li><a href="#programacion">Programación</a></li>
                   </ul>
                 </div>

                 {/* Redes sociales */}
                 <div className="redesportada">
                   <h3>Síguenos</h3>
                   <div className="iconsportada">
                   <a href="#" title="Facebook" aria-label="Facebook">
  <Image src="/facebook.png" alt="Facebook" width={24} height={24} />
</a>

<a href="#" title="Twitter" aria-label="Twitter">
  <Image src="/twiter.png" alt="Twitter" width={24} height={24} />
</a>

<a href="#" title="Instagram" aria-label="Instagram">
  <Image src="/instagram.png" alt="Instagram" width={24} height={24} />
</a>

<a href="#" title="WhatsApp" aria-label="WhatsApp">
  <Image src="/wasap.png" alt="WhatsApp" width={24} height={24} />
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
             <h3>Categorías</h3>
             <ul>
               <li><a href="#inicial">Inicial</a></li>
               <li><a href="#primaria">Primaria</a></li>
               <li><a href="#secundaria">Secundaria</a></li>
               <li><a href="#ingles">Inglés</a></li>
               <li><a href="#programacion">Programación</a></li>
             </ul>
           </div>

           {/* Redes sociales */}
           <div className="redesportada">
             <h3>Síguenos</h3>
             <div className="iconsportada">
             <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
  <Image src="/facebook.png" alt="Facebook" width={24} height={24} />
</a>

<a href="#" title="Twitter" aria-label="Twitter">
  <Image src="/twiter.png" alt="Twitter" width={24} height={24} />
</a>

<a href="#" title="Instagram" aria-label="Instagram">
  <Image src="/instagram.png" alt="Instagram" width={24} height={24} />
</a>

<a href="#" title="WhatsApp" aria-label="WhatsApp">
  <Image src="/wasap.png" alt="WhatsApp" width={24} height={24} />
</a>

             </div>
           </div>
         </section>
       </section>
     </footer>
   </div>
 );
};

export default Portada;