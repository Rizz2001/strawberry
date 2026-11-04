import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  FileDown,
  Share2,
  X,
} from 'lucide-react';
import { CashSession, SessionCalculatedTotals } from '../types/cash';
import { formatUSD, formatVES } from '../utils/cashEngine';
import {
  downloadClosurePdf,
  generateWhatsAppSummaryText,
  shareClosureReport,
} from '../utils/pdfExporter';
import { StrawchellLogo } from './StrawchellLogo';

interface ClosureModalProps {
  isOpen: boolean;
  session: CashSession;
  totals: SessionCalculatedTotals;
  onClose: () => void;
}

export const ClosureModal: React.FC<ClosureModalProps> = ({
  isOpen,
  session,
  totals,
  onClose,
}) => {
  const [feedback, setFeedback] = useState<string>('');

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    const fileName = downloadClosurePdf(session, totals);
    setFeedback(`PDF descargado: ${fileName}`);
  };

  const handleShareOrCopy = async () => {
    const result = await shareClosureReport(session, totals);
    setFeedback(result.message);
  };

  const handleCopyTextDirect = async () => {
    const text = generateWhatsAppSummaryText(session, totals);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setFeedback('Resumen copiado al portapapeles listo para pegar en WhatsApp.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-md p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white border border-white rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)] max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <StrawchellLogo className="w-7 h-7 shrink-0" showText={false} />
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">
                strawchell · Exportar Cierre de Caja
              </h2>
              <p className="text-xs text-[#64748B]">
                Tasa aplicada: <strong className="text-[#4F46E5]">{formatVES(session.exchangeRate)} / $1</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-3.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#059669]">
              Total en Caja ({totals.totalOperacionesCaja} op.)
            </span>
            <span className="block text-xl font-extrabold text-[#10B981] mt-0.5">
              {formatUSD(totals.totalRecibidoCajaUSD)}
            </span>
            <span className="block text-xs font-bold text-[#0F172A]">
              {formatVES(totals.totalRecibidoCajaVES)}
            </span>
          </div>

          <div className="bg-[#FFF7ED] border border-orange-100 rounded-2xl p-3.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#EA580C]">
              Por Cobrar ({totals.countCuentasPorCobrar} fact.)
            </span>
            <span className="block text-xl font-extrabold text-[#F97316] mt-0.5">
              {formatUSD(totals.totalCuentasPorCobrarUSD)}
            </span>
            <span className="block text-xs font-bold text-[#0F172A]">
              {formatVES(totals.totalCuentasPorCobrarVES)}
            </span>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between font-bold text-[#0F172A]">
            <span>POS Débito Consolidado (Débito + MasterCard):</span>
            <span className="text-[#4F46E5]">
              {formatVES(totals.pos.subtotalDebitoConsolidado.totalVES)} (
              {formatUSD(totals.pos.subtotalDebitoConsolidado.totalUSD)})
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-[#64748B] pl-2">
            <span>↳ Débito ({totals.pos.debitoNormal.count}) + MasterCard ({totals.pos.mastercard.count}):</span>
            <span>
              {formatVES(totals.pos.debitoNormal.totalVES)} + {formatVES(totals.pos.mastercard.totalVES)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-[#0F172A]">
            <span>POS TDC Crédito ({totals.pos.subtotalCredito.count}):</span>
            <span className="text-[#4F46E5]">
              {formatVES(totals.pos.subtotalCredito.totalVES)} (
              {formatUSD(totals.pos.subtotalCredito.totalUSD)})
            </span>
          </div>
          <div className="flex justify-between font-extrabold text-[#0F172A] pt-1.5 border-t border-slate-200">
            <span>GRAN TOTAL VENTA DEL DÍA:</span>
            <span className="text-[#10B981]">
              {formatUSD(totals.granTotalVentaDiaUSD)} · {formatVES(totals.granTotalVentaDiaVES)}
            </span>
          </div>
        </div>

        {feedback && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-bold text-sm shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <FileDown className="w-5 h-5" />
            <span>Descargar Reporte PDF Completo</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleShareOrCopy}
              className="py-3 px-3 rounded-2xl bg-[#EEF2FF] hover:bg-indigo-100 text-[#4F46E5] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir Cierre</span>
            </button>

            <button
              type="button"
              onClick={handleCopyTextDirect}
              className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar Resumen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
