# Cambios backend — R16C y R16D

Fecha: 2026-07-13

## Archivos nuevos

- `backend/contracts/phase-a-canonical-materialization-source-alignment-r16c-v1.json`
- `tools/migration/tya-canonical-materialization-source-alignment-r16c.mjs`
- `.github/workflows/cxorbia-canonical-materialization-source-alignment-r16c.yml`
- `backend/contracts/phase-a-r14c-financial-overlay-review-plan-r16d-v1.json`
- `tools/migration/tya-r14c-financial-overlay-review-plan-r16d.mjs`
- `.github/workflows/cxorbia-r14c-financial-overlay-review-plan-r16d.yml`
- `backend/config/phase-a-r14c-financial-overlay-review-plan-r16d-result.source-safe.json`
- `backend/contracts/phase-a-canonical-materialization-provider-compare-r16e-v1.json`
- `tools/reconciliation/tya-canonical-materialization-provider-compare-r16e-precheck.mjs`
- `.github/workflows/cxorbia-canonical-materialization-provider-compare-r16e.yml`
- `app/docs/PHASE-A-CANONICAL-MATERIALIZATION-R16C-R16D-RESULT-20260713.md`

## Archivos modificados

- `.github/workflows/cxorbia-firebase-existing-dev-provenance-r15c.yml`
- `.github/workflows/cxorbia-cxdata-firestore-readonly-r15d.yml`
- `.github/workflows/cxorbia-canonical-materialization-dry-run-r16.yml`

Los tres workflows con lecturas de proveedor quedaron manual-only para evitar consumo repetido de cuota Firestore.

## Resultado funcional

- Plan canónico base: 1,415 operaciones.
- R16C detectó correctamente que 572 controles de liquidación no eran 247 filas financieras ni pagos.
- R16D enlazó 196 filas R14C exactas por `visitId`.
- 376 controles quedaron pendientes de fuente financiera exacta.
- Cola financiera completa: 92 = 51 reconciliaciones + 37 evidencias ledger + 4 controles de fuente.
- Gap shopper: 3, preservado sin match por nombre.
- Certificaciones: 213 shoppers pendientes de fuente, 0 inferencias.
- Pagos confirmados/inferidos: 0.
- Hard stops: 0.
- Precheck R16E: PASS.

## Bloqueo operativo real

El comparador contra Firestore quedó bloqueado por `RESOURCE_EXHAUSTED` después de ejecuciones proveedor repetidas. No es un error de datos ni requiere otro Firebase.

Mitigación:

- provider workflows manual-only;
- offline validators continúan automáticos;
- R16E se ejecutará una vez después de disponibilidad de cuota y autorización read-only.

## Impacto Phase A

Se deja un plan materializable con fuente financiera correctamente superpuesta, colas explícitas y estados honestos, sin tocar módulos UI ni ejecutar escrituras.

## Clasificación

- **Reusable CXOrbia:** overlay por llave estable, colas separadas, control vs pago y protección de cuota.
- **Exclusivo cliente:** conteos y fuentes TyA/Cinépolis.
- **Claude/prototipo:** sin P0; mantener `pending`, `review_required` y `not_confirmed`.
- **Academia:** documentar overlay financiero, colas y cuota.
- **Sin impacto Claude:** runners, contracts, workflow triggers y artifacts.

## Estado seguro

Sin cambios en `/app/modules`, sin writes, deletes, imports, deploy, producción, Make, Gemini, pagos o PII.
