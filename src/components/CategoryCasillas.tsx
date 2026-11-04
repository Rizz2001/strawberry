import React from 'react';
import {
  Banknote,
  CreditCard,
  FileText,
  Fingerprint,
  Landmark,
  Send,
  Smartphone,
} from 'lucide-react';
import { MovimientosPillTab, SessionCalculatedTotals } from '../types/cash';
import { formatUSD, formatVES, round2 } from '../utils/cashEngine';

interface CategoryCasillasProps {
  totals: SessionCalculatedTotals;
  activePill: MovimientosPillTab;
  onSelectPill: (pill: MovimientosPillTab) => void;
}

export const CategoryCasillas: React.FC<CategoryCasillasProps> = ({
  totals,
  activePill,
  onSelectPill,
}) => {
  const efectivoTotalUSD = round2(
    totals.byCategory.EFECTIVO_BS.totalUSD + totals.byCategory.EFECTIVO_USD.totalUSD
  );
  const efectivoTotalVES = round2(
    totals.byCategory.EFECTIVO_BS.totalVES + totals.byCategory.EFECTIVO_USD.totalVES
  );
  const efectivoCount =
    totals.byCategory.EFECTIVO_BS.count + totals.byCategory.EFECTIVO_USD.count;

  const casillas = [
    {
      id: 'PAGO_MOVIL' as MovimientosPillTab,
      label: 'Pago Móvil',
      count: totals.byCategory.PAGO_MOVIL.count,
      ves: totals.byCategory.PAGO_MOVIL.totalVES,
      usd: totals.byCategory.PAGO_MOVIL.totalUSD,
      circleBg: 'bg-[#DBEAFE]',
      iconColor: 'text-[#2563EB]',
      icon: Smartphone,
      isCredit: false,
    },
    {
      id: 'TRANSFERENCIA' as MovimientosPillTab,
      label: 'Transferencias',
      count: totals.byCategory.TRANSFERENCIA.count,
      ves: totals.byCategory.TRANSFERENCIA.totalVES,
      usd: totals.byCategory.TRANSFERENCIA.totalUSD,
      circleBg: 'bg-[#CCFBF1]',
      iconColor: 'text-[#0D9488]',
      icon: Landmark,
      isCredit: false,
    },
    {
      id: 'POS' as MovimientosPillTab,
      label: 'Punto de Venta',
      sublabel: 'Débito + MasterCard',
      count: totals.pos.totalGeneralPOS.count,
      ves: totals.pos.totalGeneralPOS.totalVES,
      usd: totals.pos.totalGeneralPOS.totalUSD,
      circleBg: 'bg-[#EDE9FE]',
      iconColor: 'text-[#7C3AED]',
      icon: CreditCard,
      isCredit: false,
    },
    {
      id: 'ZELLE' as MovimientosPillTab,
      label: 'Zelle ($ USD)',
      count: totals.byCategory.ZELLE.count,
      ves: totals.byCategory.ZELLE.totalVES,
      usd: totals.byCategory.ZELLE.totalUSD,
      circleBg: 'bg-[#D1FAE5]',
      iconColor: 'text-[#059669]',
      icon: Send,
      isCredit: false,
    },
    {
      id: 'BIOPAGO' as MovimientosPillTab,
      label: 'Biopago',
      count: totals.byCategory.BIOPAGO.count,
      ves: totals.byCategory.BIOPAGO.totalVES,
      usd: totals.byCategory.BIOPAGO.totalUSD,
      circleBg: 'bg-[#CCFBF1]',
      iconColor: 'text-[#0D9488]',
      icon: Fingerprint,
      isCredit: false,
    },
    {
      id: 'EFECTIVO' as MovimientosPillTab,
      label: 'Efectivo (Bs y $)',
      count: efectivoCount,
      ves: efectivoTotalVES,
      usd: efectivoTotalUSD,
      circleBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
      icon: Banknote,
      isCredit: false,
    },
    {
      id: 'CREDITOS' as MovimientosPillTab,
      label: 'Facturas a Crédito',
      sublabel: 'Por cobrar (fuera de caja)',
      count: totals.countCuentasPorCobrar,
      ves: totals.totalCuentasPorCobrarVES,
      usd: totals.totalCuentasPorCobrarUSD,
      circleBg: 'bg-[#FFE4E6]',
      iconColor: 'text-[#E11D48]',
      icon: FileText,
      isCredit: true,
    },
  ];

  // Si estamos en "Todos", mostramos las casillas que tienen cobros o todas de forma limpia
  // Si estamos en una categoría específica, mostramos esa casilla destacada grande
  const activeSingleCasilla = casillas.find((c) => c.id === activePill);

  if (activePill !== 'TODOS' && activeSingleCasilla) {
    const Icon = activeSingleCasilla.icon;
    return (
      <div className="bg-white/95 backdrop-blur-md border border-white rounded-3xl p-4 shadow-[0_6px_24px_rgb(15,23,42,0.04)] mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl ${activeSingleCasilla.circleBg} flex items-center justify-center shrink-0 shadow-xs`}
            >
              <Icon className={`w-5 h-5 ${activeSingleCasilla.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#0F172A]">
                  Casilla: {activeSingleCasilla.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#4F46E5] text-[11px] font-bold">
                  {activeSingleCasilla.count} op.
                </span>
              </div>
              <span className="text-[11px] text-[#64748B]">
                {activeSingleCasilla.sublabel || 'Total acumulado en esta sección'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`block text-base font-extrabold ${
                activeSingleCasilla.isCredit ? 'text-[#F97316]' : 'text-[#10B981]'
              }`}
            >
              {formatUSD(activeSingleCasilla.usd)}
            </span>
            <span className="block text-xs font-bold text-[#4F46E5]">
              {formatVES(activeSingleCasilla.ves)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Vista "TODOS": Agrupación de Totales por Casillas (Grid de 2 columnas)
  return (
    <div className="space-y-2 mb-3">
      {/* Barra superior de Resumen General */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Totales por Casillas
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-[#4F46E5] text-xs font-extrabold shadow-2xs border border-slate-100">
            {totals.totalOperacionesCaja} cobros
          </span>
        </div>
        <div className="text-right text-xs">
          <span className="font-extrabold text-[#10B981]">
            {formatUSD(totals.totalRecibidoCajaUSD)}
          </span>
          <span className="text-[#64748B] mx-1">·</span>
          <span className="font-bold text-[#4F46E5]">
            {formatVES(totals.totalRecibidoCajaVES)}
          </span>
        </div>
      </div>

      {/* Cuadrícula de Casillas Agrupadas */}
      <div className="grid grid-cols-2 gap-2">
        {casillas.map((c) => {
          const Icon = c.icon;
          const hasOps = c.count > 0;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectPill(c.id)}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-98 cursor-pointer ${
                hasOps
                  ? 'bg-white/95 border-white shadow-[0_4px_16px_rgb(15,23,42,0.035)] hover:border-indigo-100'
                  : 'bg-white/60 border-slate-100 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <div
                  className={`w-7 h-7 rounded-xl ${c.circleBg} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-3.5 h-3.5 ${c.iconColor}`} />
                </div>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    hasOps
                      ? 'bg-indigo-50 text-[#4F46E5]'
                      : 'bg-slate-100 text-[#94A3B8]'
                  }`}
                >
                  {c.count} op.
                </span>
              </div>

              <div className="min-w-0">
                <span className="block text-xs font-bold text-[#0F172A] truncate leading-tight">
                  {c.label}
                </span>

                <div className="mt-1">
                  <span className="block text-xs font-bold text-[#0F172A] truncate">
                    {formatVES(c.ves)}
                  </span>
                  <span
                    className={`block text-[11px] font-bold ${
                      c.isCredit ? 'text-[#F97316]' : 'text-[#10B981]'
                    }`}
                  >
                    +{formatUSD(c.usd)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

