import React from 'react';
import {
  Banknote,
  ChevronRight,
  CreditCard,
  FileText,
  Fingerprint,
  Landmark,
  Send,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { MovimientosPillTab, SessionCalculatedTotals } from '../types/cash';
import { formatUSD, formatVES, round2 } from '../utils/cashEngine';
import { DonutChartCard } from './DonutChartCard';

interface HomeViewProps {
  exchangeRate: number;
  totals: SessionCalculatedTotals;
  onNavigateToCategory: (pill: MovimientosPillTab) => void;
  onNavigateToCierre: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  exchangeRate,
  totals,
  onNavigateToCategory,
  onNavigateToCierre,
}) => {
  const efectivoCount =
    totals.byCategory.EFECTIVO_BS.count + totals.byCategory.EFECTIVO_USD.count;
  const efectivoTotalUSD = round2(
    totals.byCategory.EFECTIVO_BS.totalUSD + totals.byCategory.EFECTIVO_USD.totalUSD
  );
  const efectivoTotalVES = round2(
    totals.byCategory.EFECTIVO_BS.totalVES + totals.byCategory.EFECTIVO_USD.totalVES
  );

  const accountRows = [
    {
      id: 'pago-movil',
      title: 'Pago Móvil',
      subtitle: `${totals.byCategory.PAGO_MOVIL.count} anotados`,
      usd: totals.byCategory.PAGO_MOVIL.totalUSD,
      ves: totals.byCategory.PAGO_MOVIL.totalVES,
      circleBg: 'bg-[#DBEAFE]',
      iconColor: 'text-[#2563EB]',
      icon: Smartphone,
      pill: 'PAGO_MOVIL' as MovimientosPillTab,
      isCredit: false,
    },
    {
      id: 'punto-venta',
      title: 'Punto de Venta',
      subtitle: `Débito+MC: ${formatVES(totals.pos.subtotalDebitoConsolidado.totalVES)} · TDC: ${formatVES(
        totals.pos.subtotalCredito.totalVES
      )}`,
      usd: totals.pos.totalGeneralPOS.totalUSD,
      ves: totals.pos.totalGeneralPOS.totalVES,
      circleBg: 'bg-[#EDE9FE]',
      iconColor: 'text-[#7C3AED]',
      icon: CreditCard,
      pill: 'POS' as MovimientosPillTab,
      isCredit: false,
    },
    {
      id: 'zelle',
      title: 'Zelle ($ USD)',
      subtitle: `${totals.byCategory.ZELLE.count} anotados`,
      usd: totals.byCategory.ZELLE.totalUSD,
      ves: totals.byCategory.ZELLE.totalVES,
      circleBg: 'bg-[#D1FAE5]',
      iconColor: 'text-[#059669]',
      icon: Send,
      pill: 'ZELLE' as MovimientosPillTab,
      isCredit: false,
    },
    {
      id: 'transferencias',
      title: 'Transferencias',
      subtitle: `${totals.byCategory.TRANSFERENCIA.count} anotadas`,
      usd: totals.byCategory.TRANSFERENCIA.totalUSD,
      ves: totals.byCategory.TRANSFERENCIA.totalVES,
      circleBg: 'bg-[#CCFBF1]',
      iconColor: 'text-[#0D9488]',
      icon: Landmark,
      pill: 'TRANSFERENCIA' as MovimientosPillTab,
      isCredit: false,
    },
    {
      id: 'biopago',
      title: 'Biopago',
      subtitle: `${totals.byCategory.BIOPAGO.count} anotados`,
      usd: totals.byCategory.BIOPAGO.totalUSD,
      ves: totals.byCategory.BIOPAGO.totalVES,
      circleBg: 'bg-[#CCFBF1]',
      iconColor: 'text-[#0D9488]',
      icon: Fingerprint,
      pill: 'BIOPAGO' as MovimientosPillTab,
      isCredit: false,
    },
    {
      id: 'efectivo',
      title: 'Efectivo (Bs y $)',
      subtitle: `${efectivoCount} registros`,
      usd: efectivoTotalUSD,
      ves: efectivoTotalVES,
      circleBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
      icon: Banknote,
      pill: 'EFECTIVO' as MovimientosPillTab,
      isCredit: false,
    },
    {
      id: 'facturas-credito',
      title: 'Facturas a Crédito',
      subtitle: `${totals.countCuentasPorCobrar} por cobrar (fuera de caja)`,
      usd: totals.totalCuentasPorCobrarUSD,
      ves: totals.totalCuentasPorCobrarVES,
      circleBg: 'bg-[#FFE4E6]',
      iconColor: 'text-[#E11D48]',
      icon: FileText,
      pill: 'CREDITOS' as MovimientosPillTab,
      isCredit: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. HERO CARD PRINCIPAL: Balance / Total Recibido en Caja */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#60A5FA] via-[#6366F1] to-[#8B5CF6] p-5 sm:p-6 text-white shadow-[0_14px_34px_rgba(99,102,241,0.28)]">
        <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/15 blur-2xl" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-white/85">
              Total Recibido en Caja
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
              {formatUSD(totals.totalRecibidoCajaUSD)}
            </div>
            <div className="text-base font-semibold text-white/95 mt-0.5">
              {formatVES(totals.totalRecibidoCajaVES)}
            </div>
            <span className="inline-block mt-2.5 text-[11px] font-medium text-white/80">
              Tasa: Bs. {exchangeRate > 0 ? exchangeRate.toFixed(2) : '0.00'} ·{' '}
              {totals.totalOperacionesCaja} operaciones
            </span>
          </div>

          {/* Botón cuadrado redondeado a la derecha con ícono de billetera */}
          <button
            type="button"
            onClick={onNavigateToCierre}
            className="w-13 h-13 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 active:scale-95 transition-all cursor-pointer"
            title="Ir a Cierre de Caja"
          >
            <Wallet className="w-6 h-6 text-white" />
          </button>
        </div>

        {totals.countCuentasPorCobrar > 0 && (
          <div className="relative z-10 mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="text-white/90">
              Por cobrar ({totals.countCuentasPorCobrar} créd.):{' '}
              <strong>{formatUSD(totals.totalCuentasPorCobrarUSD)}</strong>
            </span>
            <span className="font-bold">
              Total Día: {formatUSD(totals.granTotalVentaDiaUSD)}
            </span>
          </div>
        )}
      </div>

      {/* 2. SECCIÓN "CATEGORÍAS" (Lista limpia, 1 toque para ir a anotar) */}
      <div className="fintech-card rounded-3xl p-4">
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-sm font-bold text-[#0F172A]">Categorías</h2>
          <span className="text-xs text-[#64748B]">Toca para anotar</span>
        </div>

        <div className="divide-y divide-slate-100">
          {accountRows.map((row) => {
            const Icon = row.icon;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onNavigateToCategory(row.pill)}
                className="w-full py-3 px-1 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-2xl transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full ${row.circleBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${row.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-bold text-[#0F172A] truncate">
                      {row.title}
                    </span>
                    <span className="block text-xs text-[#64748B] truncate">
                      {row.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`block text-sm font-bold ${
                        row.isCredit ? 'text-[#F97316]' : 'text-[#10B981]'
                      }`}
                    >
                      {formatUSD(row.usd)}
                    </span>
                    <span className="block text-xs font-medium text-[#64748B]">
                      {formatVES(row.ves)}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#4F46E5] transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GRÁFICO DONA "DISTRIBUCIÓN DEL DÍA" */}
      <DonutChartCard totals={totals} />
    </div>
  );
};
