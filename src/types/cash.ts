export type Currency = 'VES' | 'USD';

export type TransactionCategory =
  | 'PAGO_MOVIL'
  | 'TRANSFERENCIA'
  | 'ZELLE'
  | 'POS_DEBITO'
  | 'POS_MASTERCARD'
  | 'POS_CREDITO'
  | 'EFECTIVO_BS'
  | 'EFECTIVO_USD'
  | 'BIOPAGO'
  | 'FACTURA_CREDITO';

export interface CashTransaction {
  id: string;
  timestamp: string; // ISO string
  category: TransactionCategory;
  inputCurrency: Currency;
  amountVES: number;
  amountUSD: number;
  note?: string;
  clientName?: string;
  invoiceNumber?: string;
}

export interface CashSession {
  id: string;
  openedAt: string;
  updatedAt: string;
  closedAt?: string;
  exchangeRate: number;
  cashierName?: string;
  transactions: CashTransaction[];
}

export interface CategoryTotals {
  count: number;
  totalVES: number;
  totalUSD: number;
}

export interface PosConsolidation {
  debitoNormal: CategoryTotals;
  mastercard: CategoryTotals;
  /** REGLA CRÍTICA: POS_DEBITO + POS_MASTERCARD */
  subtotalDebitoConsolidado: CategoryTotals;
  subtotalCredito: CategoryTotals;
  totalGeneralPOS: CategoryTotals;
}

export interface SessionCalculatedTotals {
  byCategory: Record<TransactionCategory, CategoryTotals>;
  pos: PosConsolidation;
  /** Dinero real recibido en caja (Excluye FACTURA_CREDITO) */
  totalRecibidoCajaVES: number;
  totalRecibidoCajaUSD: number;
  totalOperacionesCaja: number;
  /** Cuentas por cobrar (Solo FACTURA_CREDITO) */
  totalCuentasPorCobrarVES: number;
  totalCuentasPorCobrarUSD: number;
  countCuentasPorCobrar: number;
  /** Gran Total Venta Bruta del Día (Caja + Crédito) */
  granTotalVentaDiaVES: number;
  granTotalVentaDiaUSD: number;
}

/** Las 4 vistas principales de la barra de navegación inferior */
export type MainScreenView = 'INICIO' | 'MOVIMIENTOS' | 'DESGLOSE' | 'CIERRE';

/** Pestañas tipo píldora directas y sencillas en Movimientos */
export type MovimientosPillTab =
  | 'PAGO_MOVIL'
  | 'POS'
  | 'ZELLE'
  | 'TRANSFERENCIA'
  | 'BIOPAGO'
  | 'EFECTIVO'
  | 'CREDITOS'
  | 'TODOS';
