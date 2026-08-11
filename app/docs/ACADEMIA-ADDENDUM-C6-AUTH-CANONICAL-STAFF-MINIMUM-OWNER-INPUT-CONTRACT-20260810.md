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

El contrato live user-admin y su handler formalizan scope obligatorio/editable, inventario vivo, RBAC, audit/readback/rollback y no hard delete por defecto. El static source gate está PASS terminal.

## Provider snapshot y adjudicación de identidad

El provider snapshot focal se ejecutó una sola vez y quedó PASS con población Auth exacta 228. La adjudicación reusable demuestra que una cuenta existente solo puede adoptarse como canonical cuando existe binding independiente de identidad + claims exactos; la unicidad de rol nunca es prueba suficiente.

En este caso técnico source-safe:

```text
A=REUSE_EXISTING_CANONICAL por owner-binding independiente
B/C/D=CREATE_NEW_EPHEMERAL sin colisión
R4 Cliente canónico=preservado exacto
```

No se documentan identidades, correos, UIDs, passwords ni claims crudos en materiales académicos.

## Presupuesto y reversibilidad

El presupuesto final se congela después de observar el estado real, no antes:

```text
Auth writes=14
Firestore writes=16
Auth/Firestore deletes=0
rollback dry-run=PASS
```

La coincidencia numérica con un presupuesto histórico no significa que este se haya reutilizado; el valor actual fue recalculado por composición efectiva.

Principio reusable: **snapshot real -> adjudicación -> presupuesto exacto -> rollback calculable -> autorización de write**.

## Incidente de harness

Un request inicial abortó antes del provider por un error de delimitación shell. El error no se confundió con un fallo de datos ni consumió la observación provider. Se corrigió la causa raíz y luego se ejecutó una única observación efectiva. Lección metodológica: separar telemetría/control-plane de evidencia real de acceso a datos.

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

**Avance de cierre certificado:** 84%.