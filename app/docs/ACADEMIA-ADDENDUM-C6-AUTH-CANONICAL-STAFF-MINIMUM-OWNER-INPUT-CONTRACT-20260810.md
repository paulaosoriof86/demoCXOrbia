# ACADEMIA — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Actualización:** 2026-08-11

Este bloque no cambia cursos, rutas, certificaciones ni UI de Academia antes de producción.

## Principios reutilizables

- identidad empresarial, rol y alcance son dimensiones separadas;
- `TyA completo` no equivale a wildcard;
- el alcance se define explícitamente al crear un usuario y puede modificarse después bajo autorización;
- `Proyectos específicos` proviene de inventario vivo y auditable, no de IDs hardcodeados;
- un proyecto nuevo no amplía privilegios silenciosamente;
- cambios de rol/alcance dejan audit trail y readback;
- alta, edición, deshabilitación y reactivación son operaciones distintas;
- retiro histórico preferente = deshabilitar y conservar trazabilidad, no borrar;
- credenciales, claims, fingerprints, provider email y UIDs técnicos no se muestran como contenido de usuario.

## Estado técnico reusable

El contrato `backend/contracts/c6-live-user-admin-v1.json` v1.1 y el handler `backend/runtime/hr-live-service/user-admin.mjs` formalizan scope obligatorio/editable, inventario vivo, RBAC, audit/readback/rollback y no hard delete por defecto.

El static source gate se ejecutó terminalmente sobre la rama viva y quedó PASS mediante el runner read-only existente. La lección metodológica reusable es diferenciar **source preparado** de **gate terminal demostrado**; no debe declararse listo un componente solo porque el script exista.

## Prewrite y migración de identidad

El nuevo `backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json` separa aliases de negocio de grupos históricos para impedir confusiones semánticas. Antes de cualquier write exige snapshot source-safe, create-before-retire, readback e inverse action calculable.

El presupuesto de writes se congela únicamente después de observar el estado real; no se recicla un cap histórico cuando cambia el alcance del bloque.

## Manuales futuros

Usuarios & Permisos debe explicar en lenguaje humano:

- `TyA completo`;
- `Proyectos específicos`;
- revisión requerida cuando cambia el inventario de proyectos;
- diferencia entre deshabilitar y eliminar.

No mostrar detalles técnicos de Auth.

## HR viva

M6 permanece cerrado. La HR viva y la observabilidad de una ejecución siguen siendo conceptos separados; no repetir mapeo por fallos de telemetría.

**Impacto Academia:** conceptual/documental. No bloquea producción ni exige una nueva lección antes del cutover.

**Avance de cierre certificado:** 83%.