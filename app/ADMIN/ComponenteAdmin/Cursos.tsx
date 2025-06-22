'use client';

import { useState } from 'react';
import { gsap } from 'gsap';
import Inicial from './Cursos/INICIAL/Inicial';
import Misael from './Cursos/MISAEL/Misael';
import Huevo from './Cursos/HUEVO/Huevo';
import Maisena from './Cursos/MAISENA/Maisena';
import Carpinteria from './Cursos/CARPINTERIA/Carpinteria';
import A1 from './A1';

export default function Cursos() {



const [cursoActivo, setCursoActivo] = useState<string | null>(null);
const [showButtons, setShowButtons] = useState(true);


//aca solo aumentar nuevos cursos y arribaa tambien en los imports nada mas xd
const cursos = [
  {
    nombre: 'INICIAL',
    componente: Inicial,
    claseAnimacion: 'inicial-container',
  },
  {
    nombre: 'MISAEL',
    componente: Misael,
    claseAnimacion: 'Misael-container',
  },
  {
    nombre: 'HUEVO',
    componente: Huevo,
    claseAnimacion: 'Huevo-container',
  },
  {
    nombre: 'MAISENA',
    componente: Maisena,
    claseAnimacion: 'Maisena-container',
  },
  {
    nombre: 'CARPINTERIA',
    componente: Carpinteria,
    claseAnimacion: 'Carpinteria-container',
  },
];



const ocultarBotones = () => {
  gsap.to('.selection-buttons', {
    opacity: 0,
    y: -100,
    duration: 0.5,
    ease: 'power3.out',
    onComplete: () => {
      setShowButtons(false);
    },
  });
};

const handleCursoClick = (nombre: string, clase: string) => {
  setCursoActivo(nombre);
  ocultarBotones();

  gsap.fromTo(
    `.${clase}`,
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
  );
};

const volver = () => {
  setCursoActivo(null);
  setShowButtons(true);
};


  return (
    <div className="relative h-screen">
      {showButtons && (
    <div className="selection-buttons absolute inset-0 flex flex-col gap-6 z-10">
      {cursos.map(({ nombre, claseAnimacion }) => (
        <div
          key={nombre}
          onClick={() => handleCursoClick(nombre, claseAnimacion)}
          className={`btn-${nombre.toLowerCase()} p-6 sm:p-8 bg-blue-500 text-white text-lg sm:text-xl font-bold text-center rounded-lg shadow-lg cursor-pointer transition-colors duration-300 hover:bg-blue-600`}
        >
          {nombre}
        </div>
      ))}
    </div>
  )}


{/* 
      <div className="relative w-full h-full">
        {showInicia && (
          <div className="inicial-container absolute inset-0 transition-opacity duration-500 ease-in-out">
            <Inicial onVolver={volver} />
          </div>
        )}
        {showMisael && (
          <div className="Misael-container absolute inset-0 transition-opacity duration-500 ease-in-out">
            <Misael onVolver={volver} />
          </div>
        )}
      </div>
*/}

<div className="w-full">
  {cursos.map(({ nombre, componente: Componente, claseAnimacion }) =>
    cursoActivo === nombre ? (
      <div key={nombre} className={`${claseAnimacion}`}>
        <Componente onVolver={volver} />
      </div>
    ) : null
  )}
</div>




      <A1 />
    </div>
  );
}
