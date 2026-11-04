import React from 'react';
import { Edit3, ShieldAlert } from 'lucide-react';
import { StrawchellLogo } from './StrawchellLogo';

interface StickyHeaderProps {
  exchangeRate: number;
  cashierName?: string;
  onOpenRateModal: () => void;
}

export const StickyHeader: React.FC<StickyHeaderProps> = ({
  exchangeRate,
  onOpenRateModal,
}) => {
  const isRateValid = exchangeRate > 0;

  const formattedDate = new Date().toLocaleDateString('es-VE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <header className="sticky top-0 z-30 bg-[#F4F6FB]/85 backdrop-blur-xl border-b border-white/80">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Izquierda: Logo strawchell + Fecha */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
            <StrawchellLogo className="w-5 h-5" showText={false} />
          </div>
          <div>
            <span className="block text-base font-extrabold tracking-tight text-[#0F172A] leading-tight">
              strawchell
            </span>
            <span className="block text-[11px] text-[#64748B] font-medium capitalize">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Derecha: Píldora minimalista de Tasa del Día */}
        <button
          type="button"
          onClick={onOpenRateModal}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            isRateValid
              ? 'bg-white border-white text-[#0F172A] shadow-sm hover:border-indigo-200'
              : 'bg-orange-50 border-orange-300 text-orange-700 animate-pulse'
          }`}
        >
          {!isRateValid && <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />}
          <span className="text-[#64748B] font-medium">Tasa:</span>
          <span className="text-[#4F46E5] font-extrabold">
            {isRateValid ? `Bs. ${exchangeRate.toFixed(2)}` : 'Definir'}
          </span>
          <Edit3 className="w-3 h-3 text-[#64748B]" />
        </button>
      </div>
    </header>
  );
};
