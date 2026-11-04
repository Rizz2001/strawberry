import React, { useState } from 'react';
import { CheckCircle2, Plus, X } from 'lucide-react';
import { Currency, MovimientosPillTab, TransactionCategory } from '../types/cash';
import { CATEGORY_LABELS, formatUSD, formatVES } from '../utils/cashEngine';
import { QuickEntryForm } from './QuickEntryForm';

interface QuickAddModalProps {
  isOpen: boolean;
  exchangeRate: number;
  onClose: () => void;
  onAddTransaction: (payload: {
    category: TransactionCategory;
    inputCurrency: Currency;
    rawAmount: number;
    note?: string;
    clientName?: string;
    invoiceNumber?: string;
  }) => void;
  onRequireRate: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  exchangeRate,
  onClose,
  onAddTransaction,
  onRequireRate,
}) => {
  const [selectedPill, setSelectedPill] = useState<MovimientosPillTab>('PAGO_MOVIL');
  const [lastAddedToast, setLastAddedToast] = useState<string>('');

  if (!isOpen) return null;

  const pills: { id: MovimientosPillTab; label: string }[] = [
    { id: 'PAGO_MOVIL', label: 'Pago Móvil' },
    { id: 'POS', label: 'Punto Venta' },
    { id: 'ZELLE', label: 'Zelle' },
    { id: 'TRANSFERENCIA', label: 'Transferencia' },
    { id: 'BIOPAGO', label: 'Biopago' },
    { id: 'EFECTIVO', label: 'Efectivo' },
    { id: 'CREDITOS', label: 'Créditos' },
  ];

  const handleAdd = (payload: {
    category: TransactionCategory;
    inputCurrency: Currency;
    rawAmount: number;
    note?: string;
    clientName?: string;
    invoiceNumber?: string;
  }) => {
    onAddTransaction(payload);
    const amountLabel =
      payload.inputCurrency === 'USD'
        ? formatUSD(payload.rawAmount)
        : formatVES(payload.rawAmount);
    setLastAddedToast(`${CATEGORY_LABELS[payload.category]} (${amountLabel}) guardado`);
  };

  return (
    <div className="anim-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-md p-0 sm:p-4">
      <div className="anim-sheet sm:anim-modal w-full max-w-lg bg-[#F4F6FB] border border-white rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_20px_60px_rgba(15,23,42,0.22)] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#5B4EFF] text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-[#0F172A]">Anotar Pago Rápido</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setLastAddedToast('');
              onClose();
            }}
            className="p-2 rounded-full bg-white text-[#64748B] hover:text-[#0F172A] shadow-sm cursor-pointer active:scale-90 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector Tipo Píldora */}
        <div className="rounded-full bg-white p-1.5 shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
          {pills.map((pill) => {
            const active = selectedPill === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSelectedPill(pill.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  active
                    ? 'bg-[#5B4EFF] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {lastAddedToast && (
          <div className="anim-badge-pop flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lastAddedToast}</span>
          </div>
        )}

        <QuickEntryForm
          activePill={selectedPill}
          exchangeRate={exchangeRate}
          onAddTransaction={handleAdd}
          onRequireRate={onRequireRate}
        />
      </div>
    </div>
  );
};
