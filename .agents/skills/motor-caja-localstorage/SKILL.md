---
name: motor-caja-localstorage
description: Motor matematico multimoneda (Bs/USD), reglas de agrupacion de Punto de Venta (MasterCard sumado con Debito) y persistencia 100% offline con localStorage para aplicativo movil APK.
---

# Motor de Caja Multimoneda & LocalStorage (Offline First)

## Reglas de Arquitectura y Estado
1. **Persistencia 100% Local:** Todo el estado de la jornada debe guardarse automáticamente en `localStorage` bajo la clave `cash_session_v1` en cada cambio. No uses bases de datos en la nube ni llamadas a APIs externas.
2. **Apertura de Jornada Obligatoria:** Ningún movimiento puede registrarse si `exchangeRate <= 0`. Si el usuario edita la tasa a mitad del día, recalcula automáticamente todos los montos equivalentes de la sesión activa.
3. **Precisión Matemática:** Evita errores de coma flotante redondeando siempre a 2 decimales (`Math.round((num + Number.EPSILON) * 100) / 100`).
   - Si el registro entra en **Bs (`VES`)**: `amountUSD = round(amountVES / exchangeRate)`
   - Si el registro entra en **Dólares (`USD`)**: `amountVES = round(amountUSD * exchangeRate)`

## Categorías y Reglas Estrictas de Agrupación
Cada transacción guarda: `{ id, timestamp, category, inputCurrency, amountVES, amountUSD, note, clientName, invoiceNumber }`.

1. **`PAGO_MOVIL`** (Entrada en Bs): Se anota uno por uno. Suma al total de Pago Móvil en Bs y USD.
2. **`TRANSFERENCIA`** (Entrada en Bs): Se anota una por una. Suma al total de Transferencias en Bs y USD.
3. **`ZELLE`** (Entrada en USD): Se anota uno por uno. Suma al total de Zelle en USD y calcula su equivalente en Bs.
4. **Punto de Venta (POS - Entrada en Bs):**
   - Permite registrar en 3 botones/subcategorías distintas: `POS_DEBITO`, `POS_MASTERCARD` y `POS_CREDITO`.
   - **REGLA CRÍTICA DE NEGOCIO:** Aunque `POS_MASTERCARD` se anote con su etiqueta para trazabilidad, en el cálculo de subtotales **SIEMPRE se suma junto con Débito**:
     - `subtotalDebitoConsolidado = sum(POS_DEBITO) + sum(POS_MASTERCARD)` (en Bs y USD).
     - `subtotalCredito = sum(POS_CREDITO)` (en Bs y USD).
     - `totalGeneralPOS = subtotalDebitoConsolidado + subtotalCredito` (en Bs y USD).
5. **`EFECTIVO_BS`** (Entrada en Bs): Suma en Bs y convierte a USD.
6. **`EFECTIVO_USD`** (Entrada en USD): Suma directo a USD y calcula su equivalente en Bs.
7. **`BIOPAGO`** (Entrada en Bs): Suma en Bs y convierte a USD.
8. **`FACTURA_CREDITO`** (Entrada seleccionable Bs o USD): Requiere `clientName` y opcionalmente `invoiceNumber`.
   - **REGLA DE ARQUEO:** Las facturas a crédito se totalizan en su propio bloque (`Total Cuentas por Cobrar` en Bs y USD). **NUNCA** deben sumarse al "Total Dinero Recibido en Caja", sino mostrarse aparte o en un renglón de "Venta Bruta General (Caja + Crédito)".

