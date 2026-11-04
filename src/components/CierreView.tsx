import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CloudDownload,
  Copy,
  Download,
  Edit3,
  FileDown,
  History,
  RefreshCw,
  RotateCcw,
  Settings2,
  Share2,
  Upload,
} from 'lucide-react';
import { CashSession, SessionCalculatedTotals } from '../types/cash';
import {
  calculateSessionTotals,
  downloadFullBackup,
  formatUSD,
  formatVES,
} from '../utils/cashEngine';
import {
  downloadClosurePdf,
  generateWhatsAppSummaryText,
  shareClosureReport,
} from '../utils/pdfExporter';
import {
  APP_VERSION,
  applyAppUpdate,
  checkForAppUpdate,
  getUpdateManifestUrl,
  RemoteVersionManifest,
  setUpdateManifestUrl,
} from '../utils/updater';

interface CierreViewProps {
  session: CashSession;
  totals: SessionCalculatedTotals;
  closedHistory: CashSession[];
  onOpenRateModal: () => void;
  onResetSession: (keepRate: boolean) => void;
  onRestoreBackup: (restoredSession: CashSession, restoredHistory: CashSession[]) => void;
  availableUpdate?: RemoteVersionManifest | null;
  onUpdateFound: (manifest: RemoteVersionManifest | null) => void;
}

export const CierreView: React.FC<CierreViewProps> = ({
  session,
  totals,
  closedHistory,
  onOpenRateModal,
  onResetSession,
  onRestoreBackup,
  availableUpdate,
  onUpdateFound,
}) => {
  const [feedback, setFeedback] = useState<string>('');
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [keepRateOnReset, setKeepRateOnReset] = useState<boolean>(true);

  // Estado del verificador de actualizaciones
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateStatusMsg, setUpdateStatusMsg] = useState<string>('');
  const [showUrlConfig, setShowUrlConfig] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>(() => getUpdateManifestUrl());

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCheckUpdateNow = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatusMsg('Buscando actualizaciones...');
    const result = await checkForAppUpdate();
    setIsCheckingUpdate(false);

    if (result.error) {
      setUpdateStatusMsg(result.error);
      return;
    }

    if (result.hasUpdate && result.manifest) {
      onUpdateFound(result.manifest);
      setUpdateStatusMsg(`¡Nueva versión v${result.latestVersion} disponible!`);
    } else {
      onUpdateFound(null);
      setUpdateStatusMsg(`Ya tienes la última versión instalada (v${APP_VERSION}).`);
    }
  };

  const handleSaveUpdateUrl = () => {
    setUpdateManifestUrl(customUrlInput);
    setShowUrlConfig(false);
    setUpdateStatusMsg('Canal de actualizaciones guardado.');
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed?.activeSession && Array.isArray(parsed.activeSession.transactions)) {
          onRestoreBackup(
            parsed.activeSession,
            Array.isArray(parsed.closedHistory) ? parsed.closedHistory : closedHistory
          );
          setFeedback('Respaldo restaurado correctamente.');
        } else {
          setFeedback('El archivo seleccionado no es un respaldo válido.');
        }
      } catch {
        setFeedback('Error al leer el archivo de respaldo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* 1. Tarjeta de Configuración de Tasa del Día */}
      <div className="fintech-card rounded-3xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-[#4F46E5]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Tasa del Día
            </span>
            <div className="text-xl font-extrabold text-[#0F172A]">
              {formatVES(session.exchangeRate)}{' '}
              <span className="text-xs font-medium text-[#64748B]">/ $1</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenRateModal}
          className="px-4 py-2.5 rounded-2xl bg-[#5B4EFF] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Cambiar</span>
        </button>
      </div>

      {/* 2. Resumen de Cierre y Descarga PDF */}
      <div className="fintech-card rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Cierre de Caja Diario</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F0FDF4] border border-emerald-100 p-3.5">
            <span className="block text-[11px] font-bold text-[#059669]">
              En Caja ({totals.totalOperacionesCaja})
            </span>
            <span className="block text-xl font-extrabold text-[#10B981] mt-0.5">
              {formatUSD(totals.totalRecibidoCajaUSD)}
            </span>
            <span className="block text-xs font-semibold text-[#0F172A]">
              {formatVES(totals.totalRecibidoCajaVES)}
            </span>
          </div>

          <div className="rounded-2xl bg-[#FFF7ED] border border-orange-100 p-3.5">
            <span className="block text-[11px] font-bold text-[#EA580C]">
              Crédito ({totals.countCuentasPorCobrar})
            </span>
            <span className="block text-xl font-extrabold text-[#F97316] mt-0.5">
              {formatUSD(totals.totalCuentasPorCobrarUSD)}
            </span>
            <span className="block text-xs font-semibold text-[#0F172A]">
              {formatVES(totals.totalCuentasPorCobrarVES)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between font-semibold text-[#0F172A]">
            <span>POS Débito + MasterCard:</span>
            <span className="text-[#4F46E5]">
              {formatVES(totals.pos.subtotalDebitoConsolidado.totalVES)} (
              {formatUSD(totals.pos.subtotalDebitoConsolidado.totalUSD)})
            </span>
          </div>
          <div className="flex justify-between font-semibold text-[#0F172A]">
            <span>POS TDC Crédito:</span>
            <span className="text-[#4F46E5]">
              {formatVES(totals.pos.subtotalCredito.totalVES)} (
              {formatUSD(totals.pos.subtotalCredito.totalUSD)})
            </span>
          </div>
          <div className="flex justify-between font-extrabold text-[#0F172A] pt-2 border-t border-slate-200">
            <span>VENTA TOTAL DEL DÍA:</span>
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

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="w-full rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold py-4 px-5 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer"
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
              <span>Compartir</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Actualizaciones Remotas (OTA / APK) y Respaldo Seguro */}
      <div className="fintech-card rounded-3xl p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center">
              <CloudDownload className="w-4 h-4 text-[#4F46E5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Actualizaciones de la App
              </h3>
              <p className="text-xs text-[#64748B]">
                Versión instalada: <strong>v{APP_VERSION}</strong> (Conserva tus datos)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUrlConfig(!showUrlConfig)}
            className="p-2 rounded-full bg-slate-100 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            title="Configurar servidor de actualización"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {availableUpdate && (
          <div className="p-3.5 rounded-2xl bg-[#EEF2FF] border border-indigo-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#4F46E5]">
                ✨ Nueva versión v{availableUpdate.version} lista
              </span>
              {availableUpdate.publishedAt && (
                <span className="text-[11px] text-[#64748B]">{availableUpdate.publishedAt}</span>
              )}
            </div>
            {availableUpdate.notes && (
              <p className="text-xs text-[#0F172A]">{availableUpdate.notes}</p>
            )}
            <button
              type="button"
              onClick={() => applyAppUpdate(availableUpdate)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#5B4EFF] hover:bg-[#4F46E5] text-white font-bold text-xs shadow-md shadow-indigo-500/25 cursor-pointer"
            >
              Descargar e Instalar Actualización Ahora
            </button>
          </div>
        )}

        {showUrlConfig && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-[11px] font-bold text-[#64748B]">
              URL del archivo version.json (GitHub / Servidor)
            </label>
            <input
              type="url"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="https://raw.githubusercontent.com/.../version.json"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#5B4EFF]"
            />
            <button
              type="button"
              onClick={handleSaveUpdateUrl}
              className="px-3 py-1.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold cursor-pointer"
            >
              Guardar URL
            </button>
          </div>
        )}

        {updateStatusMsg && (
          <p className="text-xs font-medium text-[#4F46E5] bg-[#F8FAFC] px-3 py-2 rounded-xl border border-slate-100">
            {updateStatusMsg}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleCheckUpdateNow}
            disabled={isCheckingUpdate}
            className="py-2.5 px-3 rounded-2xl bg-[#EEF2FF] hover:bg-indigo-100 text-[#4F46E5] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            <span>Buscar Update</span>
          </button>

          <button
            type="button"
            onClick={() => downloadFullBackup(session, closedHistory)}
            className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Respaldar</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restaurar</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileRestore}
            className="hidden"
          />
        </div>
      </div>

      {/* 4. Reiniciar Jornada con Doble Confirmación */}
      <div className="fintech-card rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Nueva Jornada / Reiniciar Caja</h3>
            <p className="text-xs text-[#64748B]">
              Archiva el día actual y deja la caja en cero
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
                <strong>Confirmación 1/2:</strong> Asegúrate de haber descargado el PDF antes de
                limpiar el día.
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
                Continuar
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
              ⚠️ CONFIRMACIÓN FINAL (2/2): Se archivará esta sesión y los contadores volverán a
              cero.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                SÍ, REINICIAR AHORA
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

      {/* 5. Historial de Cierres Anteriores */}
      {closedHistory.length > 0 && (
        <div className="fintech-card rounded-3xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <History className="w-4 h-4 text-[#4F46E5]" />
            <span>Historial de Cierres ({closedHistory.length})</span>
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                      Caja: {formatUSD(pastTotals.totalRecibidoCajaUSD)} (
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
