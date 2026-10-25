# Cambios - Staging canonico HR TyA / Cinepolis source-safe

Fecha: 2026-07-09  
Bloque: staging canonico HR source-safe  
Estado: documentado y seguro.

## Archivos creados

1. `backend/contracts/hr-canonical-staging-source-safe-phase-a-v1.json`
   - Contrato de staging canonico HR source-safe.
   - Define tenant TyA, proyecto Cinepolis como proyecto normal configurable, fuente HR privada, tabs operativos, dashboards excluidos, columnas canonicas y datos prohibidos.

2. `tools/contracts/tya-hr-canonical-staging-source-safe-manifest.mjs`
   - Runner seguro que genera manifest source-safe.
   - No lee HR real directamente, no escribe Firestore, no importa, no despliega.
   - Puede recibir input local sanitizado opcional.

3. `app/docs/RECUPERACION-RUNBOOK-STAGING-CANONICO-HR-TYA-CINEPOLIS-20260709.md`
   - Runbook del bloque.
   - Explica salida esperada, comandos, reglas de clasificacion, bloqueos y pendientes Claude.

4. `app/docs/CAMBIOS-STAGING-CANONICO-HR-TYA-CINEPOLIS-20260709.md`
   - Bitacora puntual.

## Impacto real en Phase A / produccion

Este bloque traduce el trabajo recuperado de HR viva a un paso concreto hacia produccion real: manifest source-safe para staging canonico.

Avanza:

- confirmacion de tabs operativos;
- exclusion de dashboards;
- periodo/pais/quincena como base de staging;
- bloqueo de import automatico;
- proteccion contra PII;
- ruta para dejar de depender de demo data.

## Trabajo previo recuperado

- HR viva Google Sheets ya documentada.
- 30 tabs: 28 operativos + 2 dashboards.
- Lectura XLSX multi-tab ya probada localmente.
- Reglas Q1/Q2, Disponible desde, submitido, liquidaciones y junio.
- `JUNIO 26 HN` en revision.
- Julio como preparacion.
- Legacy/RTDB como complemento de trazabilidad, no base a copiar.

## Pendientes Claude/prototipo

- UI de proyecto debe incluir Fuente de Hoja de Ruta configurable.
- Debe mostrar estados: demo, preview real, staging sanitizado, review_required, importado, produccion.
- Cinepolis debe permanecer como proyecto normal configurable.
- Academia debe documentar configuracion HR, preview y errores.

## Bloqueos

- No import real.
- No Firestore writes.
- No HR writes.
- No URL/fileId en repo.
- No PII.
- No produccion hasta staging real, smoke visual y GO.

## Siguiente bloque recomendado

Crear o ubicar el puente `real-data preview -> CX.data` en un unico punto, usando manifest/staging source-safe y sin tocar modulos UI.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
