# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_FULL_READONLY_PASS__31_IDENTITY_HOLD_PROVEN__WRITE_GATE_READY__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS; no reimportar/resetear por rutina.
- HR live/auto-month PASS.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 2. P0 Shopper/perfil
Visual anterior: Shopper sin shopperId y Admin en source-safe display-only. Corte6 sigue abierto hasta write/readback + runtime protegido + validación visual.

## 3. Histórico/KPI
616/616 visitas con shopperId;194 perfiles referenciados194/194. Runtime fix preparado para ciclo canónico incluyendo `submitida`. No rediseñar módulo.

## 4. Perfil completo — read-only PASS
151 registros fuente;120 exactos `legacyShopperId`;31 sin canonical;0 ambiguos/invalid;329 valores de perfil planificados. En los120 exactos:118 docs tienen cambios reales de campos y2 solo marcador de procedencia, por lo que el gate máximo sigue siendo120 docs.

Campos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2. Nombre/WhatsApp/email/país/ciudad ya coinciden.

## 5. 31 perfiles sin canonical — HOLD comprobado por tres rutas
No se dejó este universo sin revisar:
- legacyShopperId exact: sin canonical31;
- technical-key V3 (`docId/sourceKey/shopperId/legacyId/externalId/externalShopperId/sourceId` exacto y único):0 resueltos;
- Auth bridge determinístico con custom claim shopperId:0 resueltos.

Razones Auth:2 sin username,10 usernames duplicados,19 sin Auth user determinístico. No hubo claims inválidos ni colisiones de target porque ningún bridge llegó a candidato válido.

No emparejar por nombre/teléfono/email. Los31 requieren bloque explícito de alta/conciliación; no se consideran migrados.

## 6. Write gate — preparado, NO autorizado
Plan/request rebasados sobre V3, executor y workflow one-shot listos. Antes del write revalidan bundle SHA,151/120/31,118+2 docs y329 valores; cualquier drift falla antes de provider mutation. Readback obligatorio de todos los docs/campos.

Alcance máximo futuro:120 Firestore doc writes sobre perfiles existentes exactos; Auth/password reset0; Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0; producción=false; merge=false.

## 7. Fuente y precedencia
Export vigente manda para perfil actual. Las616 visitas y77 certificaciones canónicas siguen siendo autoridad; no sustituirlas con `certs/histCerts/visitas/activo/rating` legacy. Password visible solo desde valor legacy real; Firebase Auth sigue siendo autoridad del login.

## 8. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 9. Agosto
No ejecutar delta agosto hasta cerrar P0 y congelar Corte6.

## 10. Siguiente bloque
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOC WRITES → WRITE+READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → VISUAL ADMIN+SHOPPER → ALTA/CONCILIACIÓN EXPLÍCITA31 HOLD → FREEZE C6 → AGOSTO`.

Producción/merge siguen bloqueados.
