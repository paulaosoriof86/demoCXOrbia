# CAMBIOS-BACKEND — Corte 6 · perfil Shopper completo autorizado y handoff V2

**Fecha:** 2026-07-31  
**Estado:** `C6_P0_OPEN__FULL_PROFILE_SCOPE_AUTHORIZED__V2_HANDOFF_READY__WAITING_V2_ENCRYPTED_BUNDLE__NO_PROVIDER_WRITE__NO_DEPLOY__NO_PRODUCTION`

## Decisión operativa vigente
Paula autorizó que la parte operativa pueda visualizar el perfil completo del shopper como existe hoy en la plataforma anterior, incluyendo datos personales, usuario y contraseña. El endurecimiento de acceso podrá hacerse después sin bloquear el cierre operativo actual.

Esta decisión cambia el HOLD previo sobre DPI/dirección/fecha de nacimiento para el carril operativo autenticado. Sigue prohibido exponer estos valores en repo, logs, evidencia source-safe o frontend público no autenticado.

## Hallazgo crítico del handoff V1
El bundle V1 entregado correctamente estaba cifrado, pero su contrato excluía password y deduplicaba descartando filas repetidas después de la primera coincidencia.

El resumen V1 reportó:
- rawRows: 282;
- encryptedRecords: 151;
- duplicateStableIds: 130;
- passwordValuesExported: false.

Por tanto NO se usa V1 para escribir perfil: hacerlo dejaría el perfil incompleto y podría seleccionar una variante antigua cuando un mismo ID aparece varias veces.

## Corrección V2
Se añadió `tools/local/cxorbia-corte6-profile-full-handoff-v2.html`:
- procesa el export únicamente offline;
- agrupa por ID técnico estable;
- fusiona duplicados del mismo ID en vez de descartarlos;
- prioriza la variante cuya llave RTDB coincide exactamente con el ID estable y luego la de mayor completitud;
- conserva alternativas conflictivas dentro del bundle cifrado;
- incluye perfil completo, PII, username y pass/password dentro del cifrado;
- el resumen source-safe contiene solo conteos.

Se añadió `tools/qa/cxorbia-corte6-profile-full-handoff-dryrun-v2.mjs`:
- descifra solo en memoria dentro del runner DEV;
- match único `legacyShopperId exact`;
- no matching de identidad por nombre/teléfono/email;
- compara el perfil actual contra Firestore read-only;
- profile-source-of-truth = export vigente para campos de perfil;
- preserva histórico/certificaciones canónicas y no permite que contadores/arrays legacy reemplacen las 616 visitas ni las 77 certificaciones canónicas;
- puede planificar nombre, username, password visible, contacto, ubicación, DPI/documento, dirección, fecha de nacimiento, términos y metadata de cuenta;
- además conserva `legacyProfileCurrent` para fidelidad del perfil de origen;
- no persiste valores en evidencia.

## Gate V2
Se crearon:
- `backend/config/corte6-profile-full-readonly-v2-request.json`;
- `.github/workflows/cxorbia-corte6-profile-full-readonly-v2.yml`.

El gate V2 sigue siendo únicamente provider read-only. No contiene autorización de Firestore write. Primero debe producir el conteo exacto de matches, deltas y campos; después se crea write-plan exacto y se solicita/consume la autorización correspondiente.

## Password
La contraseña del export vigente puede migrarse para paridad operacional y mostrarse en el perfil protegido actual. No se escribe en GitHub, logs ni evidencia. Firebase Auth continúa siendo la autoridad de autenticación; este valor visible es material legado de continuidad operacional, no una lectura desde Firebase Auth.

## Estado seguro
- bundle V1 recibido pero descartado como fuente de write por incompleto;
- V2 preparado;
- provider writes0;
- Firestore/Auth/HR/legacy writes0;
- Rules/Hosting/Cloud Run deploys nuevos0;
- Storage/Make/Gemini/pagos0;
- merge=false;
- producción=false.

## Siguiente bloque exacto
`GENERAR BUNDLE V2 COMPLETO DEL MISMO EXPORT YA ENTREGADO → READ-ONLY V2 AUTOMÁTICO → WRITE PLAN EXACTO PERFIL COMPLETO + USERNAME → AUTORIZACIÓN FIRESTORE → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL PROTEGIDA → FREEZE C6`.
