# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_P0_OPEN__PROTECTED_PROFILE_AUTH_HISTORY_READONLY_PASS__88_USERNAME_DELTA_READY__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Cloud Run `cxorbia-live-hr-dev`; Hosting `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. No reabrir
- Corte3 FROZEN.
- R17N 1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 3. Human visual P0 — sigue abierto
La visual anterior probó `shopperId=null` en portal Shopper y perfil Admin incompleto porque se estaba usando `display_name_only` source-safe. Corte6 no está congelado.

## 4. Read-only protegido — PASS
Gate `PASS_C6_PROTECTED_PROFILE_AUTH_HISTORY_READONLY`.

Firestore shoppers340:
- nombre313;
- phone123;
- email39;
- username0;
- documento0;
- banco/pago0;
- certs embebidos0;
- legacyShopperId120.

Auth108:
- rol shopper92;
- shopper claims con shopperId91;
- claims→perfil existente91/91;
- missing profile0.

Visitas616:
- con shopperId616/616;
- IDs shopper distintos194;
- perfiles existentes194/194;
- estados: submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

Conclusión: login shopper e histórico completo pueden resolverse por IDs estables. El subconteo KPI estaba demostrado por la semántica legacy estrecha.

## 5. Fix de runtime preparado — sin deploy
- protected preview ya no es degradado a source-safe;
- watcher HR source-safe no sobrescribe CX.data en protected runtime;
- aliases de teléfono/WhatsApp/email/documento/banco/username solo desde datos reales existentes;
- `shopperStats/visitsForShopper` en protected runtime reconocen `submitida` y todo el histórico exacto por shopperId;
- no se sintetiza password.

Node syntax + marcadores anti-regresión: PASS dentro del gate read-only.

## 6. Username exacto — dry-run PASS
Desde el mismo handoff cifrado de credenciales:
- shopper records109;
- match canónico exacto88;
- binding exacto Auth claim→perfil88/88;
- delta `fill-missing username`88;
- conflicto existente0;
- 21 sin perfil exacto siguen HOLD.

No hubo Firestore write. Esos 88 requieren autorización Firestore específica antes de materializar.

## 7. Password
Auth y el handoff prueban continuidad mediante hash, no plaintext recuperable. No guardar password en Firestore/JS/repo. Contraseña inicial solo si se prueba criptográficamente o mediante fuente segura; si no, reset controlado con autorización Auth.

## 8. Datos extra del perfil
Teléfono/email ya existentes se verán al entrar por protected runtime.

Documento, banco/pago y otros datos aportados por shopper que existan en la plataforma vigente requieren reconciliación segura desde el export ya entregado, por export/import cifrado; nunca conexión a la RTDB vieja.

## 9. Julio/agosto
HR viva y auto-month permanecen PASS. No ejecutar delta agosto hasta cerrar este P0 y congelar Corte6.

## 10. Documentación viva
- `CAMBIOS-BACKEND-ADDENDUM-C6-VISUAL-FAIL-SHOPPER-IDENTITY-PROFILE-20260731.md`.
- `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-PROFILE-AUTH-HISTORY-READONLY-PASS-20260731.md`.
- `CAMBIOS-BACKEND-ADDENDUM-C6-USERNAME-DELTA-READONLY-PASS-20260731.md`.
- evidencias `CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json` y `CORTE6-USERNAME-DELTA-READONLY-LATEST.json`.
- root `RESUMEN-PARA-CLAUDE.md` / `PENDIENTES-PROTOTIPO.md` sincronizados.

## 11. Siguiente bloque exacto
`PREPARAR WRITE PLAN USERNAME88 SIN EJECUTAR + RECONCILIAR PERFIL EXTRA DEL EXPORT DE FORMA CIFRADA → AUTORIZACIONES EXACTAS SI APLICAN → REDEPLOY HOSTING DEV NUEVO → HUMAN VISUAL PROTEGIDA → FREEZE C6`.

## 12. Estado seguro
Provider reads sí; Firestore/Auth/HR/legacy writes0; password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
