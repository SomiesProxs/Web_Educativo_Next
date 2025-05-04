'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import './globals.css';

export default function Hero() {
  const [isLoading, setIsLoading] = useState(true);
  const [letters, setLetters] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const word = ['S', 'O', 'M', 'I', 'E', 'S'];
    let delay = 0;

    setTimeout(() => {
      setIsLoading(false); // Oculta el spinner y muestra las letras

      word.forEach((letter, index) => {
        setTimeout(() => {
          setLetters((prev) => [...prev, letter]);

          const el = containerRef.current?.children[index];
          if (el) {
            gsap.fromTo(
              el,
              { scale: 1.5, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' }
            );
          }
        }, index * 400);
      });

      // Redirigir después de la animación
      setTimeout(() => {
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 0.2,
            duration: 1,
            ease: 'power2.inOut',
            onComplete: () => {
              router.push('/CONTENIDO');
            },
          });
        }
      }, word.length * 400 + 1000);
    }, 100); // Pequeño delay inicial para simular carga
  }, [router]);

  // Spinner de carga mientras isLoading === true
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <div className="w-16 h-16 border-8 border-t-transparent border-white border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      <div ref={containerRef} className="text-8xl flex gap-2">
        {letters.map((letter, index) => (
          <span key={index} className="inline-block">
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
