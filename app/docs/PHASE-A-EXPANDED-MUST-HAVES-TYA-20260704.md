# Phase A expanded must-haves TyA

Fecha: 2026-07-04

## Decision

Phase A se amplía. El lanzamiento controlado no puede ser solo visual/minimo si la operación depende de HR completa, asignaciones reales, certificaciones con IA y sincronización HR/plataforma.

## Must-haves de Phase A

### 1. Import histórico completo

Debe quedar dentro de Phase A porque permite:

- Controlar lectura completa de HR.
- Validar asignaciones a partir de información real.
- Evitar operar con vista parcial.
- Reconstruir historial operativo suficiente para TyA.

### 2. Multi-proyecto desde el inicio

Debe funcionar para:

- Cinépolis.
- Otros proyectos adicionales de TyA.

Regla:

- Todo debe segmentarse por `tenantId` y `projectId`.
- No se debe amarrar la lógica solo a Cinépolis.

### 3. Certificaciones con IA conectada

Gemini debe quedar en Phase A para:

- Generar nuevo banco de certificaciones.
- Adaptar preguntas por proyecto.
- Evitar pedir nueva certificación a shoppers que ya presentaron.

Regla:

- La IA no debe borrar historial de certificaciones.
- Los shoppers ya certificados deben conservar estado según evidencia histórica.

### 4. Sincronización HR bidireccional con Make

Make debe cubrir dos flujos:

#### Plataforma -> HR

Cuando se asigne desde la plataforma:

- Actualizar la HR.
- Marcar shopper asignado.
- Retirar visita de disponibles.
- Evitar duplicación si luego se refleja en HR.

#### HR -> Plataforma

Cuando se asigne desde la HR:

- La plataforma debe detectarlo.
- Asignar al shopper correcto.
- Borrar la visita de disponibles.
- No deduplicar mal si la asignación ya fue originada por la plataforma.

## Regla anti-duplicados

No basta con deduplicar por coincidencia visual. Se requiere llave de sincronización.

Llave recomendada:

- `projectId`
- `visitId` o identificador estable de fila HR
- `hrRowId`
- `shopperId`
- `assignmentSource` = platform | hr
- `assignmentSyncStatus`
- `lastSyncedAt`

## Reglas de prioridad

1. HR es fuente operativa para lectura completa.
2. Plataforma puede originar asignaciones.
3. HR puede originar asignaciones.
4. La misma asignación no debe duplicarse.
5. Una visita asignada debe salir de disponibles.
6. Si hay conflicto, debe ir a revisión y no sobrescribir silenciosamente.

## Alcance ajustado de lanzamiento

Phase A queda como lanzamiento controlado operativo, no solo demo:

- Import histórico completo.
- Multi-proyecto.
- Gemini para certificaciones.
- Make para sincronización de asignaciones HR/plataforma.
- V78 como baseline visual.
- Backend seguro con gates.

## Riesgo

Esto aumenta alcance de Phase A, pero es funcionalmente necesario para lanzar con operación real.

La estrategia debe ser rápida pero con contratos estrictos:

- Primero lectura completa HR.
- Luego asignaciones.
- Luego sincronización Make.
- Luego IA certificaciones.
- Luego hardening posterior.

## Información real necesaria

1. HR actual completa de Cinépolis.
2. HR o estructura del nuevo proyecto adicional.
3. Identificador estable de fila o regla para construirlo.
4. Lista de shoppers ya certificados y resultado histórico.
5. Reglas de certificación por proyecto.
6. Acceso o webhook Make para HR.
7. Confirmación de campos exactos de asignación en HR.

## Estado

- Scope Phase A actualizado.
- Sin cambios frontend.
- Sin runtime conectado.
- Sin deploy ejecutado.
- Sin produccion ejecutada.
- Sin escritura Firestore en este bloque.
