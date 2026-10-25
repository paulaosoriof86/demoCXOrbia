# Cambios - CX.data runtime switch gate Phase A

Fecha: 2026-07-09  
Bloque: runtime switch gate CX.data  
Estado: documentado y seguro.

## Archivos creados

1. `backend/contracts/cxdata-runtime-switch-gate-phase-a-v1.json`
   - Contrato GO/NO-GO para cambiar `CX.data` desde demo a real-data preview/staging.
   - Define unico punto, modos, requisitos DEV, requisitos produccion, NO GO, rollback y smoke.

2. `tools/contracts/tya-cxdata-runtime-switch-gate-validate.mjs`
   - Validador seguro.
   - No modifica runtime, no escribe, no importa, no despliega.
   - Bloquea switch si no hay input sanitizado y si demo sigue como fuente final.

3. `app/docs/CXDATA-RUNTIME-SWITCH-GATE-PHASE-A-20260709.md`
   - Documentacion funcional del gate.

4. `app/docs/CAMBIOS-CXDATA-RUNTIME-SWITCH-GATE-PHASE-A-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Este bloque define como pasar de demo a TyA real/sanitizado sin romper el prototipo ni parchar modulos.

## Trabajo previo recuperado

- HR viva multi-tab.
- Staging canonico source-safe.
- Bridge real-data preview.
- Cinepolis como proyecto normal configurable.
- Reglas HR/Q1/Q2.
- Certificaciones preservadas.
- Liquidaciones junio.
- Legacy util como trazabilidad.

## Claude/prototipo

Pendientes derivados:

- UI puede necesitar estado de fuente HR.
- Paquete Claude debe ser corto y critico.
- Cinépolis no debe hardcodearse.
- Estados honestos: demo, preview, staging, importado, produccion.
- Academia debe explicar fuente HR, preview, staging, produccion y review_required.

## Bloqueos

- Runtime switch no autorizado.
- Falta input sanitizado de visitas/shoppers/certificaciones/liquidaciones para runtime preview real.
- Falta rollback especifico del switch.
- Falta smoke checklist sobre URL verificada.
- Produccion bloqueada.

## Siguiente bloque recomendado

Crear `runtime switch rollback + smoke checklist` y luego preparar el input sanitizado minimo para DEV preview, sin pedir HR de nuevo.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin runtime switch.
- Sin modulos modificados.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
