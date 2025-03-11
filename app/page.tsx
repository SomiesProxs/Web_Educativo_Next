'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// You'll need to move these CSS imports to a proper place in Next.js
// For example, you can import them in your layout.tsx or create a global.css file
import './cabecera.css';
import './portada.css';
import './pie.css';

const Portada: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername(null);
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
           <nav>
           {username ? (
        <div className="flex items-center gap-4">
          <span>Bienvenido, {username}</span>
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
            Cerrar sesión
          </button>
        </div>
          ) : (
            <a href="/register" className="bg-green-500 px-4 py-2 rounded">
              Iniciar sesión
            </a>
          )}
          </nav>
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
             <Link href="/inicial">Inicial</Link>
             <Link href="/primaria">Primaria</Link>
             <Link href="/secundaria">Secundaria</Link>
             <Link href="/ingles">Ingles</Link>
             <Link href="/programacion">Programación</Link>
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