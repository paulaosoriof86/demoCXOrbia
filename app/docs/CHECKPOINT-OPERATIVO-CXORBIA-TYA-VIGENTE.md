# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `C6_P0_PROVEN_DOUBLE_LOGIN_FORCED_AUTH_GATE__AUTH91_PRESERVED__NO_NEW_DEPLOY__NO_PRODUCTION`

## 1. Repositorio y destinos fijos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- No nueva base/Hosting/rama/PR/candidata.

## 2. Baseline que no se reabre
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL DEV:1,406/1,406 Firestore data writes/readback; mismatch0.
- Materializado: foundation16 + perfiles125 + certificaciones77 + visitas616 + controles liquidación572.
- Corte 5 `CX.data`: source=firestore, fallback=false, project=`cinepolis`, periods14, visits616, currentPeriodId=`2026-07` PASS.
- No repetir los1,406 writes históricos.

## 3. Corte 6 previo preservado
- Claims autorizados:5/5.
- Rules release/readback SHA exacto PASS.
- Firestore data writes Corte6 previo:0.
- Hosting DEV previo:1/1 consumido, release/version FINALIZED, entrypoint PASS.

## 4. Continuidad de credenciales preservada
- namespaces `staff` / `shopper`;
- identidad Firebase interna determinística por tenant+namespace+username;
- no correo técnico visible;
- no password/token/UID persistido;
- claims verifican namespace/rol fail-closed.

Fuente source-safe:
- shoppers fuente282;
- credential groups109;
- exact duplicates collapsed93;
- ambiguous groups18/77 HOLD;
- staff4;
- bundle cifrado113;
- PII/login/password/hash legible repo0.

## 5. Auth exacto — PASS preservado
`PASS_EXACT_AUTH_IMPORT_READBACK`:
- imported91;
- readback91/91;
- shopper88;
- super1;
- coordinador2;
- Auth17→108;
- password resets0;
- deletes0;
- overwrite0;
- Firestore data writes0;
- Rules0;
- Hosting deploys durante import0.

HOLD preservado:
- 21 shopper credentials sin match canónico exacto;
- demo role1;
- conflictos/ambiguos no se resuelven por inferencia.

## 6. Hosting DEV continuidad — PASS técnico preservado
`PASS_EXISTING_HOSTING_DEV_CREDENTIAL_CONTINUITY_REMOTE_VERIFIED`:
- site `cxorbia-backend-dev`;
- target `cxorbia-dev`;
- hosting deploy executions1;
- browserAuth remoto true;
- entrypoint true;
- proof true;
- usernamePasswordNamespaced true;
- preservedLegacyAuthUsers91;
- nuevo Firebase0;
- nuevo Hosting0;
- Auth writes durante Hosting0;
- Firestore/Rules/Storage/HR/legacy/payments/functions/Make/Gemini0.

Evidencia:
- version `sites/cxorbia-backend-dev/versions/b1bad07277f7e961`;
- release `sites/cxorbia-backend-dev/releases/1785442623153000`;
- commit Auth evidence `bd3a479dd455459f0daa4757c8380b0e60aa0693`;
- commit Hosting evidence `c3a2c8476e7a91734201600a68e7577b53902f9a`.

## 7. P0 visual reproducible — doble login / gate Auth visible
Paula validó visualmente el Hosting DEV y **NO lo aprobó**.

Evidencia humana:
- aparece primero un overlay separado `Acceso seguro` con `Tipo de acceso + Usuario + Contraseña`;
- este paso no pertenece al flujo habitual del producto y añade una autenticación separada antes del login normal;
- al probar credenciales operativas conocidas puede mostrarse el error genérico de validación;
- no se requiere pedir la contraseña por chat ni repetir este intento para demostrar el problema de doble login.

Causa raíz comprobada en código:
1. `app/core/backend-browser-auth.js` crea el overlay full-screen.
2. El mismo archivo reemplaza `CX.app.showLogin()` en preview, limpia `CX.session` al cargar y fuerza el overlay.
3. `app/core/backend-config-preview-dev.js` fija `interactive-session` y deshabilita fallback almacenado.
4. `app/core/backend-firebase.js` exige `ensurePreviewAuth()` antes de cargar el backend.
5. El login normal del proyecto continúa existiendo en `app/app.js`/`app/index-backend-dev.html`.

Conclusión: Firebase Auth sí debe conservarse como autoridad, pero el gate visible adicional es un **desvío de implementación**. Firebase debía quedar detrás del adapter, no convertirse en una segunda pantalla de acceso.

Documento de evidencia: `CORTE6-P0-DOBLE-LOGIN-AUTH-DEV-20260730.md`.

## 8. Gate vivo corregido
`P0 FOCAL SINGLE-LOGIN ROUTE → GATES → AUTORIZACIÓN DE UN REDEPLOY DEV SOLO SI EL BUILD PASS → SMOKE REMOTO → VALIDACIÓN VISUAL → FREEZE CORTE6`.

No pedir a Paula otra prueba del gate actual. No pedir passwords. No PowerShell.

## 9. Agosto
- Fuente materializada llega hasta julio 2026:14 periodos/616 visitas.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después de FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 10. Claude / prototipo
- No nueva candidata.
- No tocar `app/modules/*` desde backend.
- La corrección frontend permitida es únicamente focalizada al P0 reproducible de login.
- Objetivo UX: **un solo flujo visible**; Firebase/Auth/claims detrás del adapter.
- P1/P2 no bloqueante: PDF sin gráfica, Excel sin formato final, reportKit/exportaciones y copy de fuentes.

## 11. Academia
Actualizar: un solo flujo de acceso visible; Firebase/provider detrás del producto; namespaces staff/shopper internos; recuperación/cambio de contraseña, tenant/proyecto/rol, shopperId exacto, dedupe seguro y troubleshooting sin doble login.

## 12. Clasificación
- `Reusable CXOrbia`: identity adapter namespaced, sesión restaurable, Auth/claims detrás de un único login y fail-closed.
- `Exclusivo cliente`: credenciales legacy TyA y Agosto HN.
- `Claude/prototipo`: corrección focalizada single-login ya demostrada P0.
- `Academia`: acceso único, recuperación, scopes y troubleshooting.
- `Sin impacto Claude`: provider import/readback ya cerrado.

## 13. Estado seguro
R17N previo:1,406 Firestore data writes cerrados. Corte6 previo: Auth claim writes5 + Rules release1 + Hosting DEV1/1. Continuidad: Auth imports91/readback91; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional1 ya consumido; desde el hallazgo P0: Auth writes0, Firestore0, Rules0, Hosting deploy0, Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false.

## 14. Siguiente bloque exacto
`CORREGIR P0 DE DOBLE LOGIN SIN REABRIR AUTH/HISTÓRICO → GATES → SOLO DESPUÉS PEDIR AUTORIZACIÓN DE REDEPLOY DEV → VISUAL → FREEZE CORTE6 → AGOSTO DELTA`.
