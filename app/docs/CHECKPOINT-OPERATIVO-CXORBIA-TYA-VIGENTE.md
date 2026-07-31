# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_P0_COMPOSITION_REGRESSION__PERMANENT_STABILITY_LOCK_ACTIVE__NO_DEPLOY__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting DEV `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N 1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore:120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- Finanzas/pagos canónicos source-safe previamente aprobados permanecen autoridad.

## 3. Hosting acumulativo previo
El deploy autorizado anterior sí fue exactamente1 Hosting DEV y0 Cloud Run. Ese PASS técnico queda como evidencia histórica del provider, pero la validación humana posterior mostró un P0 de composición; por tanto Corte6 NO se congela.

## 4. P0 humano actual
Reproducido en visual:
- JUL inicia con88 visitas y luego44;
- badge técnico llegó a1,232 visitas y546 shoppers;
- scroll se reposiciona durante refresh;
- shoppers duplicados/aliases reaparecen;
- username/password/PII e histórico no convergen en una identidad única;
- comparativo histórico pierde periodos previos;
- estados cambian entre primer render y refresh.

La HR canónica verificada hoy mantiene30 tabs/28 mensuales y julio 2026 con34 GT +10 HN. El problema no es ausencia de HR viva; es composición no idempotente del read model visual.

## 5. Causa raíz
`tya-dev-full-visual-bridge.js` reusa como base los arrays actuales de `CX.data`, que ya pueden contener el overlay anterior. Al re-aplicar después de HR refresh, puede duplicar visitas/perfiles y dividir identidad/histórico.

## 6. Lock permanente de estabilidad
Activo y prevalente:
`app/docs/ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`.

Desde este punto ninguna etapa puede avanzar con PASS parcial. Toda transición debe demostrar no-regresión acumulativa de todos los cortes previos.

## 7. Corrección obligatoria antes de otro deploy
1. baseline HR inmutable por revisión;
2. composer idempotente;
3. visitas HR/protegidas reconciliadas por `visitId/hrRowId/sourceTab+sourceRow`, sin append histórico duplicado;
4. crosswalk Shopper por evidencia técnica exacta;
5. refresh que preserve periodo/ruta/filtros/modal/scroll;
6. regression gate con 3 reaplicaciones consecutivas sin crecimiento;
7. mismo gate incluye Dashboard, histórico, Shopper, Beneficios y Finanzas.

## 8. 31 identity HOLD
Siguen31 sin vínculo canónico reproducible; no crear ni emparejar por nombre/teléfono/email.

## 9. Siguiente bloque exacto
`ROOT FIX IDEMPOTENTE + CROSSWALK TÉCNICO + UI STATE STABILITY → REGRESSION GATE ACUMULATIVO → solo si PASS solicitar 1x Hosting DEV → human visual única → FREEZE C6 → AGOSTO`.

## 10. Estado seguro
En el bloque actual: provider/data writes0; deploys0; nuevos Firebase/Hosting0; PR#7 draft/open/no merge; producción intacta.
