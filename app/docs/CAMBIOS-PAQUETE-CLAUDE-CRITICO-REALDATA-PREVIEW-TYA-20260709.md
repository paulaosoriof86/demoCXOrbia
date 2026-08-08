# Cambios - Paquete Claude critico real-data preview TyA

Fecha: 2026-07-09  
Bloque: paquete Claude corto y priorizado  
Estado: documentado.

## Archivos creados

1. `app/docs/PAQUETE-CLAUDE-CRITICO-REALDATA-PREVIEW-TYA-20260709.md`
   - Paquete corto y priorizado para Claude.
   - Incluye 5 tareas criticas: estados honestos, fuente HR, Cinépolis configurable, certificaciones/shoppers, liquidaciones/pagos.

2. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-REALDATA-PREVIEW-TYA-20260709.md`
   - Addendum de pendientes del prototipo derivados de real-data preview.
   - Clasifica impacto reusable, cliente, Claude y Academia.

3. `app/docs/CAMBIOS-PAQUETE-CLAUDE-CRITICO-REALDATA-PREVIEW-TYA-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Evita que el prototipo prometa produccion/import/sync/pago real cuando backend esta en preflight o preview, y prepara a Claude para hacer solo ajustes criticos sin redisenar.

## Trabajo previo recuperado

- Preflight local Level 0/1/2.
- GO/NO-GO runtime DEV preview.
- Bridge real-data preview.
- Runtime switch gate.
- Level 2 operacional sanitizado.
- Reglas TyA: HR, Cinépolis configurable, certificaciones preservadas, liquidaciones junio, no PII.

## Claude/prototipo

Tareas criticas consolidadas:

1. Estados honestos demo/Level 0/Level 1/Level 2/staging/importado/produccion.
2. Fuente HR configurable por proyecto.
3. Cinépolis como proyecto normal configurable.
4. Certificaciones preservadas y shoppers opacos/review_required.
5. Liquidaciones/pagos como control, no pago final.

## Academia

Debe explicar:

- niveles preview;
- configuracion HR;
- review_required;
- PII;
- certificaciones preservadas;
- pagos/liquidaciones en control.

## Bloqueos

- Claude no debe conectar providers ni runtime.
- Runtime switch sigue bloqueado.
- Produccion bloqueada.
- No copiar base vieja ni datos sensibles.

## Siguiente bloque recomendado

Abrir conversacion de continuidad o, si se continua aqui, preparar cierre operativo del bloque con estado acumulado y proximo paso local exacto.

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
