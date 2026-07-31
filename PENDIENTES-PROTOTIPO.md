# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_P0_OPEN__FULL_PROFILE_SCOPE_AUTHORIZED__V2_HANDOFF_READY__WAITING_V2_ENCRYPTED_BUNDLE__NO_PROVIDER_WRITE__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS; no reimportar/resetear por rutina.
- HR live/auto-month PASS.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 2. P0 Shopper/perfil
La visual anterior falló porque Shopper quedó sin shopperId y Admin estaba usando display-only source-safe. Read-only protegido confirma que91/91 shopper claims resuelven perfil real.

## 3. Histórico/KPI
616/616 visitas con shopperId;194 perfiles referenciados194/194. Runtime fix preparado para ciclo canónico incluyendo `submitida`. No rediseñar módulo.

## 4. Username/Auth
Dry-run previo:109 registros shopper;88 exactos stable-ID + Auth claim; username plan88; conflictos0;21 HOLD. Auth91/91 no se reabre.

## 5. Perfil completo requerido
Paula confirmó que la parte operativa debe ver toda la información disponible del shopper en la plataforma anterior, incluidos datos personales, username y password. El hardening se posterga y no bloquea el cierre actual.

El perfil completo debe provenir del export vigente, nunca de valores sintetizados.

## 6. V1 recibido — pendiente corregido
El bundle V1 está cifrado pero no sirve como fuente final de write: rawRows282; encryptedRecords151; duplicateStableIds130; password excluido. No usarlo para materializar.

## 7. V2 preparado
V2 fusiona duplicados por ID estable, conserva conflictos cifrados e incluye perfil completo, PII, username y password. Runner provider read-only compara solo por `legacyShopperId exact` y produce conteos exactos de cambios sin exportar valores.

Archivos:
- `tools/local/cxorbia-corte6-profile-full-handoff-v2.html`;
- `tools/qa/cxorbia-corte6-profile-full-handoff-dryrun-v2.mjs`;
- `.github/workflows/cxorbia-corte6-profile-full-readonly-v2.yml`;
- `backend/config/corte6-profile-full-readonly-v2-request.json`.

## 8. Fuente y precedencia
El export `tya-plataforma-default-rtdb-export (6).json` del2026-07-30 es source-of-truth para campos de perfil. Las616 visitas y77 certificaciones canónicas siguen siendo autoridad y no deben sobrescribirse con contadores/arrays legacy.

## 9. Password
Mostrar únicamente el password real presente en el export vigente. Firebase Auth sigue siendo autoridad de login. No inferir patrón, no resetear por rutina y no escribir credenciales en repo/docs/logs.

## 10. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 11. Agosto
No ejecutar delta agosto hasta cerrar P0 y congelar Corte6.

## 12. Siguiente bloque
`GENERAR BUNDLE V2 COMPLETO → READ-ONLY V2 AUTOMÁTICO → WRITE PLAN EXACTO PERFIL COMPLETO + USERNAME → AUTORIZACIÓN FIRESTORE → READBACK → REDEPLOY DEV → VISUAL PROTEGIDA`.

Producción/merge siguen bloqueados.
