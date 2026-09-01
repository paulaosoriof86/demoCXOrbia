# Guia lectura salidas local readiness - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Definir como leer las salidas locales del runbook readiness sin subir informacion no revisada ni asumir produccion lista.

## Secuencia esperada

1. Ejecutar consistency check.
2. Ejecutar preflight.
3. Ejecutar runbook preview.
4. Revisar salidas.
5. Llenar template de reporte local.

## Como interpretar estados

### `consistency_preview_ready`

Indica que la documentacion y scripts esperados son consistentes para seguir al preflight. No autoriza produccion.

### `preflight_preview_ready`

Indica que el preflight local no encontro bloqueos principales. No autoriza produccion.

### `review_required`

Indica que hay que revisar antes de avanzar.

### Exit code 2

Puede ser esperado en algunos validadores cuando hay blockers o revision manual. No debe tratarse automaticamente como fallo tecnico ni como exito.

## Que revisar antes de compartir

- Que no haya credenciales.
- Que no haya datos crudos TyA.
- Que no haya payloads externos.
- Que no haya informacion bancaria.
- Que no haya correos o telefonos sin sanitizar.

## Resultado permitido para compartir

- Estado resumido.
- Nombre de salidas generadas.
- Decision local.
- Bloqueos sin datos sensibles.
- Proximo paso recomendado.

## Decision

Las salidas locales solo sirven para preview y diagnostico. No habilitan source lock, produccion, deploy, merge, import real ni escrituras reales.
