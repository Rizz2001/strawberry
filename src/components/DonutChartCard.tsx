import React from 'react';
import { SessionCalculatedTotals } from '../types/cash';
import { formatUSD, round2 } from '../utils/cashEngine';

interface DonutChartCardProps {
  totals: SessionCalculatedTotals;
}

export const DonutChartCard: React.FC<DonutChartCardProps> = ({ totals }) => {
  const totalUSD = totals.totalRecibidoCajaUSD;

  const segments = [
    {
      label: 'Pago Móvil',
      usd: totals.byCategory.PAGO_MOVIL.totalUSD,
      color: '#2563EB',
      dotBg: 'bg-[#2563EB]',
    },
    {
      label: 'Punto de Venta',
      usd: totals.pos.totalGeneralPOS.totalUSD,
      color: '#7C3AED',
      dotBg: 'bg-[#7C3AED]',
    },
    {
      label: 'Zelle y Efectivo $',
      usd: round2(totals.byCategory.ZELLE.totalUSD + totals.byCategory.EFECTIVO_USD.totalUSD),
      color: '#10B981',
      dotBg: 'bg-[#10B981]',
    },
    {
      label: 'Transf. y Biopago',
      usd: round2(totals.byCategory.TRANSFERENCIA.totalUSD + totals.byCategory.BIOPAGO.totalUSD),
      color: '#0D9488',
      dotBg: 'bg-[#0D9488]',
    },
    {
      label: 'Efectivo Bs',
      usd: totals.byCategory.EFECTIVO_BS.totalUSD,
      color: '#F59E0B',
      dotBg: 'bg-[#F59E0B]',
    },
  ];

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="fintech-card rounded-3xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#0F172A]">Distribución del Día</h3>
        <span className="text-xs font-semibold text-[#64748B]">
          {totals.totalOperacionesCaja} cobros
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Gráfico Circular Tipo Donut compacto */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 104 104">
            <circle
              cx="52"
              cy="52"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="11"
            />
            {totalUSD > 0 &&
              segments.map((seg, idx) => {
                if (seg.usd <= 0) return null;
                const pct = seg.usd / totalUSD;
                const dash = Math.max(pct * circumference - 2, 2);
                const strokeDasharray = `${dash} ${circumference}`;
                const strokeDashoffset = -accumulatedPercent * circumference;
                accumulatedPercent += pct;

                return (
                  <circle
                    key={idx}
                    cx="52"
                    cy="52"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="11"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                );
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-medium text-[#64748B]">Caja</span>
            <span className="text-xs font-extrabold text-[#0F172A]">
              {formatUSD(totalUSD)}
            </span>
          </div>
        </div>

        {/* Leyenda limpia a la derecha */}
        <div className="flex-1 space-y-2 min-w-0">
          {segments.map((seg, idx) => {
            const pct = totalUSD > 0 ? Math.round((seg.usd / totalUSD) * 100) : 0;
            return (
              <div key={idx} className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${seg.dotBg}`} />
                  <span className="text-[#0F172A] font-medium truncate">{seg.label}</span>
                </div>
                <span className="font-bold text-[#64748B] shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
