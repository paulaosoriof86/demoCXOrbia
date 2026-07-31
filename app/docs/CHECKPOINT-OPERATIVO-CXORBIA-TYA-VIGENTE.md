# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_P0_OPEN__EXPORT_RECOVERED__PROFILE_HANDOFF_READY__USERNAME88_READY__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

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

Gate estático previo: PASS. No deploy nuevo autorizado.

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
- patrón verificado68;
- patrón NO verificado20.

No mostrar `Nombre123*` como contraseña universal. Firebase Auth no devuelve plaintext vigente. No resetear los 20 por rutina.

## 8. Export perfil extra — RECUPERADO
File Library volvió a responder y se localizó/abrió el export vigente ya entregado `tya-plataforma-default-rtdb-export (6).json`, fecha 2026-07-30. No pedirlo nuevamente.

El schema real confirma campos adicionales de perfil: username/user, WhatsApp, email, país, ciudad, departamento y, según registro, DPI, dirección, fecha de nacimiento, certs/histCerts, términos y metadata de cuenta.

La fuente vieja continúa desacoplada: no se conecta la RTDB.

## 9. Reconciliación v2
`tools/qa/cxorbia-corte6-profile-extra-export-readonly.mjs` quedó endurecido:
- ID estable exacto → `legacyShopperId`;
- no nombre/teléfono/email como llave;
- fill-missing-only;
- no overwrite;
- `_eliminados` excluido;
- pass/password y UID legacy excluidos.

Separación de seguridad:
- operativos candidatos: username, phone, email, country, city, department;
- sensibles HOLD: document/DPI, address, birthDate;
- evidence-only: certs/histCerts, visitas, estado, términos, aprobación/origen y rating.

Las 77 certificaciones y 616 visitas canónicas siguen siendo autoridad; no duplicar con metadata legacy.

## 10. Gate seguro de handoff preparado
La File Library puede mostrar/consultar el export, pero no expone bytes/filesystem path reutilizable por el runner. Para no transcribir PII ni conectar la base vieja se preparó un handoff cifrado único:
- `tools/local/cxorbia-corte6-profile-extra-handoff.html` — OFFLINE; excluye password y UID legacy; cifra valores antes de disco;
- `tools/qa/cxorbia-corte6-profile-extra-handoff-dryrun.mjs` — descifra solo en memoria y compara contra Firestore;
- `.github/workflows/cxorbia-corte6-profile-extra-readonly.yml` — provider read-only; evidencia de salida source-safe;
- `backend/config/corte6-profile-extra-readonly-request.json` — esperando el bundle cifrado, con writes/deploys0.

No se ha ejecutado provider read mediante este nuevo gate porque aún no existe el bundle cifrado.

## 11. Seguridad sensible
Las Rules actuales permiten leer `/tenants/{tenantId}/shoppers/{shopperId}` a roles operador (`super/admin/ops/coordinador`) además del propio shopper. Por eso DPI/dirección/fecha de nacimiento no se materializan en ese documento sin una política protegida explícita. La UI no sustituye la seguridad de Rules.

## 12. Julio/agosto
HR viva y auto-month permanecen PASS. No ejecutar delta agosto hasta cerrar este P0 y congelar Corte6.

## 13. Siguiente bloque exacto
`BUNDLE CIFRADO DEL EXPORT EXISTENTE → READ-ONLY RECONCILIATION AUTOMÁTICA → DELTA OPERATIVO COMBINADO CON USERNAME88 → AUTORIZACIÓN FIRESTORE EXACTA → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL PROTEGIDA → FREEZE C6`.

## 14. Estado seguro
Provider writes0; Firestore/Auth/HR/legacy writes0; password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
