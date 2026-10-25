# Mapa dependencias Phase A - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Dejar claro que depende de P0, source lock, GO o produccion controlada.

## Depende de P0 cerrado

| Elemento | Dependencia | Estado |
| --- | --- | --- |
| Source lock | Textos P0 cerrados y auditados | Bloqueado |
| Empalme final | Candidata o intervencion P0 aprobada | Bloqueado |
| Backend real | Source lock posterior a P0 | Bloqueado |
| Academia final | Cambios P0 reflejados en manuales/cursos | Pendiente |

## Depende de GO explicito

| Elemento | Dependencia | Estado |
| --- | --- | --- |
| Scanner P0 local | GO Paula | Bloqueado |
| Safe audit bundle | GO Paula y repo local confirmado | Bloqueado |
| Readiness local | GO Paula y salidas revisadas | Bloqueado |

## Depende de source lock

| Elemento | Dependencia | Estado |
| --- | --- | --- |
| Conexion backend real | Source lock aprobado | Bloqueado |
| Contrato final CX.data | Source lock aprobado | Bloqueado |
| Preparacion import real | Source lock y readiness | Bloqueado |

## Depende de produccion controlada

| Elemento | Dependencia | Estado |
| --- | --- | --- |
| Import real | Decision Paula | Bloqueado |
| Providers reales | Gates y configuracion | Bloqueado |
| Make/Gemini reales | Configuracion y aprobacion | Bloqueado |
| Pagos reales | Flujo y autorizacion | Bloqueado |

## Puede seguir ahora

- Documentacion acumulada.
- Herramientas locales sin ejecucion.
- Matrices y trackers.
- Templates de lectura.
- Continuidad.

## Regla

Nada bloqueado se libera por documentacion avanzada. Cada dependencia requiere su gate.
