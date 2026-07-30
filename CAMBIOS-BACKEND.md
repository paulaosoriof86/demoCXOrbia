# CAMBIOS-BACKEND.md

## 2026-07-30 — P0 visual reproducible: doble login Auth DEV

Estado: `C6_P0_PROVEN_DOUBLE_LOGIN_FORCED_AUTH_GATE__AUTH91_PRESERVED__NO_NEW_DEPLOY__NO_PRODUCTION`.

### Qué se comprobó
- La captura de Paula muestra un gate separado `Acceso seguro` antes del login normal del proyecto.
- `app/core/backend-browser-auth.js` crea el overlay, intercepta `CX.app.showLogin()`, limpia `CX.session` al cargar y fuerza el gate en preview.
- `app/core/backend-config-preview-dev.js` configura `interactive-session` sin fallback.
- `app/core/backend-firebase.js` exige la autenticación antes de cargar el backend.
- `app/app.js` conserva el login normal tenant-aware.

### Causa raíz
La corrección de continuidad de credenciales preservó Firebase/Auth y `Usuario + Contraseña`, pero implementó Auth como **segunda pantalla visible**. Eso contradice el objetivo aprobado: Firebase debe quedar detrás del adapter y el producto debe presentar un único flujo de acceso.

### Decisión
- Visual actual: **NO APROBADO / P0_PROVEN**.
- No pedir a Paula otra prueba del gate actual, password ni PowerShell.
- No reabrir Auth91/91, claims, Rules, R17N, Corte5 ni Corte3.
- Corrección siguiente: single-login focalizado, sin nueva candidata general ni rediseño.
- No hay autorización vigente para otro Hosting deploy; primero debe quedar el fix y los gates en PASS.

### Documentación
- Creado `app/docs/CORTE6-P0-DOBLE-LOGIN-AUTH-DEV-20260730.md`.
- Actualizados índice vigente, checkpoint, `RESUMEN-PARA-CLAUDE.md` y `PENDIENTES-PROTOTIPO.md`.

### Clasificación
- **Reusable CXOrbia:** un solo login visible, sesión Firebase restaurable y Auth detrás del adapter.
- **Exclusivo cliente:** credenciales legacy TyA.
- **Claude/prototipo:** corrección focalizada del acceso normal.
- **Academia:** acceso único y troubleshooting.
- **Sin impacto Claude:** Auth91/91/import/readback permanecen cerrados.

### Estado seguro
Desde el hallazgo: Auth writes0; Firestore writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false.

---

## 2026-07-30 — Corte 6 continuidad de credenciales: Auth91/91 PASS + Hosting DEV remoto PASS; pendiente visual humana

Estado histórico previo: `C6_CREDENTIAL_CONTINUITY_AUTH91_READBACK_PASS__HOSTING_DEV_REDEPLOY1_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`.

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

### Estado seguro histórico
Auth imports91/readback91; password resets0; deletes0; Firestore data writes0; Rules0; Hosting adicional1; nuevo Firebase/Hosting0; Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false; PII/credenciales crudas repo/artifacts0.

---

## Histórico protegido
Los bloques previos permanecen en Git y en `app/docs/`. No reabrir Corte3, no repetir R17N y no crear nueva candidata/base/Hosting/rama/PR por rutina.
