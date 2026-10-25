# Phase A human review and conflict queue TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
Contrato: `backend/contracts/phase-a-human-review-conflict-queue-plan-v1.json`

## Objetivo

Preparar el plan documental de cola de revision humana y conflictos para Phase A TyA antes de cualquier DEV, import, escritura o sincronizacion real.

Este documento no crea registros, no resuelve conflictos y no escribe datos. Define como deben tratarse los casos ambiguos para proteger la operacion real TyA.

## Continuidad del plan de trabajo

Este bloque sigue el plan Phase A:

- HR sigue siendo fuente operacional.
- Informacion TyA se trata como real/source-safe.
- Cinépolis sigue como primer proyecto configurable.
- Junio sigue como liquidaciones/pagos.
- Certificaciones ya presentadas se preservan.
- Shoppers historicos se conservan.
- Conflictos se revisan, no se ocultan.
- No se deduplica por nombre visual.

## Que se considera conflicto

Casos que deben entrar a cola de revision:

1. Shopper asignado en HR pero no existe en plataforma.
2. Shopper existente con identidad ambigua.
3. Visita asignada desde plataforma y HR con informacion distinta.
4. Visita candidata a duplicado.
5. Certificacion ya presentada en fuente TyA pero ausente en plataforma.
6. Liquidacion o estado de pago no coincide entre fuentes.
7. Cuestionario/origen de cuestionario distinto entre proyecto y visita.
8. Configuracion de proyecto incompleta o contradictoria.
9. Fuente antigua, ambigua o sin source lock claro.

## Llaves estables esperadas

No se debe resolver por coincidencia visual simple. Se deben usar llaves y referencias como:

- `tenantId`
- `projectId`
- `visitId` o `hrRowId`
- `shopperId` o referencia provisional
- `assignmentSource`
- `assignmentSyncStatus`
- `lastSyncedAt` o `sourceSnapshotAt`

## Forma base del item de revision

Cada item futuro de revision debe tener:

- `reviewId`
- `tenantId`
- `projectId`
- `conflictType`
- `severity`
- `entityType`
- `entityRef`
- `sourceARef`
- `sourceBRef`
- `recommendedAction`
- `allowedActions`
- `blockedActions`
- `reason`
- `status`
- `createdAt`
- `resolvedAt`

Las referencias deben ser opacas. No se deben guardar datos privados en logs, cola o documentos de repo.

## Acciones sugeridas por tipo

### Shopper asignado en HR pero no existe en plataforma

Accion esperada: crear shopper faltante solo cuando exista fuente source-safe suficiente y autorizacion futura. Mientras tanto, mostrar como `review_required` o `create_missing_pending`.

### Shopper con identidad ambigua

Accion esperada: mantener bloqueado o en revision. No fusionar por nombre. No crear duplicados si hay evidencia de identidad existente.

### Conflicto plataforma vs HR

Accion esperada: no sobrescribir silenciosamente. Resolver con origen, timestamps, assignmentSource y revision humana.

### Certificacion ya presentada

Accion esperada: preservar certificacion. No pedir nuevamente al shopper si la fuente indica que ya fue presentada.

### Liquidacion/pago

Accion esperada: tratar como control administrativo. No marcar pago real ejecutado desde cola.

## Lo que este bloque no autoriza

No autoriza:

- crear registros reales;
- importar datos;
- escribir HR;
- activar proveedores;
- ejecutar pagos;
- hacer deploy;
- producir;
- reescribir UI/core desde backend.

## Impacto Claude/prototipo

Claude debe representar:

- conflicto visible y accionable;
- revision humana requerida;
- shopper HR asignado como pendiente de creacion/revision, no invisible;
- certificacion preservada;
- liquidacion/pago como control, no pago real;
- no duplicar ni resolver por nombre.

## Backend replicable

Patron reusable:

- cola de revision por tenant/proyecto;
- tipos de conflicto normalizados;
- llaves estables;
- acciones permitidas/bloqueadas;
- referencias opacas;
- auditoria de decision;
- no resolver silenciosamente.

## Academia

Academia debe explicar:

- que es cola de revision;
- que son conflictos;
- por que no se deduplica por nombre;
- como se preservan certificaciones;
- como se manejan asignaciones HR/plataforma;
- como se trata junio como liquidaciones/pagos;
- que datos no deben aparecer en logs o manuales.

## Siguiente bloque sugerido

Preparar el plan documental de modelo minimo de datos Phase A TyA para DEV futuro: tenant, proyecto Cinépolis, shoppers, visitas, asignaciones, certificaciones, liquidaciones, pagos-control, reviewQueue y auditEvents.

## Estado final

Cola de revision y conflictos documentados. No se ejecuta nada y no se activan procesos.
