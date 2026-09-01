# Academia — HR viva, periodos automáticos y origen plataforma

**Fecha:** 2026-07-31  
**Estado:** `REUSABLE_PATTERN_DOCUMENTED__C6_FULL_PROFILE_V2_READY__NO_PRODUCTION`

## 1. HR viva y periodos automáticos
Una operación de campo no debe exigir configuración técnica mensual cuando el calendario operativo ya existe en una fuente viva. Para CXOrbia: tabs mensuales se detectan por metadata provider; plataforma y HR se concilian por IDs estables/origen/estado de sincronización; nunca por nombre.

## 2. Implementación TyA validada
DEV técnico:14 periodos /616 visitas /último2026-07; autodiscovery mensual activo; producción intacta. Corte6 sigue abierto por P0 Shopper/perfil.

## 3. Source-safe vs runtime protegido
`SOURCE-SAFE PUBLICO != CONSOLA OPERATIVA AUTENTICADA`.

La UI pública/source-safe puede ocultar PII, mientras un rol operativo autenticado puede recibir la información necesaria según política real. La seguridad se define en backend/Rules, no solo ocultando campos visualmente.

## 4. Identidad Shopper
Cadena reusable:
`CREDENCIAL → FIREBASE AUTH → CLAIMS → TENANT/PROJECT → SHOPPER ID ESTABLE → PERFIL/HISTORICO`.

TyA confirmó91 claims Shopper con shopperId y91/91 perfiles existentes. No usar fallback ficticio ni matching de identidad por nombre/teléfono/email.

## 5. Perfil completo y decisión operativa temporal
Para TyA, Paula autorizó temporalmente que la parte operativa autenticada vea el perfil completo existente en la plataforma anterior, incluidos datos personales, username y password legado visible. El hardening de mínimo privilegio se difiere para no bloquear la salida operativa.

Patrón reusable: una excepción operacional temporal debe quedar explícitamente documentada, acotada al rol autenticado y sin trasladar valores sensibles a repo/logs/evidencia.

## 6. Export/import seguro
El export vigente ya fue recuperado. Nunca conectar legacy como dependencia runtime.

Patrón:
`EXPORT → HANDOFF CIFRADO → MERGE POR ID ESTABLE → DECRYPT IN MEMORY → PROVIDER COMPARE → WRITE PLAN → WRITE GATED`.

## 7. Duplicados de origen
El primer handoff reveló282 filas,151 IDs cifrados y130 duplicados por ID estable. Descartar la segunda aparición podía perder información.

Lección reusable: duplicados que comparten el mismo ID técnico no se resuelven por nombre ni se eliminan silenciosamente. Se agrupan por ID, se fusionan campo a campo, se define precedencia reproducible y se conservan conflictos para revisión.

V2 prioriza la variante cuya llave RTDB coincide exactamente con el ID estable y luego mayor completitud.

## 8. Perfil vs historia canónica
El export vigente puede ser source-of-truth para campos de perfil, pero no debe sobrescribir modelos canónicos ya materializados.

En TyA:
- perfil: nombre/contacto/ubicación/documento/dirección/fecha de nacimiento/username/password/términos/metadata de cuenta;
- historia canónica:616 visitas;
- certificaciones canónicas:77.

Los contadores/arrays legacy se preservan como evidencia de origen, no como autoridad superior.

## 9. Password visible vs Auth
Firebase Auth sigue siendo la autoridad de autenticación y no devuelve plaintext vigente. En esta migración, el password visible proviene del export legado actual y se conserva por paridad operacional autorizada.

No inferir contraseña, no usar patrón universal, no publicar valores en repo/logs/evidencia. El hardening futuro puede mover este material a un mecanismo más restringido sin cambiar la interfaz operativa.

## 10. Handoff V2
`tools/local/cxorbia-corte6-profile-full-handoff-v2.html` cifra PII/username/password antes de salir del navegador.

`tools/qa/cxorbia-corte6-profile-full-handoff-dryrun-v2.mjs` descifra solo en memoria y compara por `legacyShopperId exact`.

`.github/workflows/cxorbia-corte6-profile-full-readonly-v2.yml` ejecuta provider read-only y persiste únicamente conteos source-safe.

## 11. Gates
- provider read-only puede avanzar sin write;
- perfil completo requiere write-plan exacto y autorización Firestore;
- Auth write/reset sigue siendo gate separado;
- Hosting/producción tiene gate propio;
- autorización consumida no se reutiliza.

## 12. Julio/agosto
No materializar agosto hasta congelar Corte6. Después: refresh HR → resolver agosto HN → delta-only agosto.

## 13. Contenido para manuales/cursos
- HR viva/auto-month;
- source-safe vs protected runtime;
- Auth/claims/shopperId;
- merge de duplicados por stable-ID;
- perfil completo vs historia canónica;
- password legado vs Auth;
- excepción operacional temporal + hardening posterior;
- evidencia sin valores;
- gates y readback.

## 14. Seguridad actual
Provider writes0; Firestore/Auth/HR/legacy writes0; deploys nuevos0; merge=false; producción=false.
