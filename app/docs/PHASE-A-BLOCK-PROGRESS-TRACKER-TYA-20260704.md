# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__C5_MATERIALIZED1406_CXDATA_PASS__C6_AUTH_RULES_PASS__CREDENTIAL_CONTINUITY_DRYRUN91_PASS_WAITING_AUTHORIZATION`

## 1. Estado general
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Baseline frontend `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- Backend DEV canónico `cxorbia-backend-dev`.
- Hosting DEV existente `cxorbia-backend-dev.web.app`, target `cxorbia-dev`.
- Hosting público final futuro `tya-plataforma`.
- No nueva candidata/base/rama/PR/Hosting.

## 2. Bloques cerrados
### Corte 1 /2A /3
FROZEN/APROBADO. Corte3 conserva 14 periodos/616 visitas y baseline visual aprobada.

### Corte 4 — mapping/preparación
Cerrado para materialización: HR hasta julio,208/208 refs,194 perfiles canónicos,77 certificaciones y write plan idempotente.

### Corte 5 — materialización DEV + CX.data
- 1,406/1,406 Firestore data writes/readback; mismatch0.
- 616 visitas,572 controles liquidación,77 certificaciones.
- P0 project/period corregido.
- Re-smoke PASS: source=firestore, fallback=false, project=`cinepolis`, periods14, visits616, currentPeriod=`2026-07`.
- No repetir materialización.

### Corte 6 — Auth/RBAC/Rules técnico
- claims5/5 ejecutados;
- Rules release/readback PASS;
- Firestore data writes0;
- Hosting DEV previo1/1 consumido y entrypoint remoto verificado.

## 3. Bloque intermedio P0 agregado — continuidad de credenciales
Hallazgo visual real: `Correo + Contraseña` rompía continuidad aunque Auth backend fuera seguro.

Causa raíz completa:
- credenciales legacy no materializadas;
- parser original dedupe global de username mezclaba staff/shopper;
- adapter browser necesitaba namespace.

Corrección reusable:
- namespaces `staff`/`shopper`;
- visible `Tipo de acceso + Usuario + Contraseña`;
- Firebase interno por tenant+namespace+username;
- fail-closed sin inferencia por nombre.

## 4. Fuente credential-continuity procesada
Inventario source-safe v3:
- shopper source282;
- safe credential groups109;
- exact duplicate records collapsed93;
- ambiguous groups18 /records77 HOLD;
- staff4 = superadmin1/coordinador2/demo1;
- encrypted bundle113;
- raw PII/credential material repo0.

## 5. Dry-run provider read-only — PASS
`READY_FOR_EXACT_AUTH_IMPORT_AUTHORIZATION`.
- eligible91: shopper88 + super1 + coordinador2;
- exact shopper matches88;
- HOLD21 shopper without canonical legacyShopperId match;
- HOLD1 demo role;
- collision0;
- provider writes0.

El plan inicial12 queda superseded.

## 6. Bloque en progreso — exact provider activation
Preparado/apagado:
- Auth import max91 + readback91/91;
- password resets0/deletes0/overwrite0;
- gate estático import PASS/no-write;
- un redeploy adicional condicionado al mismo Hosting DEV;
- gate estático Hosting PASS/no-write;
- no nuevo Firebase/Hosting.

Estado: **WAITING SINGLE COMBINED PAULA AUTHORIZATION**.

## 7. Agosto — pendiente inmediato posterior
- Fuente actual termina julio 2026.
- `Agosto HN` HOLD por inconsistencia país/tab.
- Después de FREEZE Corte6: refresh fuente → resolver HOLD → validar periodo/visitas → materializar solo delta agosto.

## 8. Siguiente bloque exacto
`AUTH IMPORT91 + READBACK → SAME HOSTING DEV REDEPLOY1 → VISUAL EXISTING TYA CREDENTIALS → FREEZE C6 → AUGUST DELTA → CORTE8 PREPROD/CUTOVER`.

## 9. Claude/prototipo
No nueva candidata. Login visible debe preservar producto y ocultar provider técnico. No tocar `app/modules/*`. P1/P2: PDF gráfica, Excel formato, reportKit/exportaciones y copy.

## 10. Academia
Actualizar identidad provider detrás del acceso, namespaces, usuario ≠ email, recuperación, scopes, shopperId, dedupe seguro y fail-closed.

## 11. Clasificación
- `Reusable CXOrbia`: identity adapter namespaced, Auth hash import, no-overwrite, claims y readback.
- `Exclusivo cliente`: credenciales legacy TyA y Agosto HN.
- `Claude/prototipo`: login/registro focalizado.
- `Academia`: identidad/acceso/scopes/namespaces.
- `Sin impacto Claude`: cifrado, inventories, runners, requests y gates.

## 12. Estado seguro
R17N histórico1406 ya cerrado. Corte6 previo: claim writes5 + Rules1 + Hosting1. Bloque credential-continuity actual: Auth imports0; password resets/deletes0; Hosting adicional0; Firestore/Rules/Storage/HR/legacy/payments/Make/Gemini0; merge=false; production=false; credenciales crudas0.
