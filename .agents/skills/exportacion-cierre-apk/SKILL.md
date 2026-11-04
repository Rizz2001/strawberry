---
name: exportacion-cierre-apk
description: Generacion del documento de cierre de caja (PDF / Imagen / Texto compartible en Android) y configuracion de Capacitor para compilar el APK.
---

# Exportación de Cierre de Caja y Empaquetado APK

## Estructura del Documento de Cierre (PDF / Reporte)
Al presionar **"Cerrar Caja / Extraer Documento"**, genera un documento PDF limpio (usando `jspdf` y `jspdf-autotable`) que contenga:

1. **Encabezado del Reporte:**
   - Título: **REPORTE DE CIERRE DE CAJA DIARIO**
   - Fecha, Hora de generación y **Tasa de Cambio Aplicada (Bs/USD)**.
2. **Tabla 1: Resumen General por Categoría (Bs y USD):**
   - Pago Móvil (Cantidad de operaciones | Total Bs | Total USD)
   - Transferencias Bancarias (Cantidad | Total Bs | Total USD)
   - Punto de Venta - **Débito Consolidado (Débito + MasterCard)** (Total Bs | Total USD) *(Mostrar nota del desglose interno: Débito X Bs + MasterCard Y Bs)*
   - Punto de Venta - **Crédito** (Total Bs | Total USD)
   - Biopago (Total Bs | Total USD)
   - Efectivo en Bolívares (Total Bs | Total USD)
   - Zelle (Cantidad | Equivalente Bs | Total USD)
   - Efectivo en Dólares (Equivalente Bs | Total USD)
   - **TOTAL GENERAL RECIBIDO EN CAJA (Suma en Bs y Suma en USD)**
3. **Tabla 2: Cuentas por Cobrar (Separado de Caja):**
   - **Total Facturas a Crédito** (Total Bs | Total USD)
   - **GRAN TOTAL VENTA DEL DÍA (Caja + Crédito)**
4. **Anexo Detallado (Trazabilidad Completa):**
   - Desglose numerado (`#1, #2, #3...`) de cada Pago Móvil anotado.
   - Desglose numerado de cada Zelle y Transferencia.
   - Desglose de cada lote/transacción de Punto de Venta (indicando si fue Débito, MasterCard o Crédito).
   - Lista detallada de Facturas a Crédito (Cliente, N° Factura, Monto Bs y USD).

## Compatibilidad con APK (Android)
- Además de la descarga directa del PDF, incluye un botón **"Compartir / Copiar Resumen"** usando `navigator.share` (Web Share API) o portapapeles para poder enviarlo directo a WhatsApp desde el teléfono si es necesario.
- Si se empaqueta con **Capacitor (`@capacitor/core`, `@capacitor/android`)**, asegúrate de configurar `webDir: 'dist'` y usar rutas relativas para que el APK funcione 100% sin conexión a internet.
- Incluye el botón **"Reiniciar Jornada / Nueva Caja"** con doble confirmación para limpiar el día una vez descargado el documento (guardando el cierre previo en un historial local `closed_sessions_history`).

