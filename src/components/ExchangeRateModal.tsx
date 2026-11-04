import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, RefreshCw, ShieldAlert, X } from 'lucide-react';
import { round2 } from '../utils/cashEngine';
import { StrawchellLogo } from './StrawchellLogo';

interface ExchangeRateModalProps {
  isOpen: boolean;
  currentRate: number;
  transactionCount: number;
  onSaveRate: (newRate: number, cashierName?: string) => void;
  onClose: () => void;
  currentCashier?: string;
}

export const ExchangeRateModal: React.FC<ExchangeRateModalProps> = ({
  isOpen,
  currentRate,
  transactionCount,
  onSaveRate,
  onClose,
  currentCashier = 'Jornada Activa',
}) => {
  const [rateInput, setRateInput] = useState<string>(currentRate > 0 ? String(currentRate) : '');
  const [cashierInput, setCashierInput] = useState<string>(currentCashier);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isMandatory = currentRate <= 0;

  useEffect(() => {
    if (isOpen) {
      setRateInput(currentRate > 0 ? String(currentRate) : '');
      setCashierInput(currentCashier || 'Jornada Activa');
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 60);
    }
  }, [isOpen, currentRate, currentCashier]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = rateInput.replace(',', '.');
    const parsed = round2(parseFloat(normalized));
    if (!parsed || parsed <= 0) {
      setError('Ingresa una tasa de cambio válida mayor a 0 (Ej: 65.50)');
      return;
    }
    onSaveRate(parsed, cashierInput.trim() || 'Jornada Activa');
  };

  return (
    <div className="anim-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="anim-modal w-full max-w-md bg-white border border-white rounded-3xl p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F6FB] border border-slate-100 flex items-center justify-center shrink-0">
              <StrawchellLogo className="w-7 h-7" showText={false} />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B4EFF]">
                strawchell · Tasa Oficial
              </span>
              <h2 className="text-base font-extrabold text-[#0F172A]">
                {isMandatory ? 'Apertura de Jornada Obligatoria' : 'Actualizar Tasa del Día'}
              </h2>
              <p className="text-xs text-[#64748B]">
                Define el cambio Bs / USD para conversiones automáticas
              </p>
            </div>
          </div>

          {!isMandatory && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 text-[#64748B] hover:text-[#0F172A] cursor-pointer active:scale-90 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
              Tasa del Día (Bs por $1 USD) *
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                placeholder="Ej. 64.50"
                value={rateInput}
                onChange={(e) => {
                  setRateInput(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#F4F6FB] focus:bg-white border-2 border-indigo-200 focus:border-[#5B4EFF] rounded-2xl px-4 py-3.5 text-2xl font-extrabold text-[#4F46E5] placeholder-slate-300 focus:outline-none transition-all"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] px-3 py-1 rounded-full">
                Bs / $1
              </span>
            </div>
            {error && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
              Nombre de Jornada / Turno (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Jornada Activa - Turno Único"
              value={cashierInput}
              onChange={(e) => setCashierInput(e.target.value)}
              className="w-full bg-[#F4F6FB] focus:bg-white border border-slate-200 focus:border-[#5B4EFF] rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#0F172A] placeholder-slate-400 focus:outline-none"
            />
          </div>

          {transactionCount > 0 && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#EEF2FF] border border-indigo-100 text-xs text-[#4F46E5]">
              <RefreshCw className="w-4 h-4 text-[#5B4EFF] shrink-0 mt-0.5" />
              <span>
                Tienes <strong>{transactionCount} cobros anotados</strong> hoy. Al guardar la nueva
                tasa se recalcularán todos los equivalentes automáticamente.
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-bold text-sm shadow-lg shadow-indigo-500/30 active:scale-98 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isMandatory ? 'Abrir Caja con esta Tasa' : 'Guardar y Recalcular Caja'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
