# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__C5_MATERIALIZED1406_CXDATA_PASS__C6_AUTH91_READBACK_PASS_HOSTING_DEV_REMOTE_PASS__PENDING_VISUAL`

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

### Corte 6 — Auth/RBAC/Rules técnico previo
- claims5/5 ejecutados;
- Rules release/readback PASS;
- Firestore data writes0;
- Hosting DEV previo1/1 consumido y entrypoint remoto verificado.

## 3. Bloque intermedio P0 — continuidad de credenciales
Causa raíz completa:
- credenciales legacy no materializadas;
- dedupe global de username mezclaba staff/shopper;
- adapter browser necesitaba namespace.

Corrección reusable:
- namespaces `staff`/`shopper`;
- visible `Tipo de acceso + Usuario + Contraseña`;
- Firebase interno por tenant+namespace+username;
- fail-closed sin inferencia por nombre.

## 4. Fuente credential-continuity
- shopper source282;
- safe credential groups109;
- exact duplicate records collapsed93;
- ambiguous groups18 /records77 HOLD;
- staff4 = superadmin1/coordinador2/demo1;
- encrypted bundle113;
- raw PII/credential material repo0.

## 5. Provider activation — PASS
### Auth
`PASS_EXACT_AUTH_IMPORT_READBACK`.
- eligible/imported/readback91/91;
- shopper88 + super1 + coordinador2;
- Auth17→108;
- password resets0/deletes0/overwrite0;
- Firestore/Rules/Hosting writes durante import0.

### Hosting DEV condicionado
`PASS_EXISTING_HOSTING_DEV_CREDENTIAL_CONTINUITY_REMOTE_VERIFIED`.
- ejecutado después de readback91/91;
- mismo site/target;
- deploy adicional1;
- browserAuth/entrypoint/proof/namespaced login PASS;
- preservedLegacyAuthUsers91;
- nuevo Firebase/Hosting0;
- Firestore/Rules/Storage/HR/legacy/payments/functions/Make/Gemini0.

El plan inicial12 queda superseded.

## 6. Bloque en progreso
**Corte6 está técnicamente PASS y pendiente únicamente de validación visual humana con credenciales TyA existentes.**

No compartir passwords por chat. No pedir credenciales técnicas DEV.

## 7. Agosto — pendiente inmediato posterior
- Fuente actual termina julio 2026.
- `Agosto HN` HOLD por inconsistencia país/tab.
- Después de FREEZE Corte6: refresh fuente → resolver HOLD → validar periodo/visitas → materializar solo delta agosto.

## 8. Siguiente bloque exacto
`VISUAL EXISTING TYA CREDENTIALS → FREEZE C6 → AUGUST DELTA → CORTE8 PREPROD/CUTOVER`.

## 9. Claude/prototipo
No nueva candidata. Login visible debe preservar producto y ocultar provider técnico. No tocar `app/modules/*`. Solo corregir ante P0 visual reproducible. P1/P2: PDF gráfica, Excel formato, reportKit/exportaciones y copy.

## 10. Academia
Auth91/91 y Hosting DEV remoto ya son caso práctico cerrado técnicamente. Actualizar identidad provider detrás del acceso, namespaces, usuario ≠ email, recuperación, scopes, shopperId, dedupe seguro, readback y fail-closed.

## 11. Clasificación
- `Reusable CXOrbia`: identity adapter namespaced, Auth hash import, no-overwrite, claims, readback y one-shot deploy.
- `Exclusivo cliente`: credenciales legacy TyA y Agosto HN.
- `Claude/prototipo`: login/registro focalizado solo ante P0 visual.
- `Academia`: identidad/acceso/scopes/namespaces/troubleshooting.
- `Sin impacto Claude`: cifrado, inventories, requests, gates y evidencia provider.

## 12. Estado seguro
R17N histórico1406 ya cerrado. Corte6 previo: claim writes5 + Rules1 + Hosting1. Continuidad: Auth imports91/readback91; password resets/deletes0; Hosting adicional1; Firestore data/Rules/Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; production=false; credenciales crudas0.
