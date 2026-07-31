# CAMBIOS BACKEND — Addendum Corte 6 perfil Shopper completo V2 READ-ONLY PASS

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_FULL_V2_READONLY_PASS__WRITE_PLAN_PREPARED__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

## 1. Resultado
Se recibió el bundle V2 cifrado del export vigente de la plataforma anterior y se ejecutó la reconciliación DEV exclusivamente read-only contra `cxorbia-backend-dev`.

Resultado sanitizado:
- registros V2: 151;
- match exacto por `legacyShopperId`: 120;
- canonical faltante: 31 HOLD;
- ambiguos: 0;
- registros inválidos: 0;
- documentos existentes con cambios planificados: 120;
- campos de perfil planificados: 329;
- perfiles fuente con password: 149;
- perfiles fuente con DPI/dirección/fecha nacimiento: 27.

Campos planificados en los 120 perfiles exactos:
- username 113;
- password legado real 118;
- departamento 2;
- DPI 17;
- dirección 1;
- fecha nacimiento 2;
- términos aceptados 72;
- aprobación cuenta 2;
- origen registro 2.

Nombre, teléfono/WhatsApp, email, país y ciudad de estos 120 perfiles ya coinciden con Firestore y no requieren write.

## 2. Causa del primer FAIL y corrección
El primer intento read-only falló antes del provider por checksum del bundle ensamblado. La causa exacta fue `part-007.txt`: su blob no coincidía con el chunk original cifrado. Se restauró exactamente el blob esperado y se reintentó usando la misma request, que seguía no consumida. El segundo gate terminó `PASS_C6_PROFILE_FULL_V2_READONLY`.

No hubo provider mutation durante el intento fallido.

## 3. Fuente y contrato
- export vigente manda únicamente para perfil actual legacy;
- identidad automática solo `legacyShopperId exact`;
- nunca match automático por nombre/teléfono/email;
- 616 visitas y 77 certificaciones canónicas permanecen autoridad;
- `certs`, `histCerts`, `visitas`, `activo`, `rating` legacy no sobrescriben histórico canónico;
- password visible será únicamente el valor real recuperado del export, no patrón sintetizado.

## 4. Write plan preparado — NO autorizado
Creado `backend/config/corte6-profile-full-firestore-write-plan-v2.json`.

Plan:
- máximo 120 document writes Firestore sobre perfiles ya existentes;
- 329 valores de campos a set/refresh;
- 31 registros sin canonical quedan HOLD y no se crean silenciosamente;
- Auth writes 0;
- Firebase password resets 0;
- HR/legacy writes 0;
- Rules/Storage/Hosting/Cloud Run/Make/Gemini/pagos 0;
- producción false; merge false.

No se ejecutará ningún Firestore write sin autorización exacta nueva.

## 5. P0 visual y siguiente gate
Corte 6 sigue abierto. Tras el write exacto y readback deberá publicarse el runtime protegido ya preparado bajo un redeploy DEV separado y autorizado, y repetirse visual Admin + Shopper con perfil/histórico/KPI completo.

Los 31 perfiles legacy sin vínculo canónico exacto se conservan como HOLD de identidad; no bloquean la actualización segura de los 120 matches, pero deben resolverse antes de afirmar migración total del universo legacy.

## 6. Clasificación
- **Reusable CXOrbia:** handoff cifrado, stable-ID compare, write-plan exacto, fail-closed ante identidad faltante.
- **Exclusivo cliente:** datos TyA y perfil legacy real.
- **Claude/prototipo:** no rediseño; runtime protegido ya preparado.
- **Academia:** migración segura, segregación identidad/perfil/histórico y validación read-only antes de write.
- **Sin impacto Claude:** scripts/gates/evidencia backend.

## 7. Seguridad
El bundle permanece cifrado. Evidencia/documentación solo contiene conteos. No se persistieron valores PII/password en documentación ni logs. Producción no fue tocada.
