import React from 'react';
import {
  Banknote,
  CreditCard,
  FileDown,
  FileText,
  Fingerprint,
  Landmark,
  Layers,
  Send,
  Smartphone,
} from 'lucide-react';
import { MovimientosPillTab, SessionCalculatedTotals } from '../types/cash';
import { formatUSD, formatVES } from '../utils/cashEngine';
import { PosSummaryCard } from './PosSummaryCard';

interface DesgloseViewProps {
  totals: SessionCalculatedTotals;
  onSelectCategoryPill: (pill: MovimientosPillTab) => void;
  onOpenClosureModal: () => void;
}

export const DesgloseView: React.FC<DesgloseViewProps> = ({
  totals,
  onSelectCategoryPill,
  onOpenClosureModal,
}) => {
  const granTotalUSD = totals.granTotalVentaDiaUSD;

  const progressRows = [
    {
      label: 'Pago Móvil',
      count: totals.byCategory.PAGO_MOVIL.count,
      ves: totals.byCategory.PAGO_MOVIL.totalVES,
      usd: totals.byCategory.PAGO_MOVIL.totalUSD,
      circleBg: 'bg-[#DBEAFE]',
      iconColor: 'text-[#2563EB]',
      barColor: 'from-blue-500 to-indigo-500',
      icon: Smartphone,
      pill: 'PAGO_MOVIL' as MovimientosPillTab,
      isCredit: false,
    },
    {
      label: 'POS · Débito + MasterCard',
      count: totals.pos.subtotalDebitoConsolidado.count,
      ves: totals.pos.subtotalDebitoConsolidado.totalVES,
      usd: totals.pos.subtotalDebitoConsolidado.totalUSD,
      circleBg: 'bg-[#EDE9FE]',
      iconColor: 'text-[#7C3AED]',
      barColor: 'from-indigo-500 to-purple-500',
      icon: Layers,
      pill: 'POS' as MovimientosPillTab,
      isCredit: false,
    },
    {
      label: 'POS · TDC Crédito',
      count: totals.pos.subtotalCredito.count,
      ves: totals.pos.subtotalCredito.totalVES,
      usd: totals.pos.subtotalCredito.totalUSD,
      circleBg: 'bg-[#EDE9FE]',
      iconColor: 'text-[#7C3AED]',
      barColor: 'from-purple-500 to-violet-500',
      icon: CreditCard,
      pill: 'POS' as MovimientosPillTab,
      isCredit: false,
    },
    {
      label: 'Zelle ($ USD)',
      count: totals.byCategory.ZELLE.count,
      ves: totals.byCategory.ZELLE.totalVES,
      usd: totals.byCategory.ZELLE.totalUSD,
      circleBg: 'bg-[#D1FAE5]',
      iconColor: 'text-[#059669]',
      barColor: 'from-emerald-500 to-teal-500',
      icon: Send,
      pill: 'ZELLE' as MovimientosPillTab,
      isCredit: false,
    },
    {
      label: 'Transferencias',
      count: totals.byCategory.TRANSFERENCIA.count,
      ves: totals.byCategory.TRANSFERENCIA.totalVES,
      usd: totals.byCategory.TRANSFERENCIA.totalUSD,
      circleBg: 'bg-[#CCFBF1]',
      iconColor: 'text-[#0D9488]',
      barColor: 'from-teal-500 to-cyan-500',
      icon: Landmark,
      pill: 'TRANSFERENCIA' as MovimientosPillTab,
      isCredit: false,
    },
    {
      label: 'Biopago',
      count: totals.byCategory.BIOPAGO.count,
      ves: totals.byCategory.BIOPAGO.totalVES,
      usd: totals.byCategory.BIOPAGO.totalUSD,
      circleBg: 'bg-[#CCFBF1]',
      iconColor: 'text-[#0D9488]',
      barColor: 'from-cyan-500 to-sky-500',
      icon: Fingerprint,
      pill: 'BIOPAGO' as MovimientosPillTab,
      isCredit: false,
    },
    {
      label: 'Efectivo en Bolívares',
      count: totals.byCategory.EFECTIVO_BS.count,
      ves: totals.byCategory.EFECTIVO_BS.totalVES,
      usd: totals.byCategory.EFECTIVO_BS.totalUSD,
      circleBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
      barColor: 'from-amber-400 to-orange-500',
      icon: Banknote,
      pill: 'EFECTIVO' as MovimientosPillTab,
      isCredit: false,
    },
    {
      label: 'Efectivo en Dólares ($)',
      count: totals.byCategory.EFECTIVO_USD.count,
      ves: totals.byCategory.EFECTIVO_USD.totalVES,
      usd: totals.byCategory.EFECTIVO_USD.totalUSD,
      circleBg: 'bg-[#D1FAE5]',
      iconColor: 'text-[#059669]',
      barColor: 'from-emerald-400 to-green-600',
      icon: Banknote,
      pill: 'EFECTIVO' as MovimientosPillTab,
      isCredit: false,
    },
    {
      label: 'Facturas a Crédito (Por cobrar)',
      count: totals.countCuentasPorCobrar,
      ves: totals.totalCuentasPorCobrarVES,
      usd: totals.totalCuentasPorCobrarUSD,
      circleBg: 'bg-[#FFE4E6]',
      iconColor: 'text-[#E11D48]',
      barColor: 'from-orange-500 to-rose-500',
      icon: FileText,
      pill: 'CREDITOS' as MovimientosPillTab,
      isCredit: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Tarjeta Superior de Consolidación Punto de Venta (Débito + MasterCard vs Crédito) */}
      <PosSummaryCard pos={totals.pos} />

      {/* 2. Lista de Categorías con Barras de Progreso */}
      <div className="fintech-card rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0F172A]">
            Desglose por Método de Pago
          </h3>
          <span className="text-xs font-semibold text-[#64748B]">
            Total Día: {formatUSD(granTotalUSD)}
          </span>
        </div>

        <div className="space-y-3.5">
          {progressRows.map((row, idx) => {
            const Icon = row.icon;
            const pct =
              granTotalUSD > 0 ? Math.round((row.usd / granTotalUSD) * 100) : 0;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectCategoryPill(row.pill)}
                className="w-full text-left flex items-center gap-3 group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full ${row.circleBg} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-5 h-5 ${row.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs sm:text-sm font-bold text-[#0F172A] truncate group-hover:text-[#4F46E5]">
                      {row.label}{' '}
                      <span className="text-xs font-normal text-[#64748B]">
                        ({row.count})
                      </span>
                    </span>
                    <span className="text-xs font-bold text-[#0F172A] shrink-0">
                      {pct}%
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${row.barColor} transition-all duration-500`}
                      style={{ width: `${row.usd > 0 ? Math.max(pct, 4) : 0}%` }}
                    />
                  </div>

                  <div className="text-xs font-semibold text-[#64748B]">
                    <span className="text-[#4F46E5]">{formatVES(row.ves)}</span> /{' '}
                    <span className={row.isCredit ? 'text-[#F97316]' : 'text-[#10B981]'}>
                      {formatUSD(row.usd)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Botón de Descarga de Cierre de Caja */}
      <button
        type="button"
        onClick={onOpenClosureModal}
        className="w-full rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold py-4 px-5 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer"
      >
        <FileDown className="w-5 h-5" />
        <span>Extraer Reporte PDF / Compartir Cierre</span>
      </button>
    </div>
  );
};
