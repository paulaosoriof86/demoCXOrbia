# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_PROFILE_WRITE_PASS__C6_HUMAN_P0__DOMAIN_FINANCE_FIX_PASS__LIVE_HR_AUDIT_PASS__PENDING_HOSTING_DEV`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406;616 visitas;572 liquidaciones;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.

## 2. Hosting anterior
Se ejecutó1 Hosting DEV autorizado; Cloud Run/data/provider writes0. Asset parity e idempotencia sintética PASS. La validación humana posterior demostró que este gate no cubría coherencia semántica transversal.

## 3. Human visual C6 — FAIL P0
Probado:
- KPIs superiores correctos y flujo de fases incorrecto;
- comparativo histórico vacío;
- saltos de scroll/sidebar;
- shoppers duplicados visualmente y conteos210/219;
- perfil/credenciales/WA/certificación/histórico incompletos;
- portal Shopper y Beneficios sin el histórico de Admin;
- periodos financieros desincronizados;
- Movimientos/Liquidaciones incompletos;
-33 submitidas omitidas de Liquidaciones.

Corte6 no se congela.

## 4. Diagnóstico raíz — cerrado
- múltiples máquinas de estado;
- perfiles protegidos sin crosswalk anexados a operación;
- watcher con timestamps, scroll incorrecto y select DOM independiente;
- completitud heredada no verificada;
- `Mis Visitas` reduciendo histórico;
- identidad/periodo/finanzas sin proyección única;
- switch de liquidación sin estado `submitida`.

## 5. Root fix canónico — CODE PASS
En rama viva:
- composer v2;
- semántica estado accionable vs evidencia histórica;
- watcher v2 por firma de contenido;
- domain consistency bridge DEV;
- canonical finance/liquidation read model v2;
- gates de dominio y finanzas;
- wiring en `index-backend-dev.html`.

Módulos/core frontend intactos.

## 6. Gates finales — PASS
Evidencia v4:
- `PASS_C6_CANONICAL_DOMAIN_CONSISTENCY`;
- `PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`;
- `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`.

HR viva:
-14 periodos;
-616 visitas;
-208 shoppers HR;
-JUL44=GT34/HN10;
-realizadas40;
-cuestionario38;
-submitidas33;
-liquidationCandidates33;
-fuera de rango accionable1;
-evidencia histórica7;
-duplicate IDs0.

Finanzas:
-40 realizadas presentes en Liquidaciones;
-33 submitidas no omitidas;
-5 pendientes de submit;
-2 pendientes de cuestionario;
-fuente/pago exacto preservados;
-pagos deshabilitados.

## 7. Identidad y perfil
- no dedupe por nombre/teléfono/email;
- unmatched profiles en review queue;
- perfil completo exige mínimos reales;
- credenciales derivables en lectura solo con identidad exacta;
- WhatsApp requiere fuente real;
- persistencia futura exige write plan+autorización.

## 8. Claude/Academia
- Claude: máquina de estados única, identity review queue, perfil real, histórico completo, certificación visible, periodo financiero único y liquidaciones por facetas.
- Academia: ownership, progresión acumulativa, evidencia vs estado accionable y diferencia entre candidata/cruce/lote/pago.

## 9. Gate pendiente
El código v2 no está desplegado. Autorización anterior consumida.

`AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE SMOKE SEMÁNTICO → HUMAN VISUAL PASS → FREEZE C6 → AGOSTO`.

## 10. Estado seguro
Bloque correctivo: Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos0; merge=false; producción=false.
