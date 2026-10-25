# Cambios - CX.data runtime switch rollback + smoke

Fecha: 2026-07-09  
Bloque: rollback y smoke para runtime switch CX.data  
Estado: documentado y seguro.

## Archivos creados

1. `app/docs/CXDATA-RUNTIME-SWITCH-ROLLBACK-SMOKE-CHECKLIST-20260709.md`
   - Checklist de precondiciones, rollback, smoke DEV, NO GO, GO DEV y GO produccion.
   - Define archivos permitidos y prohibidos.
   - Mantiene bloqueo de runtime switch hasta GO explicito.

2. `tools/contracts/tya-cxdata-runtime-switch-smoke-plan-validate.mjs`
   - Validador seguro del plan rollback/smoke.
   - No modifica runtime, no escribe, no importa, no despliega.

3. `app/docs/CAMBIOS-CXDATA-RUNTIME-SWITCH-ROLLBACK-SMOKE-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Prepara el paso previo obligatorio antes de conectar `CX.data` a TyA/Cinepolis real-data preview/staging.

Reduce riesgo de romper modulos o avanzar sin salida de emergencia.

## Trabajo previo recuperado

- Runtime switch gate.
- Bridge real-data preview.
- Staging canonico HR source-safe.
- HR viva multi-tab.
- Reglas TyA/Cinepolis.
- Certificaciones preservadas.
- Liquidaciones junio.
- Legacy util como trazabilidad.

## Claude/prototipo

Si aparece necesidad visual en smoke, preparar paquete Claude corto:

1. Fuente HR configurable.
2. Estados demo/preview/staging/importado/produccion.
3. Cinepolis normal configurable.
4. Copy honesto de import/sync/pago/IA.
5. Academia/manuales de configuracion HR y revision.

## Bloqueos

- Runtime switch no autorizado.
- Falta input sanitizado minimo o decision explicita de manifest-only preview.
- Falta URL DEV/preview verificable.
- Falta GO explicito de Paula.
- Produccion bloqueada.

## Siguiente bloque recomendado

Preparar `minimal sanitized input contract` para runtime DEV preview: que campos minimos se necesitan para que Paula pueda visualizar TyA/Cinepolis sin PII y sin import real.

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
