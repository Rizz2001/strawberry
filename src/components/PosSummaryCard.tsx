import React from 'react';
import { CreditCard, Layers } from 'lucide-react';
import { PosConsolidation } from '../types/cash';
import { formatUSD, formatVES } from '../utils/cashEngine';

interface PosSummaryCardProps {
  pos: PosConsolidation;
}

export const PosSummaryCard: React.FC<PosSummaryCardProps> = ({ pos }) => {
  const totalPosVES = pos.totalGeneralPOS.totalVES;
  const debitoPct =
    totalPosVES > 0
      ? Math.round((pos.subtotalDebitoConsolidado.totalVES / totalPosVES) * 100)
      : 0;

  return (
    <div className="fintech-card rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Consolidado Punto de Venta (POS)
            </h3>
            <p className="text-xs text-[#64748B]">
              MasterCard se suma junto con Débito automáticamente
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED]">
          {pos.totalGeneralPOS.count} op.
        </span>
      </div>

      {/* Barra de progreso comparativa Débito+MasterCard vs TDC Crédito */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-[#4F46E5]">
            Débito Consolidado ({debitoPct}%)
          </span>
          <span className="text-[#7C3AED]">
            TDC Crédito ({totalPosVES > 0 ? 100 - debitoPct : 0}%)
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${totalPosVES > 0 ? Math.max(debitoPct, 6) : 0}%` }}
          />
        </div>
      </div>

      {/* Bloque Destacado: Débito Consolidado (Débito Normal + MasterCard) */}
      <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#4F46E5]" />
            Total Débito Consolidado (Débito + MasterCard)
          </span>
          <span className="text-xs font-semibold text-[#64748B]">
            {pos.subtotalDebitoConsolidado.count} op.
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-lg font-extrabold text-[#4F46E5]">
            {formatVES(pos.subtotalDebitoConsolidado.totalVES)}
          </span>
          <span className="text-base font-bold text-[#10B981]">
            {formatUSD(pos.subtotalDebitoConsolidado.totalUSD)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70 text-xs">
          <div className="bg-white rounded-xl p-2.5 border border-slate-100">
            <span className="block text-[#64748B] text-[11px]">
              Débito Normal ({pos.debitoNormal.count})
            </span>
            <span className="font-bold text-[#0F172A]">
              {formatVES(pos.debitoNormal.totalVES)}
            </span>
            <span className="block text-[11px] font-semibold text-[#10B981]">
              {formatUSD(pos.debitoNormal.totalUSD)}
            </span>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-slate-100">
            <span className="block text-[#64748B] text-[11px]">
              MasterCard ({pos.mastercard.count})
            </span>
            <span className="font-bold text-[#0F172A]">
              {formatVES(pos.mastercard.totalVES)}
            </span>
            <span className="block text-[11px] font-semibold text-[#10B981]">
              {formatUSD(pos.mastercard.totalUSD)}
            </span>
          </div>
        </div>
      </div>

      {/* Fila Inferior: TDC Crédito y Total General POS */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-3">
          <span className="block text-xs font-semibold text-[#64748B]">
            Total TDC Crédito ({pos.subtotalCredito.count})
          </span>
          <span className="block text-sm font-extrabold text-[#0F172A] mt-0.5">
            {formatVES(pos.subtotalCredito.totalVES)}
          </span>
          <span className="block text-xs font-semibold text-[#10B981]">
            {formatUSD(pos.subtotalCredito.totalUSD)}
          </span>
        </div>

        <div className="rounded-2xl bg-[#EEF2FF] border border-indigo-100 p-3">
          <span className="block text-xs font-bold text-[#4F46E5]">
            Total General POS ({pos.totalGeneralPOS.count})
          </span>
          <span className="block text-sm font-extrabold text-[#0F172A] mt-0.5">
            {formatVES(pos.totalGeneralPOS.totalVES)}
          </span>
          <span className="block text-xs font-bold text-[#10B981]">
            {formatUSD(pos.totalGeneralPOS.totalUSD)}
          </span>
        </div>
      </div>
    </div>
  );
};
