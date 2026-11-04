import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CashSession, SessionCalculatedTotals, TransactionCategory } from '../types/cash';
import { CATEGORY_LABELS, formatUSD, formatVES } from './cashEngine';

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-VE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

/**
 * Construye el documento jsPDF completo con el Reporte de Cierre de Caja Diario
 */
export function buildClosurePdfDocument(
  session: CashSession,
  totals: SessionCalculatedTotals
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  }) as JsPDFWithAutoTable;

  const nowIso = new Date().toISOString();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado oscuro elegante con identidad strawchell
  doc.setFillColor(9, 13, 22);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Isotipo de fresa estilizado en el PDF + marca strawchell
  doc.setFillColor(225, 37, 40);
  doc.circle(18, 13, 4, 'F');
  doc.setTextColor(244, 63, 94);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('strawchell', 24, 14.5);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('REPORTE DE CIERRE DE CAJA DIARIO', 14, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Apertura: ${formatDateTime(session.openedAt)}`, 14, 28);
  doc.text(`Generado: ${formatDateTime(nowIso)}`, 14, 33);
  doc.text(`Responsable / Caja: ${session.cashierName || 'Caja Principal'}`, 14, 37.5);

  // Caja destacada de Tasa de Cambio en la esquina derecha
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - 74, 8, 60, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(56, 189, 248);
  doc.text('TASA DE CAMBIO APLICADA', pageWidth - 44, 15, { align: 'center' });
  doc.setFontSize(13);
  doc.setTextColor(52, 211, 153);
  doc.text(`${formatVES(session.exchangeRate)} / $1`, pageWidth - 44, 24, { align: 'center' });

  let currentY = 45;

  // SECCIÓN 1: TABLA 1 - RESUMEN GENERAL POR CATEGORÍA (BS Y USD)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. RESUMEN GENERAL POR CATEGORÍA (DINERO EN CAJA)', 14, currentY);

  const debitoNote = `Desglose: Débito ${formatVES(totals.pos.debitoNormal.totalVES)} (${formatUSD(
    totals.pos.debitoNormal.totalUSD
  )}) + MasterCard ${formatVES(totals.pos.mastercard.totalVES)} (${formatUSD(
    totals.pos.mastercard.totalUSD
  )})`;

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Categoría / Método de Pago', 'Operaciones', 'Total en Bolívares (Bs)', 'Total en Dólares ($ USD)']],
    body: [
      [
        'Pago Móvil',
        `${totals.byCategory.PAGO_MOVIL.count}`,
        formatVES(totals.byCategory.PAGO_MOVIL.totalVES),
        formatUSD(totals.byCategory.PAGO_MOVIL.totalUSD),
      ],
      [
        'Transferencias Bancarias',
        `${totals.byCategory.TRANSFERENCIA.count}`,
        formatVES(totals.byCategory.TRANSFERENCIA.totalVES),
        formatUSD(totals.byCategory.TRANSFERENCIA.totalUSD),
      ],
      [
        `Punto de Venta - Débito Consolidado (Débito + MasterCard)\n(${debitoNote})`,
        `${totals.pos.subtotalDebitoConsolidado.count} (${totals.pos.debitoNormal.count} Déb + ${totals.pos.mastercard.count} MC)`,
        formatVES(totals.pos.subtotalDebitoConsolidado.totalVES),
        formatUSD(totals.pos.subtotalDebitoConsolidado.totalUSD),
      ],
      [
        'Punto de Venta - Crédito (TDC)',
        `${totals.pos.subtotalCredito.count}`,
        formatVES(totals.pos.subtotalCredito.totalVES),
        formatUSD(totals.pos.subtotalCredito.totalUSD),
      ],
      [
        'Biopago',
        `${totals.byCategory.BIOPAGO.count}`,
        formatVES(totals.byCategory.BIOPAGO.totalVES),
        formatUSD(totals.byCategory.BIOPAGO.totalUSD),
      ],
      [
        'Efectivo en Bolívares',
        `${totals.byCategory.EFECTIVO_BS.count}`,
        formatVES(totals.byCategory.EFECTIVO_BS.totalVES),
        formatUSD(totals.byCategory.EFECTIVO_BS.totalUSD),
      ],
      [
        'Zelle (Divisas)',
        `${totals.byCategory.ZELLE.count}`,
        formatVES(totals.byCategory.ZELLE.totalVES),
        formatUSD(totals.byCategory.ZELLE.totalUSD),
      ],
      [
        'Efectivo en Dólares ($ USD)',
        `${totals.byCategory.EFECTIVO_USD.count}`,
        formatVES(totals.byCategory.EFECTIVO_USD.totalVES),
        formatUSD(totals.byCategory.EFECTIVO_USD.totalUSD),
      ],
    ],
    foot: [
      [
        'TOTAL GENERAL RECIBIDO EN CAJA',
        `${totals.totalOperacionesCaja} op.`,
        formatVES(totals.totalRecibidoCajaVES),
        formatUSD(totals.totalRecibidoCajaUSD),
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    footStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9.5,
    },
    columnStyles: {
      0: { cellWidth: 82 },
      1: { halign: 'center', cellWidth: 28 },
      2: { halign: 'right', cellWidth: 36, fontStyle: 'bold' },
      3: { halign: 'right', cellWidth: 36, fontStyle: 'bold' },
    },
  });

  currentY = (doc.lastAutoTable?.finalY ?? currentY + 60) + 8;

  // SECCIÓN 2: TABLA 2 - CUENTAS POR COBRAR (SEPARADO DE CAJA) Y GRAN TOTAL
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. CUENTAS POR COBRAR (SEPARADO DE CAJA) Y VENTA BRUTA DEL DÍA', 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Concepto de Arqueo General', 'Facturas / Op.', 'Total en Bolívares (Bs)', 'Total en Dólares ($ USD)']],
    body: [
      [
        'Total Dinero Recibido en Caja (Efectivo + Bancos + POS + Zelle)',
        `${totals.totalOperacionesCaja}`,
        formatVES(totals.totalRecibidoCajaVES),
        formatUSD(totals.totalRecibidoCajaUSD),
      ],
      [
        'Total Facturas a Crédito (Cuentas por Cobrar - NO en Caja)',
        `${totals.countCuentasPorCobrar}`,
        formatVES(totals.totalCuentasPorCobrarVES),
        formatUSD(totals.totalCuentasPorCobrarUSD),
      ],
    ],
    foot: [
      [
        'GRAN TOTAL VENTA DEL DÍA (CAJA + CRÉDITO)',
        `${totals.totalOperacionesCaja + totals.countCuentasPorCobrar} total`,
        formatVES(totals.granTotalVentaDiaVES),
        formatUSD(totals.granTotalVentaDiaUSD),
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [217, 119, 6],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    footStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9.5,
    },
    columnStyles: {
      0: { cellWidth: 82 },
      1: { halign: 'center', cellWidth: 28 },
      2: { halign: 'right', cellWidth: 36, fontStyle: 'bold' },
      3: { halign: 'right', cellWidth: 36, fontStyle: 'bold' },
    },
  });

  currentY = (doc.lastAutoTable?.finalY ?? currentY + 35) + 10;

  // SECCIÓN 3: ANEXO DETALLADO (TRAZABILIDAD COMPLETA)
  const ensureSpace = (minHeight: number) => {
    if (currentY + minHeight > doc.internal.pageSize.getHeight() - 18) {
      doc.addPage();
      currentY = 18;
    }
  };

  ensureSpace(20);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. ANEXO DETALLADO DE OPERACIONES (TRAZABILIDAD)', 14, currentY);
  currentY += 6;

  // Helper para imprimir desglose numerado de una categoría o grupo de categorías
  const renderDetailedGroup = (
    title: string,
    categories: TransactionCategory[],
    headerColor: [number, number, number]
  ) => {
    const items = session.transactions.filter((tx) => categories.includes(tx.category));
    if (items.length === 0) return;

    ensureSpace(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(title, 14, currentY);

    const rows = items.map((tx, idx) => [
      `#${idx + 1}`,
      formatTime(tx.timestamp),
      CATEGORY_LABELS[tx.category],
      tx.note || '-',
      formatVES(tx.amountVES),
      formatUSD(tx.amountUSD),
    ]);

    const groupVES = items.reduce((acc, i) => acc + i.amountVES, 0);
    const groupUSD = items.reduce((acc, i) => acc + i.amountUSD, 0);

    autoTable(doc, {
      startY: currentY + 2,
      head: [['N°', 'Hora', 'Tipo', 'Referencia / Nota', 'Monto Bs', 'Monto USD']],
      body: rows,
      foot: [['', '', 'SUBTOTAL GRUPO', `${items.length} reg.`, formatVES(groupVES), formatUSD(groupUSD)]],
      theme: 'striped',
      headStyles: {
        fillColor: headerColor,
        textColor: 255,
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 38 },
        3: { cellWidth: 46 },
        4: { cellWidth: 32, halign: 'right' },
        5: { cellWidth: 32, halign: 'right' },
      },
    });

    currentY = (doc.lastAutoTable?.finalY ?? currentY + 20) + 7;
  };

  // 3.1 Desglose numerado de Pago Móvil
  renderDetailedGroup('3.1 Desglose Numerado de Pago Móvil', ['PAGO_MOVIL'], [37, 99, 235]);

  // 3.2 Desglose numerado de Zelle
  renderDetailedGroup('3.2 Desglose Numerado de Zelle ($ USD)', ['ZELLE'], [16, 185, 129]);

  // 3.3 Desglose numerado de Transferencias
  renderDetailedGroup('3.3 Desglose Numerado de Transferencias Bancarias', ['TRANSFERENCIA'], [2, 132, 199]);

  // 3.4 Desglose de Punto de Venta (Débito, MasterCard y Crédito)
  renderDetailedGroup(
    '3.4 Desglose de Punto de Venta (Débito, MasterCard y Crédito)',
    ['POS_DEBITO', 'POS_MASTERCARD', 'POS_CREDITO'],
    [79, 70, 229]
  );

  // 3.5 Desglose de Biopago y Efectivo (Bs y USD)
  renderDetailedGroup(
    '3.5 Desglose de Biopago y Efectivo (Bs / USD)',
    ['BIOPAGO', 'EFECTIVO_BS', 'EFECTIVO_USD'],
    [71, 85, 105]
  );

  // 3.6 Lista detallada de Facturas a Crédito
  const creditItems = session.transactions.filter((tx) => tx.category === 'FACTURA_CREDITO');
  if (creditItems.length > 0) {
    ensureSpace(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9);
    doc.text('3.6 Lista Detallada de Facturas a Crédito (Cuentas por Cobrar)', 14, currentY);

    const creditRows = creditItems.map((tx, idx) => [
      `#${idx + 1}`,
      formatTime(tx.timestamp),
      tx.clientName || 'Sin nombre',
      tx.invoiceNumber || 'S/N',
      tx.note || '-',
      formatVES(tx.amountVES),
      formatUSD(tx.amountUSD),
    ]);

    autoTable(doc, {
      startY: currentY + 2,
      head: [['N°', 'Hora', 'Cliente', 'N° Factura', 'Nota', 'Monto Bs', 'Monto USD']],
      body: creditRows,
      foot: [
        [
          '',
          '',
          'TOTAL CRÉDITO',
          `${creditItems.length} fact.`,
          '',
          formatVES(totals.totalCuentasPorCobrarVES),
          formatUSD(totals.totalCuentasPorCobrarUSD),
        ],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [217, 119, 6],
        textColor: 255,
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
      },
      footStyles: {
        fillColor: [254, 243, 199],
        textColor: [146, 64, 14],
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 42, fontStyle: 'bold' },
        3: { cellWidth: 24 },
        4: { cellWidth: 26 },
        5: { cellWidth: 30, halign: 'right' },
        6: { cellWidth: 30, halign: 'right' },
      },
    });
  }

  return doc;
}

/**
 * Descarga directamente el archivo PDF de cierre de caja
 */
export function downloadClosurePdf(session: CashSession, totals: SessionCalculatedTotals): string {
  const doc = buildClosurePdfDocument(session, totals);
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `strawchell_Cierre_Caja_${dateStr}_${session.id.slice(-4)}.pdf`;
  doc.save(fileName);
  return fileName;
}

/**
 * Genera el texto formateado apto para WhatsApp o portapapeles con todo el resumen y desglose
 */
export function generateWhatsAppSummaryText(
  session: CashSession,
  totals: SessionCalculatedTotals
): string {
  const lines: string[] = [];
  lines.push('🍓 *strawchell · REPORTE DE CIERRE DE CAJA DIARIO*');
  lines.push(`📅 Fecha: ${formatDateTime(new Date().toISOString())}`);
  lines.push(`💱 *Tasa Aplicada:* ${formatVES(session.exchangeRate)} / $1`);
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('💰 *RESUMEN DINERO EN CAJA:*');
  lines.push(
    `• *Pago Móvil (${totals.byCategory.PAGO_MOVIL.count}):* ${formatVES(
      totals.byCategory.PAGO_MOVIL.totalVES
    )} (${formatUSD(totals.byCategory.PAGO_MOVIL.totalUSD)})`
  );
  lines.push(
    `• *Transferencias (${totals.byCategory.TRANSFERENCIA.count}):* ${formatVES(
      totals.byCategory.TRANSFERENCIA.totalVES
    )} (${formatUSD(totals.byCategory.TRANSFERENCIA.totalUSD)})`
  );
  lines.push(
    `• *POS Débito Consolidado (${totals.pos.subtotalDebitoConsolidado.count}):* ${formatVES(
      totals.pos.subtotalDebitoConsolidado.totalVES
    )} (${formatUSD(totals.pos.subtotalDebitoConsolidado.totalUSD)})`
  );
  lines.push(
    `   ↳ _Débito: ${formatVES(totals.pos.debitoNormal.totalVES)} + MasterCard: ${formatVES(
      totals.pos.mastercard.totalVES
    )}_`
  );
  lines.push(
    `• *POS TDC Crédito (${totals.pos.subtotalCredito.count}):* ${formatVES(
      totals.pos.subtotalCredito.totalVES
    )} (${formatUSD(totals.pos.subtotalCredito.totalUSD)})`
  );
  lines.push(
    `• *Total General POS:* ${formatVES(totals.pos.totalGeneralPOS.totalVES)} (${formatUSD(
      totals.pos.totalGeneralPOS.totalUSD
    )})`
  );
  lines.push(
    `• *Biopago (${totals.byCategory.BIOPAGO.count}):* ${formatVES(
      totals.byCategory.BIOPAGO.totalVES
    )} (${formatUSD(totals.byCategory.BIOPAGO.totalUSD)})`
  );
  lines.push(
    `• *Efectivo Bs (${totals.byCategory.EFECTIVO_BS.count}):* ${formatVES(
      totals.byCategory.EFECTIVO_BS.totalVES
    )} (${formatUSD(totals.byCategory.EFECTIVO_BS.totalUSD)})`
  );
  lines.push(
    `• *Zelle (${totals.byCategory.ZELLE.count}):* ${formatUSD(
      totals.byCategory.ZELLE.totalUSD
    )} (${formatVES(totals.byCategory.ZELLE.totalVES)})`
  );
  lines.push(
    `• *Efectivo USD (${totals.byCategory.EFECTIVO_USD.count}):* ${formatUSD(
      totals.byCategory.EFECTIVO_USD.totalUSD
    )} (${formatVES(totals.byCategory.EFECTIVO_USD.totalVES)})`
  );
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(`✅ *TOTAL RECIBIDO EN CAJA:*`);
  lines.push(`💵 *USD:* ${formatUSD(totals.totalRecibidoCajaUSD)}`);
  lines.push(`🇻🇪 *Bs:* ${formatVES(totals.totalRecibidoCajaVES)}`);

  if (totals.countCuentasPorCobrar > 0) {
    lines.push('━━━━━━━━━━━━━━━━━━━━');
    lines.push(`📑 *CUENTAS POR COBRAR (CRÉDITO - NO EN CAJA):*`);
    lines.push(
      `• *Facturas a Crédito (${totals.countCuentasPorCobrar}):* ${formatVES(
        totals.totalCuentasPorCobrarVES
      )} (${formatUSD(totals.totalCuentasPorCobrarUSD)})`
    );
    const creditTxs = session.transactions.filter((t) => t.category === 'FACTURA_CREDITO');
    creditTxs.forEach((tx, idx) => {
      lines.push(
        `   #${idx + 1} ${tx.clientName || 'Cliente'} ${
          tx.invoiceNumber ? `[Fact: ${tx.invoiceNumber}]` : ''
        }: ${formatVES(tx.amountVES)} (${formatUSD(tx.amountUSD)})`
      );
    });
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push(
    `🏆 *GRAN TOTAL VENTA DEL DÍA (CAJA + CRÉDITO):* ${formatUSD(
      totals.granTotalVentaDiaUSD
    )} | ${formatVES(totals.granTotalVentaDiaVES)}`
  );

  return lines.join('\n');
}

/**
 * Comparte el resumen (e intenta adjuntar el PDF en Android Web Share API) o lo copia al portapapeles
 */
export async function shareClosureReport(
  session: CashSession,
  totals: SessionCalculatedTotals
): Promise<{ method: 'share' | 'clipboard'; message: string }> {
  const summaryText = generateWhatsAppSummaryText(session, totals);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const doc = buildClosurePdfDocument(session, totals);
      const pdfBlob = doc.output('blob');
      const dateStr = new Date().toISOString().slice(0, 10);
      const pdfFile = new File([pdfBlob], `Cierre_Caja_${dateStr}.pdf`, {
        type: 'application/pdf',
      });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: 'Reporte de Cierre de Caja Diario',
          text: summaryText,
          files: [pdfFile],
        });
        return { method: 'share', message: 'PDF y resumen compartidos exitosamente.' };
      }

      await navigator.share({
        title: 'Reporte de Cierre de Caja Diario',
        text: summaryText,
      });
      return { method: 'share', message: 'Resumen compartido exitosamente.' };
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        return { method: 'share', message: 'Envío cancelado por el usuario.' };
      }
      // Fallback a portapapeles
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(summaryText);
    return {
      method: 'clipboard',
      message: 'Resumen copiado al portapapeles (listo para pegar en WhatsApp).',
    };
  }

  return {
    method: 'clipboard',
    message: 'Resumen generado.',
  };
}
