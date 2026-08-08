# Cambios - Minimal sanitized input TyA Phase A

Fecha: 2026-07-09  
Bloque: input sanitizado minimo para DEV real-data preview  
Estado: documentado y seguro.

## Archivos creados

1. `backend/contracts/tya-minimal-sanitized-input-phase-a-v1.json`
   - Contrato de payload minimo sanitizado para visualizar TyA/Cinepolis en DEV preview.
   - Define projectConfig, periods, visits, shoppers, certificationPreservation, liquidationCandidates e issues.
   - Define campos prohibidos y niveles de preview.

2. `tools/contracts/tya-minimal-sanitized-input-validate.mjs`
   - Validador seguro de input sanitizado minimo.
   - No conecta runtime, no escribe, no importa, no despliega.

3. `app/docs/MINIMAL-SANITIZED-INPUT-TYA-PHASE-A-20260709.md`
   - Documentacion funcional del bloque.

4. `app/docs/CAMBIOS-MINIMAL-SANITIZED-INPUT-TYA-PHASE-A-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Define exactamente que informacion real/sanitizada se necesita para dejar de depender de demo data y preparar DEV preview de TyA/Cinepolis.

## Trabajo previo recuperado

- HR viva multi-tab.
- Staging canonico source-safe.
- Runtime switch gate.
- Bridge real-data preview.
- Cinepolis como proyecto normal configurable.
- Reglas HR/Q1/Q2.
- Certificaciones preservadas.
- Liquidaciones junio.
- Legacy util como trazabilidad.

## Claude/prototipo

Pendientes derivados:

- UI debe soportar niveles de preview.
- UI no debe mostrar datos reales si solo hay manifest-only.
- Cinepolis no debe hardcodearse.
- Academia debe explicar input sanitizado, review_required y niveles de preview.

## Bloqueos

- Falta payload sanitizado real/local para Level 1 o Level 2.
- Runtime switch no autorizado.
- Produccion bloqueada.
- No pedir HR de nuevo hasta agotar lo ya documentado y generado.

## Siguiente bloque recomendado

Crear generador de payload minimo desde manifest source-safe/documentacion recuperada, empezando por Level 0/Level 1 sin PII, para que el bridge tenga input validable.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin runtime switch.
- Sin modulos modificados.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
