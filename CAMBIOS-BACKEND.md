# CAMBIOS-BACKEND.md

## 2026-07-30 — Corte 6 continuidad de credenciales: Auth91/91 PASS + Hosting DEV remoto PASS; pendiente visual humana

Estado: `C6_CREDENTIAL_CONTINUITY_AUTH91_READBACK_PASS__HOSTING_DEV_REDEPLOY1_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`.

### Qué se ejecutó con autorización expresa de Paula
1. Se consumió la autorización combinada del Corte 6 para importar **máximo 91** identidades legacy elegibles a Firebase Auth en `cxorbia-backend-dev`.
2. El import exacto terminó `PASS_EXACT_AUTH_IMPORT_READBACK`:
   - importadas91;
   - readback91/91;
   - Auth total17→108;
   - shopper88 + super1 + coordinador2;
   - namespaces shopper88 / staff3;
   - password resets0;
   - deletes0;
   - overwrite0;
   - Firestore data writes0;
   - Rules0;
   - Hosting durante import0.
3. Solo después de ese readback PASS se consumió la misma autorización combinada para **un único redeploy adicional** del Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
4. El redeploy terminó `PASS_EXISTING_HOSTING_DEV_CREDENTIAL_CONTINUITY_REMOTE_VERIFIED`:
   - hosting deploy executions1;
   - browserAuth remoto PASS;
   - entrypoint remoto PASS;
   - proof remoto PASS;
   - `Usuario + Contraseña` namespaced PASS;
   - preservedLegacyAuthUsers91;
   - nuevo Firebase0;
   - nuevo Hosting0;
   - Auth writes durante Hosting0;
   - Firestore/Rules/Storage/HR/legacy/payments/functions/Make/Gemini0.

### Evidencia
- Commit autorización Auth: `38d0203e52d790b76b9bba667a23d447c6b063fe`.
- Commit evidencia Auth/readback: `bd3a479dd455459f0daa4757c8380b0e60aa0693`.
- Commit autorización Hosting DEV: `67eb74a55e34e5c4b829716f0b8594af12778df0`.
- Commit evidencia Hosting remoto: `c3a2c8476e7a91734201600a68e7577b53902f9a`.
- Auth evidence: `app/docs/evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`.
- Hosting evidence: `app/docs/evidence/CORTE6-CREDENTIAL-CONTINUITY-HOSTING-DEPLOY-LATEST.json`.
- Hosting version: `sites/cxorbia-backend-dev/versions/b1bad07277f7e961`.
- Hosting release: `sites/cxorbia-backend-dev/releases/1785442623153000`.

### Causa raíz preservada
El producto TyA conserva `Tipo de acceso + Usuario + Contraseña`; Firebase Auth permanece detrás del adapter. Los namespaces `staff` / `shopper` evitan colisiones falsas de username entre perfiles distintos. No se infiere identidad por nombre.

### Fuente legacy / HOLD preservado
- shopper source282;
- safe credential groups109;
- exact duplicate records collapsed93;
- ambiguous groups18 /records77 HOLD;
- 21 shopper credentials sin perfil canónico exacto HOLD;
- demo role1 HOLD;
- bundle cifrado113;
- PII/login/password/hash legibles en repo0.

El dry-run inicial de12 está superseded y no debe ejecutarse.

### Baseline preservada
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- R17N 1,406/1,406 Firestore data writes/readback; **no repetir**.
- Corte5 `CX.data` PASS: `cinepolis`,14 periodos,616 visitas, periodo `2026-07`, source=firestore/fallback=false.
- Corte6 previo: claim writes5 + Rules release1 + Hosting DEV1/1 ya ejecutados.

### Claude/prototipo
No nueva candidata. No se tocó `app/modules/*`. El login visible debe mantener el contrato namespaced; solo se abre una corrección frontend si la validación visual demuestra un P0 reproducible. P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy de fuentes.

### Academia
Actualizar el estado de la lección: import Auth por hash con readback obligatorio ya ejecutado 91/91; Hosting DEV de continuidad ya verificado; el siguiente gate es validación humana de ingreso con credenciales TyA existentes. Mantener namespaces, scopes, recuperación y fail-closed.

### Siguiente bloque exacto
`VALIDACIÓN VISUAL CON CREDENCIALES TYA EXISTENTES → si PASS, FREEZE CORTE6 → REFRESH HR → RESOLVER HOLD AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER`.

### Clasificación
- **Reusable CXOrbia:** identity adapter namespaced, hash import, claims, fail-closed, no-overwrite, readback obligatorio y one-shot deploy.
- **Exclusivo cliente:** credenciales legacy TyA y Agosto HN HOLD.
- **Claude/prototipo:** login/registro focalizado solo ante P0 visual reproducible.
- **Academia:** acceso, namespaces, recuperación, scopes, import/readback y troubleshooting.
- **Sin impacto Claude:** import provider, evidencias, requests/workflows y Hosting DEV one-shot.

### Estado seguro
Bloque credential-continuity ejecutado: Auth imports91/readback91; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional1; nuevo Firebase/Hosting0; Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false; PII/credenciales crudas repo/artifacts0.

---

## Histórico protegido
Los bloques previos permanecen en Git y en `app/docs/`. No reabrir Corte3, no repetir R17N y no crear nueva candidata/base/Hosting/rama/PR por rutina.
