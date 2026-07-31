# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_FULL_READONLY_PASS__31_IDENTITY_HOLD_PROVEN__WRITE_GATE_READY__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.
- PR#7 draft/open/no merge; producción intacta.

## 2. P0 visual
La visual anterior probó Shopper `shopperId=null`, Admin sobre `display_name_only` e histórico/KPI incompletos. Corte6 sigue abierto hasta write/readback + redeploy protegido + visual humana.

## 3. Protected runtime
Firestore shoppers340; Auth shopper claims con shopperId91 y perfil existente91/91; histórico616/616 con shopperId; perfiles referenciados194/194. Runtime fix preparado sin deploy para protected lane, perfil real e histórico/KPI por shopperId incluyendo `submitida`.

## 4. Perfil completo operativo
La consola autenticada debe mostrar toda la información disponible del shopper proveniente del export vigente, incluidos datos personales, username y password legado real. No sintetizar password. Firebase Auth sigue siendo autoridad de autenticación. PII/password nunca en repo/logs/evidencia source-safe.

## 5. V2 full-profile read-only — PASS
151 registros fuente;120 match exactos `legacyShopperId`;31 sin canonical; ambiguos0; badRecord0;329 valores de perfil planificados.

Campos a escribir sobre los120 exactos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2. Nombre/WhatsApp/email/país/ciudad ya coinciden.

## 6. Los31 faltantes fueron investigados antes de pedir write
Se ejecutaron dos bridges read-only adicionales para evitar autorizaciones sucesivas:
- Auth bridge exacto `username único → UID determinístico → custom claim shopperId → Firestore`:0 resueltos. De31:2 sin username,10 usernames duplicados,19 sin Auth user determinístico.
- V3 technical-key exacto/único (`docId/sourceKey/shopperId/legacyId/externalId/externalShopperId/sourceId`) y luego Auth bridge:0 resueltos;0 candidatos técnicos únicos/ambiguos/colisiones.

Conclusión: los31 no tienen vínculo canónico reproducible hoy. Permanecen HOLD; no se deduplican por nombre/teléfono/email ni se crean silenciosamente.

## 7. Primer intento V2 — causa raíz corregida
El primer read-only falló antes del provider por checksum de `part-007.txt`. Se restauró exactamente el blob original; request seguía no consumida. Retry PASS; provider writes0 en el FAIL.

## 8. Write gate completo preparado — NO autorizado
Listos:
- plan rebasado sobre V3;
- request disabled/sin authorizationId;
- executor fail-closed;
- workflow one-shot.

V3 confirmó118 documentos con cambios reales de campos +2 marker-only =120 documentos máximos. El executor fue corregido para reflejar exactamente ese contrato. Antes de escribir revalida bundle SHA,151/120/31,118+2 y329 valores; cualquier drift falla antes de mutation. Readback obligatorio de todos los documentos/campos.

Auth/password reset0; Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0; producción=false; merge=false.

## 9. Precedencia
Export vigente manda para perfil actual. Las616 visitas y77 certificaciones canónicas siguen siendo autoridad; `certs/histCerts/visitas/activo/rating` legacy no las sustituyen.

## 10. Claude/prototipo
No nueva candidata ni rediseño. La UI ya contempla usuario/contraseña; backend protegido debe entregar valores reales cuando existan. Tocar módulos UI solo si el adapter entrega el dato correctamente y la UI aun no lo refleja.

## 11. Siguiente gate
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOC WRITES → WRITE+READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → HUMAN VISUAL ADMIN+SHOPPER → BLOQUE EXPLÍCITO DE ALTA/CONCILIACIÓN DE31 HOLD → FREEZE C6 → AGOSTO`.
