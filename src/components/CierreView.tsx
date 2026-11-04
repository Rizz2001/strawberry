import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Edit3,
  FileDown,
  History,
  RefreshCw,
  RotateCcw,
  Share2,
} from 'lucide-react';
import { CashSession, SessionCalculatedTotals } from '../types/cash';
import {
  calculateSessionTotals,
  formatUSD,
  formatVES,
} from '../utils/cashEngine';
import {
  downloadClosurePdf,
  generateWhatsAppSummaryText,
  shareClosureReport,
} from '../utils/pdfExporter';

interface CierreViewProps {
  session: CashSession;
  totals: SessionCalculatedTotals;
  closedHistory: CashSession[];
  onOpenRateModal: () => void;
  onResetSession: (keepRate: boolean) => void;
}

export const CierreView: React.FC<CierreViewProps> = ({
  session,
  totals,
  closedHistory,
  onOpenRateModal,
  onResetSession,
}) => {
  const [feedback, setFeedback] = useState<string>('');
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [keepRateOnReset, setKeepRateOnReset] = useState<boolean>(true);

  const handleDownloadPdf = () => {
    const fileName = downloadClosurePdf(session, totals);
    setFeedback(`Documento PDF generado: ${fileName}`);
  };

  const handleShare = async () => {
    const res = await shareClosureReport(session, totals);
    setFeedback(res.message);
  };

  const handleCopyText = async () => {
    const text = generateWhatsAppSummaryText(session, totals);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setFeedback('Resumen copiado al portapapeles (listo para WhatsApp).');
    }
  };

  const handleConfirmReset = () => {
    onResetSession(keepRateOnReset);
    setResetStep(0);
    setFeedback('Jornada reiniciada y guardada en el historial local.');
  };

  return (
    <div className="space-y-4">
      {/* Tarjeta de Configuración de Tasa del Día */}
      <div className="fintech-card rounded-3xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <RefreshCw className="w-6 h-6 text-[#4F46E5]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Tasa de Cambio Activa
            </span>
            <div className="text-xl font-extrabold text-[#0F172A]">
              {formatVES(session.exchangeRate)} <span className="text-xs font-medium text-[#64748B]">/ $1 USD</span>
            </div>
            <p className="text-xs text-[#64748B]">
              Al editarla se recalculan los {session.transactions.length} cobros del día
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenRateModal}
          className="px-4 py-2.5 rounded-2xl bg-[#5B4EFF] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Cambiar Tasa</span>
        </button>
      </div>

      {/* Resumen de Arqueo Final antes de Exportar */}
      <div className="fintech-card rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">
          Resumen Oficial de Cierre de Caja
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F0FDF4] border border-emerald-100 p-4">
            <span className="block text-xs font-bold text-[#059669]">
              Total Dinero Recibido en Caja ({totals.totalOperacionesCaja} op.)
            </span>
            <span className="block text-2xl font-extrabold text-[#10B981] mt-1">
              {formatUSD(totals.totalRecibidoCajaUSD)}
            </span>
            <span className="block text-sm font-bold text-[#0F172A]">
              {formatVES(totals.totalRecibidoCajaVES)}
            </span>
          </div>

          <div className="rounded-2xl bg-[#FFF7ED] border border-orange-100 p-4">
            <span className="block text-xs font-bold text-[#EA580C]">
              Total Cuentas por Cobrar ({totals.countCuentasPorCobrar} fact.)
            </span>
            <span className="block text-2xl font-extrabold text-[#F97316] mt-1">
              {formatUSD(totals.totalCuentasPorCobrarUSD)}
            </span>
            <span className="block text-sm font-bold text-[#0F172A]">
              {formatVES(totals.totalCuentasPorCobrarVES)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between font-semibold text-[#0F172A]">
            <span>POS Débito Consolidado (Débito + MasterCard):</span>
            <span className="text-[#4F46E5]">
              {formatVES(totals.pos.subtotalDebitoConsolidado.totalVES)} (
              {formatUSD(totals.pos.subtotalDebitoConsolidado.totalUSD)})
            </span>
          </div>
          <div className="flex justify-between text-[#64748B] pl-2">
            <span>↳ Débito ({totals.pos.debitoNormal.count}) + MasterCard ({totals.pos.mastercard.count})</span>
            <span>
              {formatVES(totals.pos.debitoNormal.totalVES)} + {formatVES(totals.pos.mastercard.totalVES)}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-[#0F172A]">
            <span>POS TDC Crédito ({totals.pos.subtotalCredito.count}):</span>
            <span className="text-[#4F46E5]">
              {formatVES(totals.pos.subtotalCredito.totalVES)} (
              {formatUSD(totals.pos.subtotalCredito.totalUSD)})
            </span>
          </div>
          <div className="flex justify-between font-extrabold text-[#0F172A] pt-2 border-t border-slate-200">
            <span>GRAN TOTAL VENTA DEL DÍA (CAJA + CRÉDITO):</span>
            <span className="text-[#10B981]">
              {formatUSD(totals.granTotalVentaDiaUSD)} · {formatVES(totals.granTotalVentaDiaVES)}
            </span>
          </div>
        </div>

        {feedback && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Botones de Exportación */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="w-full rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold py-4 px-5 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2.5 active:scale-98 transition-all cursor-pointer"
          >
            <FileDown className="w-5 h-5" />
            <span>Extraer Reporte PDF Completo</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleShare}
              className="py-3 px-4 rounded-2xl bg-[#EEF2FF] hover:bg-indigo-100 text-[#4F46E5] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir Resumen</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar para WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reiniciar Jornada con Doble Confirmación */}
      <div className="fintech-card rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Nueva Jornada / Reiniciar Caja</h3>
            <p className="text-xs text-[#64748B]">
              Archiva el cierre actual en el historial y limpia los contadores
            </p>
          </div>
          {resetStep === 0 && (
            <button
              type="button"
              onClick={() => setResetStep(1)}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          )}
        </div>

        {resetStep === 1 && (
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-3">
            <div className="flex items-start gap-2 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Confirmación 1/2:</strong> ¿Ya descargaste el PDF del cierre? Los datos se
                guardarán en el historial local antes de reiniciar.
              </span>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#0F172A] cursor-pointer">
              <input
                type="checkbox"
                checked={keepRateOnReset}
                onChange={(e) => setKeepRateOnReset(e.target.checked)}
                className="rounded text-[#4F46E5]"
              />
              <span>Conservar la tasa actual (Bs. {session.exchangeRate.toFixed(2)})</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setResetStep(2)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer"
              >
                Continuar al Paso 2
              </button>
              <button
                type="button"
                onClick={() => setResetStep(0)}
                className="px-4 py-2.5 rounded-xl bg-white text-[#64748B] font-bold text-xs border border-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {resetStep === 2 && (
          <div className="p-4 rounded-2xl bg-rose-100 border-2 border-rose-400 space-y-3">
            <p className="text-xs font-extrabold text-rose-900 text-center">
              ⚠️ CONFIRMACIÓN FINAL (2/2): Se archivará esta sesión y se abrirá una caja nueva en
              cero.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                SÍ, REINICIAR JORNADA AHORA
              </button>
              <button
                type="button"
                onClick={() => setResetStep(0)}
                className="px-4 py-2.5 rounded-xl bg-white text-[#0F172A] font-bold text-xs cursor-pointer"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Historial de Cierres Anteriores */}
      {closedHistory.length > 0 && (
        <div className="fintech-card rounded-3xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <History className="w-4 h-4 text-[#4F46E5]" />
            <span>Historial de Cierres Guardados ({closedHistory.length})</span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {closedHistory.map((past) => {
              const pastTotals = calculateSessionTotals(past);
              return (
                <div
                  key={past.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 text-xs"
                >
                  <div>
                    <span className="font-bold text-[#0F172A] block">
                      {new Date(past.closedAt || past.updatedAt).toLocaleString('es-VE', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · Tasa Bs. {past.exchangeRate.toFixed(2)}
                    </span>
                    <span className="text-[#10B981] font-bold">
                      En Caja: {formatUSD(pastTotals.totalRecibidoCajaUSD)} (
                      {formatVES(pastTotals.totalRecibidoCajaVES)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadClosurePdf(past, pastTotals)}
                    className="px-3 py-1.5 rounded-xl bg-[#EEF2FF] text-[#4F46E5] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

