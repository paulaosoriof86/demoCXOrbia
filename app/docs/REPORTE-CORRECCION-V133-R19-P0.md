# REPORTE DE CORRECCIÓN — V133 (paquete R19 cierre operativo/visual — P0 priorizados)

Baseline: `Prototype development request CXOrbia V132.zip`.

## Alcance de esta ronda (priorizado por impacto, dentro de la capacidad de esta sesión)

El paquete R19 define 5 bloques P0 muy amplios (rediseño de semántica de
estados, jerarquía tenant/proyecto/periodo configurable end-to-end,
selector proyecto≠periodo para shopper/cliente, wizard de configuración
reusable, PWA, Finanzas). Dado el tamaño, esta ronda corrige **los
hallazgos reproducibles y verificados en runtime con mayor impacto
inmediato**, dejando el resto documentado como pendiente (ver abajo).

### 1. Gate 1 — paridad tile↔detalle en Dashboard Operativo (CORREGIDO)
`app/modules/dashboard.js`: el conteo de cada KPI (`k`) se tomaba de
`CX.data.kpis()` (no excluye visitas `_archived`) mientras el modal de
detalle (`drill`) siempre usa `pool()` (sí las excluye) — dos fuentes
distintas para el mismo número, reproduciendo exactamente el hallazgo
"Pend. realizar 25 vs. detalle 0". Ahora `k` se calcula siempre con la
misma `pool()`/`phaseCount()` que alimenta el detalle — una sola fuente.
Verificado en runtime: tile "Pend. realizar" = 12, modal = 12 filas.

### 2. Gate 8 — PWA, prompt nativo en Windows/Chromium (CORREGIDO)
`app/core/pwa.js`: `openInstall()` solo llamaba a
`deferredPrompt.prompt()` cuando `d.how==='prompt'` (Android); en
Windows/Mac (`'desktop'`) mostraba siempre el modal de instrucciones
manual aunque el navegador ya hubiera emitido `beforeinstallprompt` —
reproduce exactamente la evidencia adjunta. Ahora se dispara el prompt
nativo si el evento existe, sin importar la plataforma; el modal manual
queda solo para navegadores que de verdad no exponen el evento (o iOS
Safari). Se agregó `appinstalled` para limpiar el estado y no reofrecer.

### 3. Gate 7 (parcial) — Dashboard Financiero, solo análisis
`app/modules/finanzas.js`:
- Comparativo intermensual/interanual (series `serieMensual`/
  `serieAnual`/`margenMoM`, 100% sintéticas, sin fuente real) quedan
  reemplazadas por `Pendiente de fuente` — no se inventan series
  2024/2025/2026.
- Se elimina `+ Rubro` y el botón `✕` de borrado del presupuesto en el
  Dashboard — la creación/edición de rubros vive solo en Movimientos
  (ya existente ahí), el Dashboard queda de solo lectura + enlace
  "Editar en Movimientos →".

Verificado en runtime: 0 apariciones de `addPres`/`data-delp` en
Financiero, 2 tarjetas muestran `Pendiente de fuente`.

## Pendiente — NO incluido en esta ronda (alcance mucho mayor)
Requiere trabajo sustancial adicional de modelo de datos y UI en
múltiples módulos; se deja explícito para continuar por prioridad:

- P0-1: redefinición ortogonal completa de estados (assigned/scheduled/
  realized/questionnaire/submitted/outOfRange/cancelled) como única
  función fuente (`CX.data.visitFacets`), reemplazando los buckets por
  `estado` en `data.js`, `dashboard.js`, `midia.js`, `visitas.js`,
  `postulaciones.js`.
- P0-1: columna "Periodo de medición" (quincena vía HR) en detalle de
  visitas.
- P0-2: jerarquía tenant/proyecto/frecuencia/medición/HR configurable
  end-to-end + ruta administrativa de tenant/países localizable.
- P0-3.A: shopper/cliente ven proyecto real y periodo por separado, con
  selector de proyecto cuando aplica a varios.
- P0-3.B: KPI Shoppers con definición de "activo" por ventana de 6 meses
  desde la fecha de referencia del periodo, separando referencias
  protegidas de perfiles reales.
- Visitas Disponibles/Postulaciones: filtro estricto solo-postulables
  del periodo activo.

## Gate técnico ejecutado
- Sintaxis: PASS (`dashboard.js`, `pwa.js`, `finanzas.js`).
- Runtime: 0 errores de consola, 48 módulos × 3 roles sin error.
- Gate 1 verificado con click real (12 = 12).
- Gate 8: lógica corregida (no se puede simular `beforeinstallprompt`
  real en este entorno de verificación, pero la condición que bloqueaba
  el prompt en desktop fue eliminada).
- Gate 7: verificado en runtime (sin controles de creación, 2 tarjetas
  pendiente de fuente).
