# CAMBIOS BACKEND — Addendum Corte 6 perfil Shopper completo V2/V3 READ-ONLY PASS

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_FULL_READONLY_PASS__31_IDENTITY_HOLD_PROVEN__WRITE_GATE_READY__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

## 1. Resultado V2
El bundle cifrado del export vigente fue reconciliado contra `cxorbia-backend-dev` exclusivamente read-only.

Resultado sanitizado:
- registros V2:151;
- match exacto por `legacyShopperId`:120;
- canonical faltante:31;
- ambiguos0; inválidos0;
-120 documentos exactos requieren write de perfil/metadata;
-118 tienen cambios reales de campos de perfil y2 solo requieren marcador de procedencia;
-329 valores de perfil planificados;
- password presente en fuente149;
- perfiles fuente con DPI/dirección/fecha nacimiento27.

Campos planificados en los120 exactos: username113, password legado real118, departamento2, DPI17, dirección1, fecha nacimiento2, términos aceptados72, aprobación cuenta2 y origen registro2. Nombre, teléfono/WhatsApp, email, país y ciudad ya coinciden y no requieren write.

## 2. Primer FAIL de transporte — causa raíz corregida
El primer intento V2 falló antes del provider por checksum: `part-007.txt` no coincidía con el chunk cifrado original. Se restauró exactamente el blob esperado y se reintentó usando la misma request, aún no consumida. El retry terminó `PASS_C6_PROFILE_FULL_V2_READONLY`. Provider writes en el FAIL:0.

## 3. Investigación adicional de los31 faltantes — sin pedir write prematuramente
Antes de pedir autorización Firestore se ejecutaron dos gates adicionales read-only para intentar reducir los31 HOLD y evitar autorizaciones sucesivas.

### V2 Auth-claim bridge
Se probó únicamente la cadena estable `username único del export → UID Auth determinístico → custom claim shopperId → perfil Firestore existente`.

Resultado sobre31:
-2 sin username utilizable;
-10 con username duplicado en la propia fuente;
-19 sin Auth user determinístico existente;
-0 claims inválidos;
-0 perfiles destino faltantes después de claim;
-0 resueltos.

### V3 technical-key + Auth bridge
Se añadió antes de Auth un bridge por llave técnica exacta y única contra `document id/sourceKey/shopperId/legacyId/externalId/externalShopperId/sourceId`. Nunca se utilizó nombre, teléfono o email como identidad.

Resultado:
-31 considerados;
-0 candidato técnico único;
-0 candidato técnico ambiguo;
-0 colisiones con otro legacyId;
-0 resueltos por technical bridge;
-0 resueltos por Auth bridge;
-31 HOLD confirmados.

Conclusión: los31 no tienen vínculo canónico reproducible hoy. No es seguro emparejarlos silenciosamente. Esto ya fue comprobado por dos rutas estables; no se volverá a iterar sobre nombre/coincidencia visual.

## 4. Fuente y precedencia
- export vigente manda para campos actuales de perfil legacy;
- identidad automática solo por llaves técnicas reproducibles;
- nunca dedupe por nombre/teléfono/email;
-616 visitas y77 certificaciones canónicas permanecen autoridad;
- `certs`, `histCerts`, `visitas`, `activo`, `rating` legacy no sobrescriben histórico canónico;
- password visible será únicamente el valor real del export, no patrón sintetizado;
- Firebase Auth continúa siendo autoridad de autenticación.

## 5. Write gate completo preparado — NO autorizado
Archivos vigentes:
- `backend/config/corte6-profile-full-firestore-write-plan-v2.json` — rebasado sobre evidencia V3, disabled;
- `backend/config/corte6-profile-full-firestore-write-request-v2.json` — disabled, sin authorizationId;
- `tools/release/cxorbia-corte6-profile-full-firestore-write-v2.mjs` — executor fail-closed;
- `.github/workflows/cxorbia-corte6-profile-full-firestore-write-v2.yml` — workflow gateado;
- `tools/qa/cxorbia-corte6-profile-full-identity-bridge-readonly-v2.mjs` + workflow/request consumida;
- `tools/qa/cxorbia-corte6-profile-full-identity-bridge-readonly-v3.mjs` + workflow/request consumida.

El executor fue corregido después de V3 para reflejar exactamente la evidencia:118 documentos con cambios de campos +2 documentos marker-only =120 document writes máximos. Antes de escribir vuelve a comprobar151/120/31,0 ambiguos/invalid,329 valores y desglose exacto por campo. Cualquier drift previo al write falla sin mutation.

Alcance máximo futuro:
-120 Firestore document writes únicamente sobre perfiles existentes exactos;
-329 valores de perfil;
- readback obligatorio de los120 documentos y cada campo escrito;
-31 missing canonical permanecen HOLD y no se crean en este gate;
- Auth writes/password resets0;
- Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0;
- producción=false; merge=false.

## 6. P0 visual y siguiente gate
Tras un write exacto PASS + readback deberá existir una autorización separada para redeploy del runtime protegido DEV. Solo entonces se repite visual Admin + Shopper con datos reales, histórico/KPI completo e identidad shopper real.

Los31 HOLD no se consideran migrados. Se resolverán por un bloque de alta/conciliación explícito —no por dedupe— antes de declarar migración legacy completa/freeze final.

## 7. Clasificación
- **Reusable CXOrbia:** handoff cifrado, stable-ID compare, bridge técnico/Auth exacto, write-plan, drift gate y readback.
- **Exclusivo cliente:** datos TyA y31 perfiles legacy sin vínculo canónico.
- **Claude/prototipo:** no rediseño; runtime protegido ya preparado.
- **Academia:** identidad reproducible vs señales de colisión, perfil vs histórico canónico, compare read-only antes de write.
- **Sin impacto Claude:** scripts/gates/evidencia backend.

## 8. Seguridad
El bundle permanece cifrado. Evidencia/documentación solo contiene conteos. PII/password no fueron persistidos en documentación/logs. Firestore/Auth/HR/legacy writes0; deploys nuevos0; producción intacta.
