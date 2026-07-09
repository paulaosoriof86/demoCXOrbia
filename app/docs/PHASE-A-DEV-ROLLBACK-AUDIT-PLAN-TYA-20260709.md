# Phase A DEV rollback and audit plan TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
Contrato: `backend/contracts/phase-a-dev-rollback-audit-plan-v1.json`

## Objetivo

Preparar el plan documental de rollback y auditoria antes de cualquier paso DEV futuro de Phase A TyA.

Este documento no activa DEV, no ejecuta rollback y no escribe datos. Define que debe existir antes de una autorizacion futura.

## Continuidad del plan

Seguimos en el mismo plan Phase A TyA:

- HR como fuente operacional.
- Informacion TyA real o source-safe para implementacion controlada.
- Cinépolis como primer proyecto configurable.
- Junio como liquidaciones/pagos.
- Certificaciones ya presentadas preservadas.
- Conflictos a revision humana.
- Base nueva limpia, nunca copia de base vieja.

## Estado seguro

Este bloque es documental.

- No cambia `/app/modules`.
- No cambia `/app/core`.
- No activa DEV.
- No ejecuta builder.
- No importa datos.
- No escribe datos.
- No toca HR.
- No activa proveedores.
- No hace deploy.
- No produccion.
- No pagos.
- No datos sensibles.

## Requisitos de rollback antes de futuro DEV

Antes de una conexion DEV controlada debe existir:

1. Flag unico para desactivar la conexion DEV.
2. Camino definido para volver a la fuente local o estado previo de `CX.data`.
3. Gates de proveedores apagados por defecto.
4. Importaciones en dry-run hasta GO explicito.
5. Lotes de escritura detenibles antes de commit real.
6. Forma estandar de evento de auditoria.
7. Cola de revision humana para conflictos.
8. Logs sin payload privado ni datos sensibles.
9. Nota de recuperacion manual para admins.
10. Copy Claude/prototipo para estado degradado o bloqueado.
11. Manual Academia sobre rollback y auditoria.

## Forma de evento de auditoria

Todo evento futuro debe poder guardar referencias opacas, no datos privados.

Campos base:

- `eventId`
- `tenantId`
- `projectId`
- `actorRole`
- `action`
- `source`
- `entityType`
- `entityRef`
- `previousStateRef`
- `nextStateRef`
- `decision`
- `reason`
- `createdAt`

## Acciones que no autoriza este bloque

Este bloque no autoriza:

- activar DEV;
- deploy;
- produccion;
- import real;
- write real;
- escritura HR;
- proveedores live;
- pagos;
- copiar base vieja;
- subir datos sensibles;
- reescribir UI/core desde backend.

## Backend replicable

Patron reusable para CXOrbia:

- rollback antes de activacion;
- auditoria antes de escritura;
- referencias opacas en logs;
- cola de revision humana;
- gates apagados por defecto;
- dry-run antes de import;
- estado degradado honesto;
- base nueva limpia por tenant/proyecto.

## Impacto Claude/prototipo

Claude debe mostrar:

- rollback preparado, no ejecutado;
- auditoria requerida, no equivalente a produccion;
- estados bloqueado, degradado o pendiente cuando aplique;
- revision humana para conflictos;
- no afirmar sync, import, pago o proveedor real si gate no existe.

## Impacto Academia

Academia debe explicar:

- que es rollback;
- que es auditoria;
- por que se usan referencias opacas;
- que datos no deben ir en logs;
- como se revisan conflictos;
- diferencia DEV, runtime y produccion;
- como actuar si un gate queda bloqueado.

## Siguiente bloque sugerido

Preparar el plan documental de cola de revision humana y conflictos Phase A TyA, conectado con HR, shoppers, asignaciones, certificaciones y liquidaciones/pagos.

## Estado final

Rollback y auditoria documentados. No se ejecuta nada y no se activa DEV.
