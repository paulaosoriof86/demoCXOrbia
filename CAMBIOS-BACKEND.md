# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`C6_AUTH_CANONICAL_STAFF_OWNER_INPUT_PARTIAL_CAPTURED__PROJECT_ENTITLEMENTS_PENDING__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## Avance del bloque 2026-08-11

- Se recibieron en conversación las referencias empresariales para A/Superadministración, B/Administración, C/Operaciones y un acceso adicional de Operaciones.
- No se vuelven a solicitar esas referencias humanas.
- No se persisten correos ni credenciales en documentación o configuración ejecutable.
- Los usuarios staff iniciales se clasifican como **bootstrap de datos vivos**, no como constantes del frontend/backend.
- Queda obligatorio que usuarios, roles y scopes sean administrables desde la plataforma bajo RBAC.
- El pendiente mínimo para cerrar el target es el alcance de proyecto de los cuatro accesos: `TYA_COMPLETE` o `SPECIFIC_PROJECTS`.

## Corrección inmediata de higiene source-safe

El primer commit documental de esta sesión (`9013be65f1e06628343aa796b7deeb2746dbb08a`) incluyó transitoriamente referencias humanas en texto del checkpoint. Se corrigió inmediatamente en `b9178b318f97a7e7b8459d4b275e6b0988cb35d2`, eliminándolas del contenido vivo y manteniendo correos/credenciales fuera del repo.

No se afirma borrado de historia Git: la corrección disponible en el carril actual elimina el dato del estado vivo, pero el commit anterior sigue formando parte del historial de la rama. No se hará history rewrite/force push sin autorización expresa y porque el lock vigente prohíbe `force`. Este incidente queda documentado y no se repetirá.

## Métrica estable de cierre

```text
M1 Baseline/Phase A preservada                     35 = COMPLETE
M2 Auth V4 activation/readback/rollback            20 = COMPLETE
M3 SKIP13/MultiAuth/HashConfig/direct runner       15 = COMPLETE
M4 Owners + exact project entitlements              5 = PARTIAL
M5 Repair focal A-D                                 8 = PENDING
M6 HR final production evidence                     5 = PENDING
M7 Final accumulative multirole smoke               5 = PENDING
M8 Human validation + rollback ready                3 = PENDING
M9 Explicit cutover + one production promotion      3 = PENDING
M10 Post-cutover smoke + freeze                      1 = PENDING
```

**Avance certificado: 72%. Restante: 28%.** El denominador queda congelado para las sesiones restantes.

## Siguiente acción exacta

`C6 AUTH CANONICAL STAFF OWNER INPUT CAPTURE AND TARGET DIGEST — COMPLETE PROJECT ENTITLEMENTS, SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

No provider, Auth write, Firestore write, deploy, merge ni producción hasta cerrar los scopes exactos.
