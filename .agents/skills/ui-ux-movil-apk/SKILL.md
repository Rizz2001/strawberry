---
name: ui-ux-movil-apk
description: Sistema de diseno UI/UX Clean Light Fintech (Soft Glassmorphism en tonos blanco perla, lavanda suave, degradados azul-violeta e iconos circulares pastel) inspirado en apps bancarias modernas para APK movil.
---

# UI/UX Clean Light Fintech & Soft Glassmorphism (Mobile APK)

## 1. Paleta de Colores y Atmósfera Visual
El diseño debe ser **Light Mode ultra limpio, luminoso y aireado**, con superficies blancas traslúcidas sobre un fondo suave con destellos difuminados (mesh gradients sutiles):

- **Fondo Principal de la App (`App Background`):** Blanco frío / Lavanda ultra pálido (`#F4F6FB` a `#EEF2FF`) con un halo difuminado suave (`blur-3xl`) en la parte superior en tonos azul cielo (`#BAE6FD`) y violeta pastel (`#DDD6FE`).
- **Superficies de Tarjetas (`Card Surface`):** Blanco puro con ligera transparencia (`bg-white/85` o `#FFFFFF`) con `backdrop-blur-md`, borde blanco brillante de 1px (`border border-white`) y sombra suave difuminada (`shadow-[0_8px_30px_rgb(0,0,0,0.04)]`).
- **Tarjeta Hero Principal (Balance / Total Caja):**
  - Gradiente suave diagonal de Azul Cielo a Índigo/Violeta (`bg-gradient-to-br from-[#60A5FA] via-[#6366F1] to-[#8B5CF6]`).
  - Efecto cristal interior, texto en blanco puro (`#FFFFFF`) y un botón cuadrado redondeado (`rounded-2xl`) a la derecha con ícono de billetera/caja en azul traslúcido (`bg-white/20 backdrop-blur-md`).
- **Color Primario de Acción (Botones activos, Tabs y FAB `+`):** Azul-Violeta vibrante (`#4F46E5` / `#5B4EFF`) con sombra de color (`shadow-lg shadow-indigo-500/30`).
- **Tipografía y Textos:**
  - Fuente sin serifa geométrica y moderna (`Inter`, `Plus Jakarta Sans` o `DM Sans`).
  - Títulos y montos principales: Gris carbón profundo (`#0F172A`, `font-bold`).
  - Subtítulos y etiquetas secundarias: Gris pizarra suave (`#64748B`, `text-xs` o `text-sm`).
- **Colores Semánticos para Montos:**
  - Totales o ingresos en USD: Verde esmeralda limpio (`#10B981`, `font-semibold`).
  - Montos en Bolívares (Bs): Azul índigo (`#4F46E5`) o gris oscuro (`#1E293B`).
  - Facturas a Crédito (Por cobrar): Coral / Naranja suave (`#F97316` o `#EF4444`).

---

## 2. Componentes Estructurales (Basados en las 3 Vistas de Referencia)

### Vista 1: Home / Resumen de Caja (Estilo Pantalla Izquierda)
1. **Cabecera Superior:**
   - Saludo o título de jornada ("Jornada Activa", fecha actual) + Badge interactivo con la **Tasa del Día (Bs/USD)** editable en la esquina superior derecha.
2. **Hero Card "Total Recibido en Caja":**
   - Muestra en grande el **Gran Total en Dólares (`$0,000.00`)** y justo debajo el **Equivalente Total en Bolívares (`Bs. 00,000.00`)** junto con el indicador de la tasa aplicada.
3. **Sección "Cuentas / Categorías" (Lista de Tarjetas Agrupadas):**
   - Contenedor blanco (`rounded-3xl p-4`) con filas limpias separadas por divisores sutiles:
     - **Ícono circular a la izquierda (`w-10 h-10 rounded-full`)** con fondo pastel y color vivo:
       - *Pago Móvil:* Fondo azul claro (`#DBEAFE`), ícono azul (`#2563EB`).
       - *Punto de Venta (Débito + MasterCard / Crédito):* Fondo violeta claro (`#EDE9FE`), ícono violeta (`#7C3AED`).
       - *Zelle & Efectivo USD:* Fondo verde menta (`#D1FAE5`), ícono esmeralda (`#059669`).
       - *Transferencias & Biopago:* Fondo cian/turquesa (`#CCFBF1`), ícono (`#0D9488`).
       - *Efectivo Bs:* Fondo amarillo/ámbar suave (`#FEF3C7`), ícono (`#D97706`).
       - *Facturas a Crédito:* Fondo rosa/coral suave (`#FFE4E6`), ícono (`#E11D48`).
     - **Centro:** Nombre de la categoría + cantidad de operaciones anotadas.
     - **Derecha:** Monto total en USD (`$0.00`) arriba y monto total en Bs (`Bs. 0.00`) abajo + flecha `>` para ver el desglose.
4. **Gráfico Dona "Distribución del Día" (Spending/Income Overview):**
   - Gráfico circular tipo Donut (con trazos redondeados en colores cian, azul, violeta y esmeralda) mostrando el total en el centro y la leyenda de porcentajes a la derecha para visualizar rápido qué método de pago dominó el día.

---

### Vista 2: Anotación Uno por Uno / Movimientos (Estilo Pantalla Central)
1. **Selector Superior Tipo Píldora (Segmented Pill Tabs):**
   - Barra contenedora blanca redondeada (`rounded-full bg-white p-1.5 shadow-sm`) con pestañas deslizables para filtrar o anotar por categoría: `Todos`, `Pago Móvil`, `Punto Venta`, `Zelle/Transf`, `Créditos`.
   - La pestaña activa se pinta con una píldora azul-violeta (`bg-[#5B4EFF] text-white rounded-full shadow-md`).
2. **Formulario Rápido de Anotación (Quick-Add Card):**
   - Input numérico grande (`inputMode="decimal"`) con conversión en vivo: mientras el usuario escribe los Bolívares, muestra en tiempo real `= $XX.XX USD` abajo.
   - Si está en **Punto de Venta**, muestra 3 chips tipo píldora seleccionables: `[Débito]`, `[MasterCard (Suma a Débito)]` y `[Crédito]`.
3. **Listado de Pagos Anotados ("Hoy - Pago #1, #2..."):**
   - Tarjetas individuales blancas (`rounded-2xl p-3.5 mb-2.5 flex items-center justify-between`):
     - **Izquierda:** Círculo pastel con el número de operación (`#1`, `#2`) o ícono del método + Título (ej. "Pago Móvil #14" o nombre del cliente en Factura a Crédito) + hora/referencia en gris claro.
     - **Derecha:** Monto en **Bs** y debajo en verde esmeralda el monto en **+$USD**, acompañado de un botón sutil para editar/borrar en caso de error.

---

### Vista 3: Desglose Punto de Venta, Metas y Cierre (Estilo Pantalla Derecha)
1. **Tarjeta Superior de Consolidación (Ej. Desglose General o Tarjetas POS):**
   - Muestra el comparativo de **Caja Recibida vs. Facturas a Crédito** (o el bloque especial de Punto de Venta: **Débito + MasterCard unificados** vs. **TDC Crédito**) con una barra de progreso horizontal violeta/azul (`h-2.5 rounded-full bg-slate-100` con relleno `bg-gradient-to-r from-indigo-500 to-purple-500`).
2. **Lista de Categorías con Barras de Progreso:**
   - Cada categoría (Pago Móvil, Débito+MasterCard, TDC Crédito, Biopago, Zelle, Efectivo Bs, Efectivo USD, Facturas a Crédito) muestra:
     - Ícono circular de color a la izquierda.
     - Nombre de la categoría + Barra de progreso proporcional al peso que tiene sobre el total del día.
     - Subtítulo inferior mostrando ambos montos: **`Bs. 12,500.00 / $250.00`** y porcentaje a la derecha.
3. **Botón de Descarga de Cierre de Caja:**
   - Botón ancho redondeado (`rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-semibold py-4 shadow-lg`) para **Extraer Reporte PDF / Compartir Cierre**.

---

## 3. Barra de Navegación Inferior Fija (Bottom Navigation Bar con FAB)
- Fija en la parte inferior (`fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.05)] px-6 py-3`).
- **4 Íconos de Navegación + 1 Botón Central Flotante (`+`):**
  1. `Inicio` (Resumen general y Hero Card).
  2. `Movimientos` (Anotar y ver Pago Móvil, Zelle, Transferencias uno por uno).
  3. **Botón Central `+` (`w-14 h-14 rounded-full bg-[#5B4EFF] text-white shadow-lg shadow-indigo-500/40 -mt-6 flex items-center justify-center`):** Abre el modal rápido para anotar cualquier pago en 2 toques desde cualquier pantalla.
  4. `Desglose` (Vista de barras con el consolidado Débito+MasterCard, Biopago, Efectivo y Facturas a Crédito).
  5. `Cierre / Tasa` (Configuración de tasa del día y exportación del documento PDF del cierre).
