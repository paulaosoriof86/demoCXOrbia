# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_P0_OPEN__FULL_PROFILE_SCOPE_AUTHORIZED__V2_HANDOFF_READY__WAITING_V2_ENCRYPTED_BUNDLE__NO_PROVIDER_WRITE__NO_DEPLOY__NO_PRODUCTION`

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
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 3. Human visual P0 — sigue abierto
La visual anterior probó `shopperId=null` en portal Shopper y perfil Admin incompleto porque se estaba usando `display_name_only` source-safe. Corte6 no está congelado.

## 4. Protected read-only — PASS
Firestore shoppers340; phone123; email39; username0; documento0; banco/pago0.

Auth108: shopper claims con shopperId91; claims→perfil existente91/91.

Visitas616: 616/616 con shopperId; 194 perfiles referenciados194/194; submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

## 5. Runtime fix preparado — sin deploy
Protected runtime ya no se degrada a source-safe; watcher no sobrescribe CX.data protegido; histórico/KPI reconoce estados canónicos incluyendo `submitida`. Gate estático previo PASS. No deploy nuevo autorizado.

## 6. Username/Auth
Desde handoff cifrado previo: shopper109; match exacto88; Auth claim binding88/88; username fill/update plan88; conflictos0;21 HOLD. Auth91/91 permanece cerrado.

## 7. Decisión operativa sobre perfil completo
Paula autorizó que la parte operativa vea la información completa del shopper como existe hoy en la plataforma anterior, incluyendo datos personales, username y password legado visible. El endurecimiento posterior no bloquea Corte6.

Esto elimina el HOLD funcional previo sobre DPI/dirección/fecha de nacimiento dentro del perfil operativo autenticado. Sigue prohibido publicar valores en repo, logs o evidencia source-safe.

## 8. Export vigente recuperado
File Library recuperó `tya-plataforma-default-rtdb-export (6).json` del 2026-07-30. No pedirlo nuevamente y nunca conectar la RTDB legacy.

## 9. Handoff V1 — NO apto para write
El bundle V1 recibido quedó validado como cifrado, pero su resumen reportó 282 filas,151 registros cifrados y130 IDs estables duplicados; además excluía password. Por tanto no se usa para materializar el perfil.

## 10. V2 preparado
- `tools/local/cxorbia-corte6-profile-full-handoff-v2.html`: procesa offline, fusiona duplicados del mismo ID y cifra perfil completo incluido password/PII.
- `tools/qa/cxorbia-corte6-profile-full-handoff-dryrun-v2.mjs`: descifra solo en memoria y compara Firestore read-only por `legacyShopperId exact`.
- `.github/workflows/cxorbia-corte6-profile-full-readonly-v2.yml`: ejecuta solo provider reads y persiste evidencia sin valores.
- `backend/config/corte6-profile-full-readonly-v2-request.json`: espera bundle V2 y mantiene todos los writes/deploys en0.

El export vigente será source-of-truth para campos de perfil. Las616 visitas y77 certificaciones canónicas permanecen autoridad y no serán reemplazadas por contadores/arrays legacy.

## 11. Password
El password del export vigente puede migrarse para paridad visual/operativa en el perfil protegido. No se escribe en GitHub/logs/evidencia. Firebase Auth continúa siendo la autoridad de autenticación; el valor mostrado es continuidad legacy.

## 12. Julio/agosto
HR viva y auto-month permanecen PASS. No ejecutar delta agosto hasta cerrar este P0 y congelar Corte6.

## 13. Siguiente bloque exacto
`GENERAR BUNDLE V2 COMPLETO DEL MISMO EXPORT → READ-ONLY V2 AUTOMÁTICO → WRITE PLAN EXACTO PERFIL COMPLETO + USERNAME → AUTORIZACIÓN FIRESTORE → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL PROTEGIDA → FREEZE C6`.

## 14. Estado seguro
Provider writes0; Firestore/Auth/HR/legacy writes0; password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
