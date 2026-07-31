# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_FULL_READONLY_PASS__31_IDENTITY_HOLD_PROVEN__WRITE_GATE_READY__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Cloud Run `cxorbia-live-hr-dev`; Hosting `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. No reabrir
- Corte3 FROZEN.
- R17N1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 3. Human visual P0
Visual anterior: Shopper `shopperId=null` y Admin incompleto por source-safe display-only. Corte6 sigue abierto hasta write/readback + redeploy protegido + validación visual.

## 4. Protected baseline/runtime
Firestore shoppers340; Auth shopper claims con shopperId91 y perfil existente91/91; visitas616/616 con shopperId; perfiles referenciados194/194. Runtime fix preparado sin deploy para perfil real e histórico/KPI canónico incluido `submitida`.

## 5. Perfil completo read-only — PASS
Bundle V2 cifrado:151 registros;120 exactos `legacyShopperId`;31 sin canonical;0 ambiguos/invalid;329 valores planificados. De los120 exactos,118 tienen cambios de campos y2 solo marcador de procedencia.

Campos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2. Nombre/WhatsApp/email/país/ciudad ya coinciden.

Primer intento V2 falló antes del provider por checksum de `part-007`; se restauró blob exacto y retry PASS. Provider writes0.

## 6. 31 identity HOLD — comprobado
Se intentó reducirlos antes de pedir autorización:
- bridge Auth determinístico + custom claim:0 resueltos;2 sin username,10 username duplicado,19 sin Auth user;
- bridge V3 por llave técnica exacta/única (`docId/sourceKey/shopperId/legacyId/externalId/externalShopperId/sourceId`) y luego Auth:0 resueltos;0 candidatos técnicos.

No existe vínculo canónico reproducible para esos31. No match por nombre/teléfono/email ni creación silenciosa.

## 7. Write gate preparado — NO autorizado
Plan/request disabled, executor y workflow one-shot listos. Executor revalida SHA,151/120/31,118+2 y329 valores antes de mutation. Máximo120 Firestore document writes sobre perfiles existentes exactos + readback total. Auth/password reset0; demás providers/deploys0; producción=false; merge=false.

## 8. Perfil/password e histórico
Consola operativa autenticada debe mostrar perfil completo disponible, incluido password legacy real; Firebase Auth sigue siendo autoridad de login. PII/password no se publican en repo/logs. Export manda para perfil actual;616 visitas y77 certificaciones canónicas mandan para histórico/certificación.

## 9. Julio/agosto
HR live/auto-month PASS. No ejecutar delta agosto hasta cerrar P0 y congelar Corte6.

## 10. Siguiente bloque exacto
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOC WRITES → WRITE+READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → VISUAL ADMIN+SHOPPER → ALTA/CONCILIACIÓN EXPLÍCITA31 HOLD → FREEZE C6 → AGOSTO`.

## 11. Estado seguro
Read-only gates consumidos PASS. Firestore/Auth/HR/legacy writes0; Auth password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
