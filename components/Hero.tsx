'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const WORD = ['S', 'O', 'M', 'I', 'E', 'S']; // ✅ Moved outside component

export default function Hero({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);

      // Animar cada letra una a una
      WORD.forEach((_, index) => {
        const el = containerRef.current?.children[index];
        if (el) {
          setTimeout(() => {
            gsap.fromTo(
              el,
              { scale: 1.5, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }
            );
          }, index * 600);
        }
      });

      // Animación final
      setTimeout(() => {
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 0.5,
            duration: 1.5,
            ease: 'power2.inOut',
            onComplete: () => {
              onAnimationComplete();
            },
          });
        }
      }, WORD.length * 600 + 1000);
    }, 100);
  }, [onAnimationComplete]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <div className="w-16 h-16 border-8 border-t-transparent border-white border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      <div
        ref={containerRef}
        className="text-[80px] font-black leading-none tracking-tight flex gap-1 text-white uppercase lg:text-[180px]"
      >
        {WORD.map((letter, index) => (
          <span key={index} className="inline-block opacity-0">{letter}</span>
        ))}
      </div>
    </div>
  );
}