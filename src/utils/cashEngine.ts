import {
  CashSession,
  CashTransaction,
  CategoryTotals,
  Currency,
  PosConsolidation,
  SessionCalculatedTotals,
  TransactionCategory,
} from '../types/cash';

export const STORAGE_KEY_ACTIVE_SESSION = 'cash_session_v1';
export const STORAGE_KEY_CLOSED_HISTORY = 'closed_sessions_history';

/**
 * Redondeo estricto a 2 decimales evitando errores de coma flotante (IEEE 754)
 */
export function round2(num: number): number {
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Convierte un monto según la moneda de entrada y la tasa activa
 */
export function calculateDualAmounts(
  rawAmount: number,
  inputCurrency: Currency,
  exchangeRate: number
): { amountVES: number; amountUSD: number } {
  const safeAmount = round2(Math.max(0, rawAmount));
  if (exchangeRate <= 0) {
    return {
      amountVES: inputCurrency === 'VES' ? safeAmount : 0,
      amountUSD: inputCurrency === 'USD' ? safeAmount : 0,
    };
  }

  if (inputCurrency === 'VES') {
    const amountVES = safeAmount;
    const amountUSD = round2(amountVES / exchangeRate);
    return { amountVES, amountUSD };
  } else {
    const amountUSD = safeAmount;
    const amountVES = round2(amountUSD * exchangeRate);
    return { amountVES, amountUSD };
  }
}

/**
 * Recalcula todas las transacciones de la sesión cuando cambia la tasa de cambio a mitad de jornada
 */
export function recalculateSessionWithNewRate(
  session: CashSession,
  newRate: number
): CashSession {
  const safeRate = round2(Math.max(0, newRate));
  if (safeRate <= 0) {
    return { ...session, exchangeRate: 0, updatedAt: new Date().toISOString() };
  }

  const updatedTransactions = session.transactions.map((tx) => {
    if (tx.inputCurrency === 'VES') {
      return {
        ...tx,
        amountVES: round2(tx.amountVES),
        amountUSD: round2(tx.amountVES / safeRate),
      };
    } else {
      return {
        ...tx,
        amountUSD: round2(tx.amountUSD),
        amountVES: round2(tx.amountUSD * safeRate),
      };
    }
  });

  return {
    ...session,
    exchangeRate: safeRate,
    updatedAt: new Date().toISOString(),
    transactions: updatedTransactions,
  };
}

/**
 * Crea una sesión inicial limpia
 */
export function createInitialSession(exchangeRate = 0, cashierName = 'Caja Principal'): CashSession {
  const now = new Date().toISOString();
  return {
    id: `session_${Date.now()}`,
    openedAt: now,
    updatedAt: now,
    exchangeRate: round2(exchangeRate),
    cashierName,
    transactions: [],
  };
}

/**
 * Carga la sesión activa desde localStorage (clave: cash_session_v1)
 */
export function loadActiveSession(): CashSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    if (!raw) return createInitialSession(0);
    const parsed = JSON.parse(raw) as CashSession;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.transactions)) {
      return createInitialSession(0);
    }
    return {
      ...parsed,
      exchangeRate: round2(Number(parsed.exchangeRate) || 0),
    };
  } catch {
    return createInitialSession(0);
  }
}

/**
 * Guarda la sesión activa en localStorage bajo cash_session_v1
 */
export function saveActiveSession(session: CashSession): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(session));
  } catch (err) {
    console.error('Error guardando sesión en localStorage:', err);
  }
}

/**
 * Carga el historial de cierres previos desde localStorage (closed_sessions_history)
 */
export function loadClosedHistory(): CashSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLOSED_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Archiva la sesión actual en closed_sessions_history y retorna una nueva sesión limpia
 */
export function archiveAndResetSession(
  currentSession: CashSession,
  keepRate = true
): { newSession: CashSession; history: CashSession[] } {
  const closedSession: CashSession = {
    ...currentSession,
    closedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existingHistory = loadClosedHistory();
  const updatedHistory = [closedSession, ...existingHistory].slice(0, 50); // Conserva hasta 50 cierres históricos

  try {
    localStorage.setItem(STORAGE_KEY_CLOSED_HISTORY, JSON.stringify(updatedHistory));
  } catch (err) {
    console.error('Error guardando historial en localStorage:', err);
  }

  const nextRate = keepRate ? currentSession.exchangeRate : 0;
  const newSession = createInitialSession(nextRate, currentSession.cashierName || 'Caja Principal');
  saveActiveSession(newSession);

  return { newSession, history: updatedHistory };
}

const ALL_CATEGORIES: TransactionCategory[] = [
  'PAGO_MOVIL',
  'TRANSFERENCIA',
  'ZELLE',
  'POS_DEBITO',
  'POS_MASTERCARD',
  'POS_CREDITO',
  'EFECTIVO_BS',
  'EFECTIVO_USD',
  'BIOPAGO',
  'FACTURA_CREDITO',
];

/**
 * Motor matemático de arqueo:
 * - Suma POS_DEBITO + POS_MASTERCARD en subtotalDebitoConsolidado
 * - Excluye FACTURA_CREDITO del Total Dinero Recibido en Caja
 * - Calcula Cuentas por Cobrar aparte y Gran Total Venta del Día (Caja + Crédito)
 */
export function calculateSessionTotals(session: CashSession): SessionCalculatedTotals {
  const byCategory = {} as Record<TransactionCategory, CategoryTotals>;

  for (const cat of ALL_CATEGORIES) {
    byCategory[cat] = { count: 0, totalVES: 0, totalUSD: 0 };
  }

  for (const tx of session.transactions) {
    const bucket = byCategory[tx.category];
    if (bucket) {
      bucket.count += 1;
      bucket.totalVES = round2(bucket.totalVES + tx.amountVES);
      bucket.totalUSD = round2(bucket.totalUSD + tx.amountUSD);
    }
  }

  // Regla Crítica de Punto de Venta: Débito Consolidado = POS_DEBITO + POS_MASTERCARD
  const debitoNormal = byCategory.POS_DEBITO;
  const mastercard = byCategory.POS_MASTERCARD;
  const subtotalDebitoConsolidado: CategoryTotals = {
    count: debitoNormal.count + mastercard.count,
    totalVES: round2(debitoNormal.totalVES + mastercard.totalVES),
    totalUSD: round2(debitoNormal.totalUSD + mastercard.totalUSD),
  };

  const subtotalCredito = byCategory.POS_CREDITO;
  const totalGeneralPOS: CategoryTotals = {
    count: subtotalDebitoConsolidado.count + subtotalCredito.count,
    totalVES: round2(subtotalDebitoConsolidado.totalVES + subtotalCredito.totalVES),
    totalUSD: round2(subtotalDebitoConsolidado.totalUSD + subtotalCredito.totalUSD),
  };

  const pos: PosConsolidation = {
    debitoNormal,
    mastercard,
    subtotalDebitoConsolidado,
    subtotalCredito,
    totalGeneralPOS,
  };

  // Total Dinero Recibido en Caja (NUNCA incluye FACTURA_CREDITO)
  const cashCategories: TransactionCategory[] = [
    'PAGO_MOVIL',
    'TRANSFERENCIA',
    'ZELLE',
    'POS_DEBITO',
    'POS_MASTERCARD',
    'POS_CREDITO',
    'EFECTIVO_BS',
    'EFECTIVO_USD',
    'BIOPAGO',
  ];

  let totalRecibidoCajaVES = 0;
  let totalRecibidoCajaUSD = 0;
  let totalOperacionesCaja = 0;

  for (const cat of cashCategories) {
    totalRecibidoCajaVES = round2(totalRecibidoCajaVES + byCategory[cat].totalVES);
    totalRecibidoCajaUSD = round2(totalRecibidoCajaUSD + byCategory[cat].totalUSD);
    totalOperacionesCaja += byCategory[cat].count;
  }

  // Cuentas por Cobrar (Facturas a Crédito)
  const creditBucket = byCategory.FACTURA_CREDITO;
  const totalCuentasPorCobrarVES = creditBucket.totalVES;
  const totalCuentasPorCobrarUSD = creditBucket.totalUSD;
  const countCuentasPorCobrar = creditBucket.count;

  // Gran Total Venta del Día (Caja + Crédito)
  const granTotalVentaDiaVES = round2(totalRecibidoCajaVES + totalCuentasPorCobrarVES);
  const granTotalVentaDiaUSD = round2(totalRecibidoCajaUSD + totalCuentasPorCobrarUSD);

  return {
    byCategory,
    pos,
    totalRecibidoCajaVES,
    totalRecibidoCajaUSD,
    totalOperacionesCaja,
    totalCuentasPorCobrarVES,
    totalCuentasPorCobrarUSD,
    countCuentasPorCobrar,
    granTotalVentaDiaVES,
    granTotalVentaDiaUSD,
  };
}

/**
 * Formateador de Bolívares (es-VE)
 */
export function formatVES(amount: number): string {
  return `Bs. ${round2(amount).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formateador de Dólares ($ USD)
 */
export function formatUSD(amount: number): string {
  return `$${round2(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Etiquetas legibles por categoría
 */
export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  PAGO_MOVIL: 'Pago Móvil',
  TRANSFERENCIA: 'Transferencia Bancaria',
  ZELLE: 'Zelle ($)',
  POS_DEBITO: 'POS · Tarjeta Débito',
  POS_MASTERCARD: 'POS · MasterCard',
  POS_CREDITO: 'POS · Tarjeta Crédito',
  EFECTIVO_BS: 'Efectivo en Bolívares',
  EFECTIVO_USD: 'Efectivo en Dólares ($)',
  BIOPAGO: 'Biopago',
  FACTURA_CREDITO: 'Factura a Crédito',
};

/**
 * Descarga un archivo .json de respaldo con la sesión activa y el historial de cierres
 */
export function downloadFullBackup(session: CashSession, history: CashSession[]): void {
  const payload = {
    app: 'strawchell',
    exportedAt: new Date().toISOString(),
    activeSession: session,
    closedHistory: history,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `strawchell_respaldo_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}


