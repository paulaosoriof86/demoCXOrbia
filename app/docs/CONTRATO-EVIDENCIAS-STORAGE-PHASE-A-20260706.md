# Contrato evidencias Storage Phase A - CXOrbia TyA

Fecha: 2026-07-06

## Objetivo

Preparar el contrato de evidencias por tenant, proyecto, visita y shopper antes de activar Storage real.

## Archivo creado

- `app/contracts/evidence-storage-routing-phase-a.tya.contract.json`

## Tipos de evidencia

- foto;
- video;
- audio;
- documento;
- link externo;
- recibo;
- otro.

## Modos de almacenamiento

- `not_configured`
- `placeholder`
- `external_reference_only`
- `ready_for_storage`
- `controlled_enabled`

## Metadata prevista

Incluye fecha, usuario, tipo de archivo, tamano, checksum, referencia externa y estado de revision.

## Seguridad

No activa Storage. No permite datos sensibles. Exige aislamiento por tenant y proyecto. No habilita source lock ni produccion.
