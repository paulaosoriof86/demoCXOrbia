# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_P0_OPEN__PROTECTED_READONLY_PASS__USERNAME88_READY__PASSWORD68_PATTERN_VERIFIED_20_NONPATTERN__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

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

## 5. Fix de runtime preparado — sin deploy
- protected preview ya no es degradado a source-safe;
- watcher HR source-safe no sobrescribe CX.data en protected runtime;
- aliases de teléfono/WhatsApp/email/documento/banco/username solo desde datos reales existentes;
- `shopperStats/visitsForShopper` protegidos reconocen `submitida` y todo el histórico exacto por shopperId;
- no se sintetiza password.

Node syntax + marcadores anti-regresión: PASS.

## 6. Username exacto — dry-run PASS
Desde el mismo handoff cifrado de credenciales:
- shopper records109;
- match canónico exacto88;
- binding exacto Auth claim→perfil88/88;
- delta `fill-missing username`88;
- conflicto existente0;
- 21 sin perfil exacto siguen HOLD.

Plan Firestore `fill-missing-only` creado y deshabilitado; requiere autorización específica antes de escribir.

## 7. Contraseña inicial — verificación criptográfica read-only
Comparación SHA256 contra el patrón histórico `CapitalizedFirstName + 123*`:
- exactos evaluables88;
- patrón verificado: **68**;
- patrón NO verificado: **20**;
- missing name0; hashes inválidos0.

Conclusión: no se puede mostrar `Nombre123*` como contraseña universal. Para 68 puede rotularse `patrón inicial verificado`; los 20 deben preservar su credencial histórica o pasar por reset Auth autorizado. Firebase Auth no devuelve plaintext vigente.

## 8. Datos extra del perfil
Teléfono/email ya existentes se verán al entrar por protected runtime.

El export vigente de `tya_shoppers_extra` conserva campos operativos adicionales como WhatsApp/email/país/ciudad/DPI y credenciales históricas para parte de los registros. La File Library actualmente falla al recuperar el archivo ya entregado; no se pide reenvío mientras se intenta recuperar ese insumo. No conectar RTDB vieja.

## 9. Julio/agosto
HR viva y auto-month permanecen PASS. No ejecutar delta agosto hasta cerrar este P0 y congelar Corte6.

## 10. Siguiente bloque exacto
`RECUPERAR/RECONCILIAR EXPORT PERFIL EXTRA → COMBINAR CON USERNAME88 EN DELTA FIRESTORE EXACTO → AUTORIZACIÓN ESPECÍFICA → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL PROTEGIDA → FREEZE C6`.

## 11. Estado seguro
Provider reads sí; Firestore/Auth/HR/legacy writes0; password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
