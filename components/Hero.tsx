'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

export default function Hero() {
  const textRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    el.innerHTML = '';
    setIsReady(true); // Mostrar el contenido solo cuando comience la animación

    const word = ["S", "O", "M", "I", "E", "S"];
    let currentWord = "";
    let delay = 0;

    word.forEach((letter, index) => {
      setTimeout(() => {
        currentWord += letter;
        el.innerHTML = currentWord;

        gsap.fromTo(
          el.children[index],
          { scale: 1.5 },
          { scale: 1, duration: 0.5, ease: "power2.out" }
        );
      }, delay);
      delay += 400;
    });

    setTimeout(() => {
      gsap.to(el, {
        duration: 1,
        opacity: 0,
        scale: 0.2,
        ease: 'power2.inOut',
        onComplete: () => {
          if (el) {
            el.innerHTML = "Bienvenido";
            gsap.from(el, {
              opacity: 0,
              scale: 2.5,
              duration: 1,
              onComplete: () => {
                router.push('/CONTENIDO');
              }
            });
          }
        },
      });
    }, delay + 1000);

  }, [router]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      <div
        ref={textRef}
        className={`text-8xl transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Este contenido se limpiará antes de animar */}
        {["S", "O", "M", "I", "E", "S"].map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </div>
    </div>
  );
}
