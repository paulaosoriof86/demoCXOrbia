# CAMBIOS BACKEND — Addendum Corte 3 Visual HOLD

**Fecha:** 2026-07-24  
**Estado:** `P0_PROVEN_VISUAL_HOLD_CORTE3`

## Qué se hizo

- Se revisaron diez capturas móviles de Hosting DEV aportadas por Paula.
- Se contrastaron con el runtime, módulos financieros, motor financiero, Beneficios, gates R23/R25 y checkpoint vigente.
- Se registraron siete P0 y seis P1 reproducibles.
- Se cambió el estado de Corte 3 de `PENDING_PAULA_VISUAL` a `VISUAL_HOLD`.

## Hallazgos principales

- agregación multimoneda inválida;
- semántica “pagado” incompatible con 0 pagos confirmados;
- conciliación de reembolsos inferida al 85% sin fuente;
- selector financiero desacoplado de los 14 periodos canónicos;
- PDF vacío/incorrecto y Excel no generado;
- dos revisiones no visibles ni localizables;
- Shopper Beneficios no validable con identidad real;
- responsive funcionalmente insuficiente;
- copy de IA/Gemini no honesto.

## Archivos funcionales modificados

Ninguno.

## Documentación creada

- `app/docs/VALIDACION-VISUAL-CORTE3-HOLD-PAULA-20260724.md`.
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE3-VISUAL-HOLD-20260724.md`.
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE3-VISUAL-HOLD-20260724.md`.
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE3-VISUAL-HOLD-20260724.md`.
- `app/docs/ACADEMIA-IMPACTO-CORTE3-VISUAL-HOLD-20260724.md`.

## Seguridad

Sin merge, producción, Cloud Run deploy, Hosting nuevo, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini.

## Siguiente bloque

Diagnóstico de causa raíz por hallazgo, paquete focalizado para Claude/prototipo y ajuste de gates antes de nueva candidata y revalidación visual.
# ADDENDUM 2026-07-28 - CORRECCION FOCAL AUTORIZADA

Fuente: PR #7 comment `5110893740`.

Cambios funcionales:

- `app/modules/finanzas.js`: elimina `paymentState==='pending_source_confirmation'` del criterio de revision financiera; aplica un predicado unico a Movimientos/CxP, Liquidaciones/export y conteos/drills.
- `app/modules/finanzas.js`: KPIs de Liquidaciones pasan a `En revision financiera`, `Conciliadas - pago pendiente`, `Candidatas para lote` y `Pagadas confirmadas`.
- `app/modules/finanzas.js`: Movimientos muestra CxP derivada de liquidaciones exactas y mantiene revisiones visibles fuera de CxP pagable.
- `app/core/tya-phase-a-source-safe-preview.js`: reemplaza `latestPeriod` por seleccion current-month-safe y registra `activePeriodKey`/`activePeriodPolicy` en `previewMeta`.

Beneficio:

- Export Liquidaciones vuelve a 42 exportables + 2 reviews, no 44 reviews.
- Dashboard y Movimientos comparten la misma CxP canonica por pais/moneda.
- Agosto precreado no se activa en julio; agosto se activa al entrar agosto si existe en source-safe.
- Se conserva 0 pagos, 0 lotes, 0 writes reales y 0 produccion.

Gates locales: R26-R32 PASS; focal mayo PASS; rollover focal PASS.
