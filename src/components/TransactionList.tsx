import React, { useState } from 'react';
import { Clock, FileText, Trash2, User } from 'lucide-react';
import { CashTransaction, TransactionCategory } from '../types/cash';
import { CATEGORY_LABELS, formatUSD, formatVES, round2 } from '../utils/cashEngine';

interface TransactionListProps {
  title: string;
  transactions: CashTransaction[];
  onDeleteTransaction: (id: string) => void;
  emptyMessage?: string;
}

function getPastelStyle(category: TransactionCategory): {
  bg: string;
  text: string;
} {
  switch (category) {
    case 'PAGO_MOVIL':
      return { bg: 'bg-[#DBEAFE]', text: 'text-[#2563EB]' };
    case 'POS_DEBITO':
    case 'POS_MASTERCARD':
    case 'POS_CREDITO':
      return { bg: 'bg-[#EDE9FE]', text: 'text-[#7C3AED]' };
    case 'ZELLE':
    case 'EFECTIVO_USD':
      return { bg: 'bg-[#D1FAE5]', text: 'text-[#059669]' };
    case 'TRANSFERENCIA':
    case 'BIOPAGO':
      return { bg: 'bg-[#CCFBF1]', text: 'text-[#0D9488]' };
    case 'EFECTIVO_BS':
      return { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' };
    case 'FACTURA_CREDITO':
      return { bg: 'bg-[#FFE4E6]', text: 'text-[#E11D48]' };
  }
}

export const TransactionList: React.FC<TransactionListProps> = ({
  title,
  transactions,
  onDeleteTransaction,
  emptyMessage = 'Aún no hay pagos anotados en esta categoría hoy.',
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const totalVES = round2(transactions.reduce((acc, t) => acc + t.amountVES, 0));
  const totalUSD = round2(transactions.reduce((acc, t) => acc + t.amountUSD, 0));

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('es-VE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Encabezado de la lista ("Hoy - Pago #1, #2...") */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-white text-[#4F46E5] border border-indigo-100 text-xs font-bold shadow-2xs">
            {transactions.length}
          </span>
        </div>

        {transactions.length > 0 && (
          <div className="text-right text-xs">
            <span className="font-bold text-[#10B981]">{formatUSD(totalUSD)}</span>
            <span className="text-[#64748B] mx-1">·</span>
            <span className="font-semibold text-[#4F46E5]">{formatVES(totalVES)}</span>
          </div>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="fintech-card rounded-3xl py-10 px-4 text-center">
          <p className="text-xs text-[#64748B] font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div>
          {transactions.map((tx, index) => {
            const pastel = getPastelStyle(tx.category);
            const isCredit = tx.category === 'FACTURA_CREDITO';
            const isConfirming = confirmDeleteId === tx.id;

            return (
              <div
                key={tx.id}
                className="bg-white/90 backdrop-blur-md border border-white rounded-2xl p-3.5 mb-2.5 flex items-center justify-between gap-3 shadow-[0_6px_24px_rgb(15,23,42,0.035)] hover:shadow-[0_8px_28px_rgb(15,23,42,0.06)] transition-all"
              >
                {/* Izquierda: Círculo pastel con número (#1, #2...) + Título + Hora/Referencia */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full ${pastel.bg} ${pastel.text} flex items-center justify-center text-xs font-extrabold shrink-0`}
                  >
                    #{index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-[#0F172A] truncate">
                        {isCredit && tx.clientName
                          ? tx.clientName
                          : `${CATEGORY_LABELS[tx.category]} #${index + 1}`}
                      </span>
                      {tx.category === 'POS_MASTERCARD' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED]">
                          +Débito
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(tx.timestamp)}
                      </span>
                      {isCredit && (
                        <span className="inline-flex items-center gap-1 text-[#F97316] font-semibold">
                          <User className="w-3 h-3" />
                          Crédito
                          {tx.invoiceNumber ? ` · Fact #${tx.invoiceNumber}` : ''}
                        </span>
                      )}
                      {tx.note && (
                        <span className="inline-flex items-center gap-1 text-[#475569] font-medium truncate">
                          <FileText className="w-3 h-3" />
                          {tx.note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Derecha: Monto en Bs arriba y en verde esmeralda +$USD abajo + Botón borrar */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <span className="block text-sm font-bold text-[#0F172A]">
                      {formatVES(tx.amountVES)}
                    </span>
                    <span
                      className={`block text-xs font-semibold ${
                        isCredit ? 'text-[#F97316]' : 'text-[#10B981]'
                      }`}
                    >
                      +{formatUSD(tx.amountUSD)}
                    </span>
                  </div>

                  {isConfirming ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteTransaction(tx.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Borrar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1.5 rounded-xl bg-slate-100 text-[#64748B] text-xs font-semibold cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(tx.id)}
                      className="p-2 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
