import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CloudDownload,
  FileCheck2,
  Home,
  ListOrdered,
  Plus,
} from 'lucide-react';
import {
  CashSession,
  CashTransaction,
  Currency,
  MainScreenView,
  MovimientosPillTab,
  TransactionCategory,
} from './types/cash';
import {
  archiveAndResetSession,
  calculateDualAmounts,
  calculateSessionTotals,
  loadActiveSession,
  loadClosedHistory,
  recalculateSessionWithNewRate,
  saveActiveSession,
  STORAGE_KEY_CLOSED_HISTORY,
} from './utils/cashEngine';
import {
  applyAppUpdate,
  checkForAppUpdate,
  RemoteVersionManifest,
} from './utils/updater';
import { StickyHeader } from './components/StickyHeader';
import { HomeView } from './components/HomeView';
import { MovimientosView } from './components/MovimientosView';
import { DesgloseView } from './components/DesgloseView';
import { CierreView } from './components/CierreView';
import { ExchangeRateModal } from './components/ExchangeRateModal';
import { ClosureModal } from './components/ClosureModal';
import { QuickAddModal } from './components/QuickAddModal';
import { SplashScreenAnimation } from './components/SplashScreenAnimation';

export function App() {
  const [session, setSession] = useState<CashSession>(() => loadActiveSession());
  const [closedHistory, setClosedHistory] = useState<CashSession[]>(() => loadClosedHistory());
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const [activeScreen, setActiveScreen] = useState<MainScreenView>('INICIO');
  const [activePill, setActivePill] = useState<MovimientosPillTab>('PAGO_MOVIL');

  const [isRateModalOpen, setIsRateModalOpen] = useState<boolean>(
    () => loadActiveSession().exchangeRate <= 0
  );
  const [isClosureModalOpen, setIsClosureModalOpen] = useState<boolean>(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState<boolean>(false);
  const [availableUpdate, setAvailableUpdate] = useState<RemoteVersionManifest | null>(null);

  // Persistencia 100% Local en cada cambio bajo la clave cash_session_v1
  useEffect(() => {
    saveActiveSession(session);
  }, [session]);

  // Apertura obligatoria si exchangeRate <= 0
  useEffect(() => {
    if (session.exchangeRate <= 0) {
      setIsRateModalOpen(true);
    }
  }, [session.exchangeRate]);

  // Verificación silenciosa de actualizaciones remotas al iniciar o recuperar conexión
  useEffect(() => {
    const runSilentCheck = async () => {
      const res = await checkForAppUpdate();
      if (res.hasUpdate && res.manifest) {
        setAvailableUpdate(res.manifest);
      }
    };

    const timer = setTimeout(runSilentCheck, 1800);
    window.addEventListener('online', runSilentCheck);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', runSilentCheck);
    };
  }, []);

  const totals = useMemo(() => calculateSessionTotals(session), [session]);

  const handleSaveExchangeRate = (newRate: number, cashierName?: string) => {
    setSession((prev) => {
      const recalculated = recalculateSessionWithNewRate(prev, newRate);
      return {
        ...recalculated,
        cashierName: cashierName || prev.cashierName || 'Jornada Activa',
      };
    });
    setIsRateModalOpen(false);
  };

  const handleAddTransaction = (payload: {
    category: TransactionCategory;
    inputCurrency: Currency;
    rawAmount: number;
    note?: string;
    clientName?: string;
    invoiceNumber?: string;
  }) => {
    if (session.exchangeRate <= 0) {
      setIsRateModalOpen(true);
      return;
    }

    const { amountVES, amountUSD } = calculateDualAmounts(
      payload.rawAmount,
      payload.inputCurrency,
      session.exchangeRate
    );

    const newTx: CashTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      category: payload.category,
      inputCurrency: payload.inputCurrency,
      amountVES,
      amountUSD,
      note: payload.note,
      clientName: payload.clientName,
      invoiceNumber: payload.invoiceNumber,
    };

    setSession((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      transactions: [...prev.transactions, newTx],
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    setSession((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }));
  };

  const handleResetSession = (keepRate: boolean) => {
    const { newSession, history } = archiveAndResetSession(session, keepRate);
    setSession(newSession);
    setClosedHistory(history);
    if (newSession.exchangeRate <= 0) {
      setIsRateModalOpen(true);
    }
  };

  const handleRestoreBackup = (
    restoredSession: CashSession,
    restoredHistory: CashSession[]
  ) => {
    setSession(restoredSession);
    setClosedHistory(restoredHistory);
    saveActiveSession(restoredSession);
    try {
      localStorage.setItem(STORAGE_KEY_CLOSED_HISTORY, JSON.stringify(restoredHistory));
    } catch {
      // Ignore storage error
    }
  };

  const handleNavigateToCategoryPill = (pill: MovimientosPillTab) => {
    setActivePill(pill);
    setActiveScreen('MOVIMIENTOS');
  };

  return (
    <div className="relative min-h-screen bg-[#F4F6FB] text-[#0F172A] pb-28 overflow-x-hidden">
      {/* Halo difuminado suave (Mesh Gradients sutiles) */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-72 z-0 overflow-hidden">
        <div className="absolute -top-16 left-4 w-64 h-64 rounded-full bg-[#BAE6FD]/55 blur-3xl" />
        <div className="absolute -top-10 right-4 w-64 h-64 rounded-full bg-[#DDD6FE]/65 blur-3xl" />
      </div>

      {/* Cabecera Superior */}
      <StickyHeader
        exchangeRate={session.exchangeRate}
        cashierName={session.cashierName}
        onOpenRateModal={() => setIsRateModalOpen(true)}
      />

      {/* Aviso Flotante si hay una nueva versión remota disponible */}
      {availableUpdate && (
        <div className="relative z-20 max-w-lg mx-auto px-4 pt-2.5">
          <button
            type="button"
            onClick={() => applyAppUpdate(availableUpdate)}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <CloudDownload className="w-4 h-4 shrink-0" />
              <span>Nueva actualización disponible (v{availableUpdate.version})</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-extrabold">
              Actualizar
            </span>
          </button>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="relative z-10 max-w-lg mx-auto px-4 pt-3">
        {activeScreen === 'INICIO' && (
          <HomeView
            exchangeRate={session.exchangeRate}
            totals={totals}
            onNavigateToCategory={handleNavigateToCategoryPill}
            onNavigateToCierre={() => setActiveScreen('CIERRE')}
          />
        )}

        {activeScreen === 'MOVIMIENTOS' && (
          <MovimientosView
            activePill={activePill}
            onSelectPill={setActivePill}
            exchangeRate={session.exchangeRate}
            transactions={session.transactions}
            posConsolidation={totals.pos}
            totals={totals}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onRequireRate={() => setIsRateModalOpen(true)}
          />
        )}

        {activeScreen === 'DESGLOSE' && (
          <DesgloseView
            totals={totals}
            onSelectCategoryPill={handleNavigateToCategoryPill}
            onOpenClosureModal={() => setIsClosureModalOpen(true)}
          />
        )}

        {activeScreen === 'CIERRE' && (
          <CierreView
            session={session}
            totals={totals}
            closedHistory={closedHistory}
            onOpenRateModal={() => setIsRateModalOpen(true)}
            onResetSession={handleResetSession}
            onRestoreBackup={handleRestoreBackup}
            availableUpdate={availableUpdate}
            onUpdateFound={setAvailableUpdate}
          />
        )}
      </main>

      {/* Barra de Navegación Inferior Fija con Botón Central Flotante (+ FAB) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-lg rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.05)] border-t border-white">
        <div className="max-w-lg mx-auto px-6 py-2.5 grid grid-cols-5 items-center">
          <button
            type="button"
            onClick={() => setActiveScreen('INICIO')}
            className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
              activeScreen === 'INICIO'
                ? 'text-[#5B4EFF] font-extrabold'
                : 'text-[#64748B] hover:text-[#0F172A] font-medium'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px]">Inicio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScreen('MOVIMIENTOS')}
            className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
              activeScreen === 'MOVIMIENTOS'
                ? 'text-[#5B4EFF] font-extrabold'
                : 'text-[#64748B] hover:text-[#0F172A] font-medium'
            }`}
          >
            <ListOrdered className="w-5 h-5" />
            <span className="text-[11px]">Movimientos</span>
            {session.transactions.length > 0 && (
              <span className="absolute top-0 right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[9px] font-extrabold flex items-center justify-center">
                {session.transactions.length}
              </span>
            )}
          </button>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsQuickAddModalOpen(true)}
              className="w-14 h-14 rounded-full bg-[#5B4EFF] hover:bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/40 -mt-6 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              title="Anotar pago rápido"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveScreen('DESGLOSE')}
            className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
              activeScreen === 'DESGLOSE'
                ? 'text-[#5B4EFF] font-extrabold'
                : 'text-[#64748B] hover:text-[#0F172A] font-medium'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[11px]">Desglose</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScreen('CIERRE')}
            className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
              activeScreen === 'CIERRE'
                ? 'text-[#5B4EFF] font-extrabold'
                : 'text-[#64748B] hover:text-[#0F172A] font-medium'
            }`}
          >
            <FileCheck2 className="w-5 h-5" />
            <span className="text-[11px]">Cierre / Tasa</span>
            {availableUpdate && (
              <span className="absolute top-0.5 right-3 w-2.5 h-2.5 rounded-full bg-[#5B4EFF] ring-2 ring-white" />
            )}
          </button>
        </div>
      </nav>

      {/* Modal Rápido Universal (Botón Central +) */}
      <QuickAddModal
        isOpen={isQuickAddModalOpen}
        exchangeRate={session.exchangeRate}
        onClose={() => setIsQuickAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        onRequireRate={() => {
          setIsQuickAddModalOpen(false);
          setIsRateModalOpen(true);
        }}
      />

      {/* Modal de Apertura / Edición de Tasa */}
      <ExchangeRateModal
        isOpen={isRateModalOpen}
        currentRate={session.exchangeRate}
        transactionCount={session.transactions.length}
        onSaveRate={handleSaveExchangeRate}
        onClose={() => setIsRateModalOpen(false)}
        currentCashier={session.cashierName}
      />

      {/* Modal de Exportación de Cierre */}
      <ClosureModal
        isOpen={isClosureModalOpen}
        session={session}
        totals={totals}
        onClose={() => setIsClosureModalOpen(false)}
      />

      {/* Animación de apertura al iniciar la app */}
      {showSplash && (
        <SplashScreenAnimation onFinish={() => setShowSplash(false)} />
      )}
    </div>
  );
}

export default App;
