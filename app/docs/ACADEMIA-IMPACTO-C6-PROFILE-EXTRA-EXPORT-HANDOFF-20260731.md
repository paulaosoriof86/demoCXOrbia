# Academia — Corte 6 · perfil extra, handoff cifrado y PII protegida

**Fecha:** 2026-07-31  
**Estado:** `REUSABLE_PATTERN_DOCUMENTED__NO_PROVIDER_WRITE__NO_PRODUCTION`

## 1. Patrón reusable
Una migración de perfil no debe equiparar “dato disponible en legacy” con “dato listo para copiar”. Antes de escribir hay que separar:

`FUENTE → IDENTIDAD ESTABLE → CLASIFICACIÓN DEL CAMPO → AUTORIDAD CANÓNICA → RBAC REAL → DELTA FILL-MISSING → WRITE GATED`.

## 2. Identidad
Para TyA, la reconciliación de perfil extra usa únicamente ID técnico estable del export contra `legacyShopperId` canónico.

Nunca usar nombre, teléfono o email como llave automática. Coincidencias visuales van a revisión.

## 3. Tres clases de campos
### Operativos
Username, teléfono, email, país, ciudad y departamento pueden proponerse como `fill-missing` cuando el match estable es único.

### Sensibles
Documento/DPI, dirección y fecha de nacimiento requieren almacenamiento y Rules realmente protegidos. Ocultarlos en UI no es una barrera de seguridad.

### Evidence-only
Certificaciones/historial, contador de visitas, estado legacy, aceptación de términos, aprobación/origen de cuenta y rating no deben convertirse automáticamente en estado canónico si ya existe otra autoridad.

En TyA, 77 certificaciones canónicas y 616 visitas canónicas prevalecen sobre contadores o arrays legacy.

## 4. Credenciales
Password y UID legacy se excluyen del perfil.

La contraseña vigente no se recupera desde Firebase Auth. El patrón histórico solo puede rotularse cuando su hash fue verificado; no puede inferirse universalmente.

## 5. Handoff cifrado
Cuando un archivo ya fue entregado pero la herramienta de lectura no expone bytes/path al runner:
- procesar localmente/offline;
- excluir secretos innecesarios;
- cifrar el bundle antes de disco/handoff;
- descifrar solo en memoria dentro del runner autorizado;
- persistir únicamente evidencia source-safe.

Esto evita dos antipatrones: subir PII cruda a repositorios y reconectar la base legacy por conveniencia.

## 6. Fail-closed
Si existe duplicidad de ID, mismatch key/id, múltiples perfiles canónicos o conflicto con un valor no vacío, el caso se retiene. No overwrite silencioso.

## 7. Aplicación a manuales/cursos
Incluir:
- diferencia entre identidad, contacto y credencial;
- match estable vs match visual;
- fill-missing vs overwrite;
- PII y seguridad de Rules;
- evidencia legacy vs autoridad canónica;
- cifrado de handoff;
- separación read-only/write authorization.

## 8. Seguridad
Este bloque solo agregó tools/docs y preparación de un gate read-only. Firestore/Auth/HR/legacy/Storage writes0; Rules/Hosting/Cloud Run deploys0; Make/Gemini/pagos0; merge=false; producción=false.
