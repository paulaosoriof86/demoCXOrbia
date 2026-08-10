# RESUMEN PARA CLAUDE — ADDENDUM C6 AUTH DUPLICATE KEEPER ONE-READ STOP

**Fecha:** 2026-08-10

## Estado backend que Claude debe respetar

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
DuplicateKeeperOneRead=STOP_RETRY
UnresolvedKeeperGroups=4
fd891Policy=POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS
providerReads=1
secondProviderRead=false
production=false
```

## Qué significa

Los tres pares Admin/Operaciones y el par Cliente no pueden distinguir keeper con los discriminadores técnicos autorizados actuales. No existe autorización para compensar este problema desde UI, duplicar rutas, agregar selectores de cuenta ni relajar validaciones.

El grupo `fd891...` no tiene acceso TyA efectivo y debe permanecer sin reparación TyA en el alcance actual.

## No modificar

- Login/frontend acumulativo;
- `/app/modules/*` y `/app/core/*`;
- `CX.data`;
- `ROLE_NOT_ALLOWED`, `TENANT_NOT_ALLOWED`, `PROJECT_SCOPE_REQUIRED`, `SHOPPER_SCOPE_REQUIRED`;
- scopes por tenant/proyecto;
- 20/20 superficies Phase A preservadas.

## Pendiente backend

Antes de cualquier repair Auth debe existir una ancla source-safe, no temporal y reproducible que determine un keeper único para cada uno de los cuatro grupos A–D. Si esa ancla no existe, corresponde decisión humana de propiedad, no heurística frontend.

## Impacto Claude/prototipo

Sin cambio requerido en esta etapa. Mantener copy y comportamiento existentes; no exponer detalles técnicos de los duplicados a usuarios finales.
