'use client';
import { useEffect } from 'react';
import gsap from 'gsap';

export default function A1() {
  useEffect(() => {
    const tl = gsap.timeline();

    // Determinar el desplazamiento según el tamaño de la pantalla
    const isMobile = window.innerWidth <= 768; // Considera dispositivos con un ancho de pantalla menor o igual a 768px como móviles

    const startX = isMobile ? 80 : 200;  // Si es móvil, empezamos con 400px desde el borde, en PC 600px
    const endX = 0;  // El destino es el centro de la pantalla

    // INICIAL: Desde la derecha, regresa al centro
    tl.fromTo('.btn-inicial', {
      x: startX,  // Comienza fuera de la pantalla (derecha)
      opacity: 0,  // Empieza transparente
    }, {
      x: endX,      // Finaliza en el centro
      opacity: 1,   // Finaliza completamente visible
      duration: 0.8,
      ease: 'power3.out',
    });

    // PRIMARIA: Desde la izquierda, regresa al centro
    tl.fromTo('.btn-primaria', {
      x: -startX,  // Comienza fuera de la pantalla (izquierda)
      opacity: 0,  // Empieza transparente
    }, {
      x: endX,      // Finaliza en el centro
      opacity: 1,   // Finaliza completamente visible
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.4');  // Empieza antes de que termine la animación anterior
  }, []);

  return null;  // Este componente solo se encarga de animar
}
