import React, { useMemo } from 'react';
import {
  CashTransaction,
  Currency,
  MovimientosPillTab,
  PosConsolidation,
  SessionCalculatedTotals,
  TransactionCategory,
} from '../types/cash';
import { QuickEntryForm } from './QuickEntryForm';
import { TransactionList } from './TransactionList';
import { PosSummaryCard } from './PosSummaryCard';
import { CategoryCasillas } from './CategoryCasillas';

interface MovimientosViewProps {
  activePill: MovimientosPillTab;
  onSelectPill: (pill: MovimientosPillTab) => void;
  exchangeRate: number;
  transactions: CashTransaction[];
  posConsolidation: PosConsolidation;
  totals: SessionCalculatedTotals;
  onAddTransaction: (payload: {
    category: TransactionCategory;
    inputCurrency: Currency;
    rawAmount: number;
    note?: string;
    clientName?: string;
    invoiceNumber?: string;
  }) => void;
  onDeleteTransaction: (id: string) => void;
  onRequireRate: () => void;
}

export const MovimientosView: React.FC<MovimientosViewProps> = ({
  activePill,
  onSelectPill,
  exchangeRate,
  transactions,
  posConsolidation,
  totals,
  onAddTransaction,
  onDeleteTransaction,
  onRequireRate,
}) => {
  const pills: { id: MovimientosPillTab; label: string }[] = [
    { id: 'TODOS', label: 'Todos' },
    { id: 'PAGO_MOVIL', label: 'Pago Móvil' },
    { id: 'POS', label: 'Punto Venta' },
    { id: 'ZELLE', label: 'Zelle' },
    { id: 'TRANSFERENCIA', label: 'Transferencias' },
    { id: 'BIOPAGO', label: 'Biopago' },
    { id: 'EFECTIVO', label: 'Efectivo' },
    { id: 'CREDITOS', label: 'Créditos' },
  ];

  const filteredTransactions = useMemo(() => {
    switch (activePill) {
      case 'PAGO_MOVIL':
        return transactions.filter((t) => t.category === 'PAGO_MOVIL');
      case 'POS':
        return transactions.filter((t) =>
          ['POS_DEBITO', 'POS_MASTERCARD', 'POS_CREDITO'].includes(t.category)
        );
      case 'ZELLE':
        return transactions.filter((t) => t.category === 'ZELLE');
      case 'TRANSFERENCIA':
        return transactions.filter((t) => t.category === 'TRANSFERENCIA');
      case 'BIOPAGO':
        return transactions.filter((t) => t.category === 'BIOPAGO');
      case 'EFECTIVO':
        return transactions.filter((t) =>
          ['EFECTIVO_BS', 'EFECTIVO_USD'].includes(t.category)
        );
      case 'CREDITOS':
        return transactions.filter((t) => t.category === 'FACTURA_CREDITO');
      case 'TODOS':
      default:
        return transactions;
    }
  }, [transactions, activePill]);

  const titleByPill: Record<MovimientosPillTab, string> = {
    PAGO_MOVIL: 'Pagos Móviles',
    POS: 'Tarjetas Punto de Venta',
    ZELLE: 'Zelle ($ USD)',
    TRANSFERENCIA: 'Transferencias',
    BIOPAGO: 'Biopago',
    EFECTIVO: 'Efectivo (Bs y $)',
    CREDITOS: 'Facturas a Crédito',
    TODOS: 'Todos los Movimientos',
  };

  return (
    <div className="space-y-4">
      {/* 1. Selector Superior Tipo Píldora (Segmented Pill Tabs) */}
      <div className="rounded-full bg-white p-1.5 shadow-sm border border-white flex items-center gap-1 overflow-x-auto no-scrollbar">
        {pills.map((pill) => {
          const isActive = activePill === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onSelectPill(pill.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#5B4EFF] text-white shadow-md shadow-indigo-500/25'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* 2. Formulario Rápido de Anotación */}
      <QuickEntryForm
        activePill={activePill}
        exchangeRate={exchangeRate}
        onAddTransaction={onAddTransaction}
        onRequireRate={onRequireRate}
      />

      {/* 3. Casillas de Totales Agrupadas (Pago Móvil, Transferencias, POS, Zelle, etc.) */}
      <CategoryCasillas
        totals={totals}
        activePill={activePill}
        onSelectPill={onSelectPill}
      />

      {/* Tarjeta de Consolidación Débito + MasterCard cuando está en Punto de Venta */}
      {activePill === 'POS' && <PosSummaryCard pos={posConsolidation} />}

      {/* 4. Listado de Operaciones Agrupadas por Casillas */}
      <TransactionList
        title={titleByPill[activePill]}
        transactions={filteredTransactions}
        onDeleteTransaction={onDeleteTransaction}
        groupByCategory={activePill === 'TODOS'}
      />
    </div>
  );
};
