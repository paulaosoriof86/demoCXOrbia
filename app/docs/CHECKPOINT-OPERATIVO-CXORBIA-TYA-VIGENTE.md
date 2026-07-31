# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_FULL_V2_READONLY_PASS__WRITE_PLAN_PREPARED__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Cloud Run `cxorbia-live-hr-dev`; Hosting `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. No reabrir
- Corte3 FROZEN.
- R17N 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 3. Human visual P0
La visual anterior probó `shopperId=null` en portal Shopper y perfil Admin incompleto por `display_name_only` source-safe. Corte6 sigue abierto hasta write/readback + redeploy protegido + validación visual.

## 4. Protected baseline
Firestore shoppers340; Auth shopper claims con shopperId91 y perfil existente91/91. Visitas616/616 con shopperId; perfiles referenciados194/194. Runtime fix preparado para protected lane e histórico/KPI canónico incluyendo `submitida`; sin deploy nuevo.

## 5. Perfil completo V2 — READ-ONLY PASS
El bundle V2 cifrado del export vigente se ensambló, verificó por SHA-256, descifró solo en memoria y comparó contra Firestore DEV.

Gate final: `PASS_C6_PROFILE_FULL_V2_READONLY`.

Resultado:
- registros151;
- exactos por `legacyShopperId`:120;
- missing canonical31 HOLD;
- ambiguos0; badRecord0;
- documentos exactos con cambios120;
- valores de perfil planificados329;
- fuente con password149;
- fuente con DPI/dirección/fecha nacimiento27.

Plan de campos en los120 exactos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2. Nombre, teléfono/WhatsApp, email, país y ciudad ya coinciden y no requieren write.

## 6. Primer intento V2 — corregido antes de provider
El primer gate falló por checksum del transporte cifrado. `part-007.txt` tenía blob distinto del chunk original. Se restauró exactamente el blob esperado; la request seguía no consumida. Retry PASS. Provider writes0 durante el FAIL.

## 7. Write gate preparado — NO autorizado
- `backend/config/corte6-profile-full-firestore-write-plan-v2.json`;
- `backend/config/corte6-profile-full-firestore-write-request-v2.json`.

Alcance futuro máximo:120 Firestore document writes sobre perfiles existentes exactos y329 valores de perfil. Los31 missing canonical permanecen HOLD y no se crean ni emparejan por nombre/teléfono/email.

Auth/password reset0; Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0; producción=false; merge=false.

## 8. Perfil y password
La consola operativa autenticada debe mostrar el perfil completo que exista en la plataforma anterior. Password visible solo desde valor legacy real; Firebase Auth sigue siendo autoridad de autenticación. PII/password no aparecen en repo, logs ni evidencia source-safe.

## 9. Precedencia histórica
El export vigente manda para campos de perfil actual. Las616 visitas y77 certificaciones canónicas siguen siendo autoridad; `certs`, `histCerts`, `visitas`, `activo`, `rating` legacy no sobrescriben histórico canónico.

## 10. Julio/agosto
HR viva y auto-month permanecen PASS. No ejecutar delta agosto hasta cerrar P0 y congelar Corte6.

## 11. Siguiente bloque exacto
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOC WRITES → WRITE DESDE BUNDLE CIFRADO + READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → VISUAL ADMIN+SHOPPER → RESOLVER31 HOLD → FREEZE C6 → AGOSTO`.

## 12. Estado seguro
Read-only request consumida PASS. Firestore/Auth/HR/legacy writes0; password changes Auth0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
