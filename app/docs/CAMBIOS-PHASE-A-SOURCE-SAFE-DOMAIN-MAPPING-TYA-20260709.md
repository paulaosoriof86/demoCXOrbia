# Cambios - Phase A source-safe domain mapping TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`

## Archivos agregados

- `backend/contracts/phase-a-source-safe-domain-mapping-v1.json`
- `tools/contracts/tya-phase-a-source-safe-domain-mapping-validate.mjs`
- `app/docs/PHASE-A-SOURCE-SAFE-DOMAIN-MAPPING-TYA-20260709.md`

## Objetivo

Definir el mapeo minimo source-safe de dominios reales/sanitizados TyA antes de que el adapter `CX.data` DEV pueda leer datos Phase A, sin import ni writes.

## Impacto Phase A real TyA

El mapping mantiene foco en datos reales limpios: HR fuente operacional, visitas reales/sanitizadas, shoppers historicos, certificaciones preservadas, postulaciones/asignaciones, liquidaciones/pagos junio, rutas de cuestionario, colas y auditoria.

## Dominios cubiertos

- `tenant_project_config`
- `hr_source_status`
- `visits`
- `shoppers`
- `applications_assignments`
- `certifications`
- `liquidations_payments_june`
- `questionnaire_routes`
- `operational_queues`
- `audit_preview`

## Trabajo previo recuperado

Recupera HR source-safe/full-flow, reglas de Cinépolis, shoppers historicos, certificaciones ya presentadas, liquidaciones/pagos junio, sync HR/plataforma, colas operativas, auditoria y no-reversion Level 0/1.

## Guardrails

- No datos sensibles.
- No raw HR rows.
- No raw URLs o secretos.
- No fixtures como reales.
- No `.tmp` derivado como fuente original.
- No base vieja.
- No deduplicacion visual.
- No pagos reales.
- No pedir certificacion preservada sin revision.
- No tratar junio como visitas pendientes cuando lo pendiente es pago.

## Impacto backend reusable

Patron reusable de mapping source-safe por tenant/proyecto antes de activar adapter/runtime.

## Impacto Claude/prototipo

Claude debe diseñar pantallas usando dominios y campos seguros, con copy honesto y bloqueos visibles cuando falte fuente/ruta/gate.

## Impacto Academia

Debe explicar dominios, stable keys, sourceRef opaca, datos sensibles prohibidos, junio como control de pago y certificaciones preservadas.

## Estado seguro

Sin cambios en `/app/modules` o `/app/core`, adapter no habilitado, sin runtime, sin import de dominios, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.

## Commits

- `67c4f827e5cce4e54c1c693be69e7e15f0e04e68`
- `526020f228b6ee7de21cc3843b3f9d49c1da8b85`
- `aabe5e2a1d23a20eac3b9830f619d3060c3d89fc`
