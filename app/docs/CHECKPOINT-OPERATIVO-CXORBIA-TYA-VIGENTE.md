# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_HUMAN_VISUAL_P0_PROVEN__DOMAIN_FINANCE_SHOPPER_FIX_PASS__RESERVATIONS_FAIL_CLOSED_PASS__LIVE_HR_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. Estado protegido
Repo/rama/PR correctos; PR#7 draft/open/no merge. Corte3 FROZEN y R17N1,406/1,406 no se repiten. Corte5 14/616 PASS; Auth/claims/Rules PASS; HR live/auto-month PASS; perfil protegido120/329 PASS; finanzas/pagos canónicos preservados. Producción intacta.

## 2. Human visual — FAIL P0
El Hosting actual mostró:
- Dashboard44/40 y fases7;
- comparativo vacío;
- refresh moviendo contenido/sidebar;
- fuente210 shoppers y listado219 con identidades divididas;
- perfiles falsamente completos, sin datos mínimos/certificación/histórico;
- portal Shopper Activas1/Historial0/Beneficios vacío;
- periodo financiero divergente;
-33 submitidas omitidas de Liquidaciones.

El smoke anterior fue técnico, no semántico. Corte6 no se congela.

## 3. Causas raíz
Máquinas de estado múltiples; append de perfiles sin crosswalk; watcher con DOM/scroll no canónicos; completitud por flag; portal reducido por estado; finanzas sin identidad/periodo únicos; switch de liquidación sin `submitida`; Reservas usando localStorage/fixtures como fuente conectada.

## 4. Root fix en rama viva — no desplegado
- composer/semántica/watcher v2;
- bridge transversal;
- finance/liquidation read model;
- portal Shopper canónico;
- guard de Reservas canónico/fail-closed;
- wiring DEV actualizado;
- gates correspondientes.

No se modificó `/app/modules/*` ni `/app/core/*`.

## 5. Contratos
- HR manda periodos/visitas/estado;
- una faceta alimenta tile/fase/drill/portal/finanzas;
- unmatched profiles a review queue;
- no dedupe por nombre/teléfono/email;
- perfil completo por campos reales;
- portal por identidad exacta e histórico completo;
- toda realizada entra a Liquidaciones; sin fuente exacta no hay lote/pago;
- mismo contenido HR no rerenderiza;
- periodo/proyecto/vista/scroll salen del modelo;
- Reservas no usa localStorage ni datos demo como backend: permanece read-only hasta proveedor real.

## 6. Gates v6 — PASS
- dominio canónico;
- Finanzas/Liquidaciones completas;
- portal Shopper;
- guard de Reservas;
- HR viva row-level.

HR:14 periodos/616 visitas/208 shoppers; JUL44=GT34+HN10; realizadas40; cuestionario38; submitidas33; liquidationCandidates33; fuera de rango accionable1; evidencia7; duplicados0.

## 7. Límites y pendientes reales
Username/password se derivan en lectura solo para identidad exacta. WhatsApp exige fuente real. Persistir/complementar datos o Auth requiere autorización de escritura específica.

Reportes usa facetas canónicas en código, pero debe pasar smoke humano. Reservas ya no engaña con localStorage, pero su operación real sigue pendiente de fuente/backend y gate propio.

## 8. Gate exacto
Código en GitHub, no desplegado; autorización anterior consumida.

`AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE SMOKE SEMÁNTICO INTEGRAL → HUMAN VISUAL ACUMULATIVA → FREEZE C6`.

Después: conexión real de Reservas y/o agosto según prioridad operativa, cada una con su gate.

## 9. Seguridad
Bloque actual: Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos/reservas writes0; merge=false; producción=false.
