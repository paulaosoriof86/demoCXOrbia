# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_FULL_V2_READONLY_PASS__WRITE_PLAN_PREPARED__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS; no reimportar/resetear por rutina.
- HR live/auto-month PASS.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 2. P0 Shopper/perfil
La visual anterior falló porque Shopper quedó sin shopperId y Admin usó display-only source-safe. Corte6 sigue abierto hasta write/readback + runtime protegido + validación visual.

## 3. Histórico/KPI
616/616 visitas con shopperId;194 perfiles referenciados194/194. Runtime fix preparado para ciclo canónico incluyendo `submitida`. No rediseñar módulo.

## 4. Perfil completo — V2 read-only PASS
Gate `PASS_C6_PROFILE_FULL_V2_READONLY`.

- registros fuente151;
- exactos `legacyShopperId`120;
- missing canonical31 HOLD;
- ambiguos0; badRecord0;
- docs existentes con cambio120;
- campos planificados329;
- password presente149;
- PII sensible presente27.

Campos planificados sobre los120 exactos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2.

Nombre, WhatsApp/teléfono, email, país y ciudad ya coinciden para esos120 y no necesitan write.

## 5. 31 perfiles sin canonical — HOLD real
No crear ni emparejar automáticamente por nombre/teléfono/email. Deben resolverse por identidad estable en bloque posterior. No impiden actualizar de forma segura los120 perfiles exactos, pero sí impiden declarar migración legacy total.

## 6. Primer intento V2
El primer read-only falló antes del provider por un chunk cifrado incorrecto (`part-007`). Se restauró el blob exacto y el retry terminó PASS. Request read-only consumida correctamente; provider writes0.

## 7. Write plan — preparado, NO autorizado
`backend/config/corte6-profile-full-firestore-write-plan-v2.json` y `backend/config/corte6-profile-full-firestore-write-request-v2.json` preparados.

Alcance máximo futuro:
-120 Firestore document writes sobre perfiles existentes exactos;
-329 valores de perfil;
- Auth/password reset0;
- Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0;
- producción=false; merge=false.

No ejecutar hasta autorización explícita.

## 8. Fuente y precedencia
El export `tya-plataforma-default-rtdb-export (6).json` del2026-07-30 manda para campos actuales de perfil. Las616 visitas y77 certificaciones canónicas siguen siendo autoridad y no se sustituyen con `certs/histCerts/visitas/activo/rating` legacy.

## 9. Password
Mostrar únicamente el password legado real proveniente del export protegido. Firebase Auth sigue siendo autoridad del login. No inferir patrón ni resetear Auth por rutina; nunca publicar credenciales en repo/docs/logs.

## 10. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 11. Agosto
No ejecutar delta agosto hasta cerrar P0 y congelar Corte6.

## 12. Siguiente bloque
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOC WRITES → WRITE+READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → VISUAL ADMIN+SHOPPER → RESOLVER31 HOLD → FREEZE C6 → AGOSTO`.

Producción/merge siguen bloqueados.
