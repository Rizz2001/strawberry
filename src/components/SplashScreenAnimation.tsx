import React, { useEffect, useState } from 'react';
import { StrawchellLogo } from './StrawchellLogo';

interface SplashScreenAnimationProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreenAnimation: React.FC<SplashScreenAnimationProps> = ({
  onFinish,
  durationMs = 1800,
}) => {
  const [stage, setStage] = useState<'enter' | 'pulse' | 'exit' | 'hidden'>('enter');

  useEffect(() => {
    // 1. Enter: Logo scales in softly
    const pulseTimer = setTimeout(() => {
      setStage('pulse');
    }, 400);

    // 2. Exit: Fade out gently
    const exitTimer = setTimeout(() => {
      setStage('exit');
    }, durationMs - 450);

    // 3. Hidden: Remove from DOM
    const hideTimer = setTimeout(() => {
      setStage('hidden');
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [durationMs, onFinish]);

  if (stage === 'hidden') return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F4F6FB] transition-all duration-500 ease-out select-none ${
        stage === 'exit'
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Halos difuminados suaves en el fondo */}
      <div className="pointer-events-none absolute w-72 h-72 rounded-full bg-[#BAE6FD]/60 blur-3xl -top-10 -left-10" />
      <div className="pointer-events-none absolute w-72 h-72 rounded-full bg-[#DDD6FE]/70 blur-3xl -bottom-10 -right-10" />

      {/* Contenedor central animado */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Glow sutil detrás del logo */}
        <div className="relative mb-4 flex items-center justify-center">
          <div
            className={`absolute w-28 h-28 rounded-full bg-rose-400/20 blur-xl transition-all duration-700 ${
              stage === 'pulse' ? 'scale-125 opacity-80' : 'scale-90 opacity-40'
            }`}
          />

          <div
            className={`w-24 h-24 rounded-3xl bg-white/90 backdrop-blur-md border border-white shadow-[0_12px_40px_rgba(225,37,40,0.15)] flex items-center justify-center transition-all duration-500 ${
              stage === 'enter'
                ? 'scale-75 opacity-0'
                : stage === 'pulse'
                ? 'scale-100 opacity-100'
                : 'scale-95 opacity-100'
            }`}
          >
            <StrawchellLogo className="w-14 h-14" showText={false} />
          </div>
        </div>

        {/* Nombre de la marca */}
        <h1
          className={`text-2xl font-extrabold tracking-tight text-[#0F172A] transition-all duration-500 delay-100 ${
            stage === 'enter'
              ? 'opacity-0 translate-y-3'
              : 'opacity-100 translate-y-0'
          }`}
        >
          strawchell
        </h1>

        {/* Subtítulo Clean Fintech */}
        <p
          className={`text-xs font-semibold text-[#64748B] mt-1 transition-all duration-500 delay-200 ${
            stage === 'enter'
              ? 'opacity-0 translate-y-2'
              : 'opacity-100 translate-y-0'
          }`}
        >
          Control y Cierre de Caja Multimoneda
        </p>

        {/* Barra de progreso fina minimalista */}
        <div className="w-36 h-1 rounded-full bg-slate-200/80 overflow-hidden mt-6">
          <div
            className={`h-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-full transition-all duration-1000 ease-out ${
              stage === 'enter' ? 'w-0' : 'w-full'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

