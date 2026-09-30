# Cambios - Phase A real-data domain readiness pack TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`

## Archivos agregados

- `backend/contracts/phase-a-realdata-domain-readiness-pack-v1.json`
- `tools/contracts/tya-phase-a-realdata-domain-readiness-pack-validate.mjs`
- `app/docs/PHASE-A-REALDATA-DOMAIN-READINESS-PACK-TYA-20260709.md`

## Objetivo

Preparar el paquete de readiness dry-run para evaluar si una fuente TyA real/sanitizada original cumple el mapping source-safe de dominios antes de habilitar cualquier lectura DEV por `CX.data` adapter.

## Impacto Phase A real TyA

Este bloque permite avanzar hacia datos reales limpios sin activar runtime: valida dominios minimos, fuente source-safe, ausencia de datos sensibles, certificaciones preservadas, liquidaciones/pagos junio y cuestionario configurable.

## Dominios evaluables

- tenant/project config;
- HR source status;
- visits;
- shoppers;
- applications/assignments;
- certifications;
- liquidations/payments june;
- questionnaire routes;
- operational queues;
- audit preview.

## Guardrails

- No input privado en chat.
- No import.
- No writes.
- No runtime.
- No fixture como real.
- No `.tmp` derivado como fuente original.
- No base vieja.
- `canImport=false`.
- `canWrite=false`.
- Pagos como control, no ejecucion.

## Impacto backend reusable

Patron reusable para dry-run de dominios reales/sanitizados antes de adapter/runtime por tenant/proyecto.

## Impacto Claude/prototipo

Claude debe mostrar bloqueo honesto si falta dominio, campo, ruta o fuente. No debe inventar datos ni prometer runtime si el dry-run solo valido contrato/input.

## Impacto Academia

Debe explicar dry-run, dominios, fuente source-safe, GO dry-run vs runtime, datos sensibles prohibidos y diferencia entre fixture y fuente real/sanitizada.

## Estado seguro

Sin cambios en `/app/modules` o `/app/core`, adapter no habilitado, sin runtime, sin import de dominios, dry-run only, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.

## Commits

- `3bb358172365a1ee6db9cbb65dd7ab2db0b8bf95`
- `cb96a486f8043381729ecba82f4fd35938883881`
- `0a136f7d02813eeda6509080ff0e601acf4409fa`
