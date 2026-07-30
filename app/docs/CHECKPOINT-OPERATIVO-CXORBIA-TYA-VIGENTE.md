# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `C6_CREDENTIAL_CONTINUITY_AUTH91_READBACK_PASS__HOSTING_DEV_REDEPLOY1_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

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

## 4. Continuidad de credenciales — causa raíz resuelta
- login visible `Tipo de acceso + Usuario + Contraseña`;
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

## 5. Auth exacto — PASS
Autorización combinada consumida.

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

## 6. Hosting DEV continuidad — PASS
Se ejecutó únicamente después del readback91/91 y con la misma autorización combinada.

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

## 7. Gate vivo
`HUMAN_VISUAL_LOGIN_WITH_EXISTING_TYA_CREDENTIALS`.

Corte6 está técnicamente PASS, pero no se congela hasta que Paula valide el acceso visual con credenciales TyA existentes. No pedir passwords por chat ni credenciales técnicas DEV.

## 8. Agosto
- Fuente materializada llega hasta julio 2026:14 periodos/616 visitas.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después de FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 9. Claude / prototipo
- No nueva candidata.
- No tocar `app/modules/*` desde backend.
- Solo tarea focalizada si la visual demuestra P0 reproducible.
- P1/P2 no bloqueante: PDF sin gráfica, Excel sin formato final, reportKit/exportaciones y copy de fuentes.

## 10. Academia
Actualizar: Auth91/91 ya ejecutado, Hosting DEV remoto PASS, namespaces staff/shopper, usuario ≠ email provider, recuperación/cambio, tenant/proyecto/rol, shopperId exacto, dedupe seguro y fail-closed.

## 11. Clasificación
- `Reusable CXOrbia`: identity adapter namespaced, hash import, Auth/claims, readback, one-shot deploy y fail-closed.
- `Exclusivo cliente`: credenciales legacy TyA y Agosto HN.
- `Claude/prototipo`: UX focalizada de login solo ante P0 visual.
- `Academia`: acceso, recuperación, scopes, namespaces y troubleshooting.
- `Sin impacto Claude`: provider import/evidence/requests/gates.

## 12. Estado seguro
R17N previo:1,406 Firestore data writes cerrados. Corte6 previo: Auth claim writes5 + Rules release1 + Hosting DEV1/1. Continuidad: Auth imports91/readback91; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional1; Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false; credenciales/PII crudas repo/artifacts0.

## 13. Siguiente bloque exacto
`VALIDACIÓN VISUAL LOGIN TYA EXISTENTE → APROBADO/FREEZE CORTE6 → REFRESH HR → RESOLVER AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER`.
