import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Plus, UserCheck } from 'lucide-react';
import { Currency, MovimientosPillTab, TransactionCategory } from '../types/cash';
import {
  calculateDualAmounts,
  CATEGORY_LABELS,
  formatUSD,
  formatVES,
  round2,
} from '../utils/cashEngine';

interface QuickEntryFormProps {
  activePill: MovimientosPillTab;
  exchangeRate: number;
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

export const QuickEntryForm: React.FC<QuickEntryFormProps> = ({
  activePill,
  exchangeRate,
  onAddTransaction,
  onRequireRate,
}) => {
  const [posSub, setPosSub] = useState<'POS_DEBITO' | 'POS_MASTERCARD' | 'POS_CREDITO'>(
    'POS_DEBITO'
  );
  const [efectivoSub, setEfectivoSub] = useState<'EFECTIVO_BS' | 'EFECTIVO_USD'>(
    'EFECTIVO_BS'
  );
  const [creditCurrency, setCreditCurrency] = useState<Currency>('USD');

  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const amountInputRef = useRef<HTMLInputElement>(null);

  const resolveCategoryAndCurrency = (): {
    category: TransactionCategory;
    currency: Currency;
  } => {
    switch (activePill) {
      case 'PAGO_MOVIL':
      case 'TODOS':
        return { category: 'PAGO_MOVIL', currency: 'VES' };
      case 'POS':
        return { category: posSub, currency: 'VES' };
      case 'ZELLE':
        return { category: 'ZELLE', currency: 'USD' };
      case 'TRANSFERENCIA':
        return { category: 'TRANSFERENCIA', currency: 'VES' };
      case 'BIOPAGO':
        return { category: 'BIOPAGO', currency: 'VES' };
      case 'EFECTIVO':
        return {
          category: efectivoSub,
          currency: efectivoSub === 'EFECTIVO_USD' ? 'USD' : 'VES',
        };
      case 'CREDITOS':
        return { category: 'FACTURA_CREDITO', currency: creditCurrency };
    }
  };

  const { category, currency } = resolveCategoryAndCurrency();
  const isCredit = category === 'FACTURA_CREDITO';
  const isUsdInput = currency === 'USD';

  useEffect(() => {
    setErrorMsg('');
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 30);
  }, [activePill, posSub, efectivoSub, creditCurrency]);

  const numericAmount = parseFloat(amountStr.replace(',', '.')) || 0;
  const preview = calculateDualAmounts(numericAmount, currency, exchangeRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (exchangeRate <= 0) {
      onRequireRate();
      return;
    }

    const cleanAmount = round2(parseFloat(amountStr.replace(',', '.')));
    if (!cleanAmount || cleanAmount <= 0) {
      setErrorMsg('Ingresa un monto mayor a 0');
      amountInputRef.current?.focus();
      return;
    }

    onAddTransaction({
      category,
      inputCurrency: currency,
      rawAmount: cleanAmount,
      note: note.trim() || undefined,
      clientName: isCredit && clientName.trim() ? clientName.trim() : undefined,
      invoiceNumber: isCredit && invoiceNumber.trim() ? invoiceNumber.trim() : undefined,
    });

    setAmountStr('');
    setNote('');
    if (isCredit) {
      setInvoiceNumber('');
    }
    requestAnimationFrame(() => {
      amountInputRef.current?.focus();
    });
  };

  return (
    <div className="fintech-card rounded-3xl p-4 space-y-3">
      {/* Selector minimalista solo para Punto de Venta (3 chips tipo píldora) */}
      {activePill === 'POS' && (
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-full">
          <button
            type="button"
            onClick={() => setPosSub('POS_DEBITO')}
            className={`py-2 px-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              posSub === 'POS_DEBITO'
                ? 'bg-[#5B4EFF] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Débito
          </button>
          <button
            type="button"
            onClick={() => setPosSub('POS_MASTERCARD')}
            className={`py-2 px-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              posSub === 'POS_MASTERCARD'
                ? 'bg-[#5B4EFF] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            MasterCard (+Déb)
          </button>
          <button
            type="button"
            onClick={() => setPosSub('POS_CREDITO')}
            className={`py-2 px-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              posSub === 'POS_CREDITO'
                ? 'bg-[#5B4EFF] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Crédito
          </button>
        </div>
      )}

      {/* Selector minimalista solo para Efectivo (Bs o USD) */}
      {activePill === 'EFECTIVO' && (
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-full">
          <button
            type="button"
            onClick={() => setEfectivoSub('EFECTIVO_BS')}
            className={`py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              efectivoSub === 'EFECTIVO_BS'
                ? 'bg-[#5B4EFF] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Efectivo en Bs
          </button>
          <button
            type="button"
            onClick={() => setEfectivoSub('EFECTIVO_USD')}
            className={`py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              efectivoSub === 'EFECTIVO_USD'
                ? 'bg-[#5B4EFF] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Efectivo en Dólares ($)
          </button>
        </div>
      )}

      {/* Campos para Facturas a Crédito */}
      {isCredit && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F97316]">
              Cuenta por Cobrar (Fuera de Caja)
            </span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-full">
              <button
                type="button"
                onClick={() => setCreditCurrency('USD')}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                  creditCurrency === 'USD'
                    ? 'bg-[#5B4EFF] text-white shadow-sm'
                    : 'text-[#64748B]'
                }`}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => setCreditCurrency('VES')}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                  creditCurrency === 'VES'
                    ? 'bg-[#5B4EFF] text-white shadow-sm'
                    : 'text-[#64748B]'
                }`}
              >
                Bs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 relative">
              <UserCheck className="w-4 h-4 text-[#F97316] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nombre del Cliente (Opcional)"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#5B4EFF] focus:bg-white rounded-2xl pl-9 pr-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="N° Factura"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#5B4EFF] focus:bg-white rounded-2xl px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Formulario Numérico Limpio */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="font-bold text-[#0F172A]">
            {CATEGORY_LABELS[category]}
          </span>
          <span className="font-bold text-[#10B981]">
            {isUsdInput
              ? `= ${formatVES(preview.amountVES)}`
              : `= ${formatUSD(preview.amountUSD)} USD`}
          </span>
        </div>

        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <span
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-extrabold select-none ${
                isCredit
                  ? 'text-[#F97316]'
                  : isUsdInput
                  ? 'text-[#10B981]'
                  : 'text-[#4F46E5]'
              }`}
            >
              {isUsdInput ? '$' : 'Bs.'}
            </span>
            <input
              ref={amountInputRef}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value);
                setErrorMsg('');
              }}
              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200/80 focus:border-[#5B4EFF] rounded-2xl pl-12 pr-3 py-3 text-2xl font-extrabold text-[#0F172A] placeholder-slate-300 focus:outline-none transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-14 rounded-2xl bg-[#5B4EFF] hover:bg-[#4F46E5] text-white font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0"
            title="Agregar (Enter)"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Nota o referencia opcional..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-slate-50/80 focus:bg-white border border-slate-200/70 focus:border-[#5B4EFF] rounded-xl px-3 py-1.5 text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none"
        />

        {errorMsg && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </div>
  );
};
