# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_PROFILE_WRITE_PASS__C6_P0_COMPOSITION_REGRESSION__STABILITY_LOCK_ACTIVE`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406;616 visitas;572 liquidaciones;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.

## 2. Hosting acumulativo anterior
Provider deploy PASS histórico:1 Hosting DEV,0 Cloud Run bajo autorización ya consumida. No autoriza otro deploy.

## 3. Human visual actual — P0
La prueba acumulativa posterior mostró:
-88→44 visitas;
-1,232 visitas/546 shoppers en badge;
-scroll reposicionado;
-identidades Shopper duplicadas;
-perfil/credenciales/histórico fragmentados;
-comparativo histórico incompleto;
-estados variables entre primer render y refresh.

La HR actual fue revalidada:30 tabs/28 mensuales; julio34 GT+10 HN. El error es de composición, no de disponibilidad de la fuente.

## 4. Lock permanente añadido
Activo `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`.

Reglas nuevas obligatorias para todo bloque futuro:
- ownership explícito por fuente;
- composer idempotente;
- baseline HR inmutable por revision;
- crosswalk técnico exacto;
- refresh sin mover ruta/filtros/modal/scroll;
- regression gate acumulativo antes de cada transición/deploy.

## 5. Corrección en progreso
Siguiente implementación debe resolver en raíz:
1. no reutilizar arrays ya compuestos;
2. reconciliar visitas por llaves técnicas exactas;
3. impedir append histórico duplicado;
4. converger Shopper a una identidad canónica cuando exista crosswalk exacto;
5. mantener UI state al refrescar;
6. probar3 reaplicaciones consecutivas sin crecimiento.

## 6. 31 identity HOLD
No resueltos por llaves estables. No usar nombre/teléfono/email.

## 7. Claude/Academia
- Claude/prototipo: mismo regression lock, no reinterpretar backend ni reintroducir fallas de etapas previas.
- Academia: ownership, idempotencia, crosswalk y no-regresión.

## 8. Siguiente bloque
`ROOT FIX IDEMPOTENTE + CROSSWALK + UI STATE STABILITY → REGRESSION GATE ACUMULATIVO → solo si PASS 1x DEV DEPLOY → HUMAN VISUAL → FREEZE C6 → AGOSTO`.

## 9. Estado seguro
Proveedor/data writes0; deploys0 en este bloque; merge=false; producción=false.
