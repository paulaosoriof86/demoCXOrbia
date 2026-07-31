# CAMBIOS BACKEND — Addendum Corte 6 perfil Shopper completo V2 READ-ONLY PASS

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_FULL_V2_READONLY_PASS__WRITE_GATE_READY__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

## 1. Resultado
Se recibió el bundle V2 cifrado del export vigente de la plataforma anterior y se ejecutó la reconciliación DEV exclusivamente read-only contra `cxorbia-backend-dev`.

Resultado sanitizado:
- registros V2:151;
- match exacto por `legacyShopperId`:120;
- canonical faltante:31 HOLD;
- ambiguos:0;
- registros inválidos:0;
- documentos existentes con cambios planificados:120;
- campos de perfil planificados:329;
- perfiles fuente con password:149;
- perfiles fuente con DPI/dirección/fecha nacimiento:27.

Campos planificados en los120 perfiles exactos: username113, password legado real118, departamento2, DPI17, dirección1, fecha nacimiento2, términos aceptados72, aprobación cuenta2 y origen registro2. Nombre, teléfono/WhatsApp, email, país y ciudad ya coinciden con Firestore y no requieren write.

## 2. Causa del primer FAIL y corrección
El primer intento read-only falló antes del provider por checksum del bundle ensamblado. La causa exacta fue `part-007.txt`: su blob no coincidía con el chunk original cifrado. Se restauró exactamente el blob esperado y se reintentó usando la misma request, que seguía no consumida. El segundo gate terminó `PASS_C6_PROFILE_FULL_V2_READONLY`.

No hubo provider mutation durante el intento fallido.

## 3. Fuente y contrato
- export vigente manda únicamente para perfil actual legacy;
- identidad automática solo `legacyShopperId exact`;
- nunca match automático por nombre/teléfono/email;
-616 visitas y77 certificaciones canónicas permanecen autoridad;
- `certs`, `histCerts`, `visitas`, `activo`, `rating` legacy no sobrescriben histórico canónico;
- password visible será únicamente el valor real recuperado del export, no patrón sintetizado.

## 4. Write gate completo preparado — NO autorizado
Archivos preparados directamente en rama viva:
- `backend/config/corte6-profile-full-firestore-write-plan-v2.json` — plan exacto, disabled;
- `backend/config/corte6-profile-full-firestore-write-request-v2.json` — request disabled, sin authorizationId;
- `tools/release/cxorbia-corte6-profile-full-firestore-write-v2.mjs` — executor fail-closed;
- `.github/workflows/cxorbia-corte6-profile-full-firestore-write-v2.yml` — workflow que solo puede llegar al provider si request+plan contienen autorización explícita exacta.

El executor vuelve a comprobar antes de escribir:
- bundle SHA-256 exacto;
-151 source records;
-120 matches exactos;
-31 missing canonical HOLD;
-0 ambiguos/invalid;
-329 valores y el desglose exacto por campo.

Alcance máximo futuro:
-120 document writes Firestore únicamente sobre perfiles existentes exactos;
-329 valores de perfil;
- readback obligatorio de los120 documentos y de cada campo escrito;
- cualquier drift previo al write = FAIL sin provider mutation;
-31 missing canonical nunca se crean ni emparejan silenciosamente;
- Auth writes / Firebase password resets0;
- HR/legacy writes0;
- Rules/Storage/Hosting/Cloud Run/Make/Gemini/pagos0;
- producción=false; merge=false.

No se ejecutará ningún Firestore write hasta recibir autorización exacta nueva. La mera creación del workflow no ejecuta la request ya existente porque permanece disabled.

## 5. P0 visual y siguiente gate
Corte6 sigue abierto. Tras el write exacto y readback deberá publicarse el runtime protegido ya preparado bajo un redeploy DEV separado y autorizado, y repetirse visual Admin + Shopper con perfil/histórico/KPI completo.

Los31 perfiles legacy sin vínculo canónico exacto se conservan como HOLD de identidad; no bloquean la actualización segura de los120 matches, pero deben resolverse antes de afirmar migración total del universo legacy o congelar definitivamente el corte.

## 6. Clasificación
- **Reusable CXOrbia:** handoff cifrado, stable-ID compare, write-plan exacto, executor con drift gate y readback, fail-closed ante identidad faltante.
- **Exclusivo cliente:** datos TyA y perfil legacy real.
- **Claude/prototipo:** no rediseño; runtime protegido ya preparado.
- **Academia:** migración segura, segregación identidad/perfil/histórico y validación read-only antes de write.
- **Sin impacto Claude:** scripts/gates/evidencia backend.

## 7. Seguridad
El bundle permanece cifrado. Evidencia/documentación solo contiene conteos. No se persistieron valores PII/password en documentación ni logs. Firestore/Auth/HR/legacy writes0; deploys nuevos0; producción no fue tocada.
