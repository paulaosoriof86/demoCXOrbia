# Academia — impacto Corte 6 · acceso, identidad y confiabilidad de fuente

**Fecha:** 2026-07-30  
**Estado:** `IDENTITY_PROTECTED_PASS__AUGUST_PROVIDER_TABS_MISSING__GVIZ_FAIL_CLOSED`

## Acceso/identidad
El preview humano conserva perfil→entrada automática. Source-safe enmascara PII; runtime protegido usa Auth/RBAC/Rules + Firestore. Gate identidad PASS: shoppers340/340 y visitas616/616 con nombre real, placeholders0.

## Lección nueva — existencia del tab antes del contenido
La reconciliación de agosto reveló un riesgo reusable: Google Visualization CSV puede devolver datos aunque se solicite el nombre de una pestaña inexistente. Por tanto, “recibí filas” no demuestra “el tab existe”.

Metadata provider directa confirmó que la HR llega hasta `JULIO 26`/`JULIO 26 HN`; `AGOSTO 26` y `AGOSTO 26 HN` todavía no existen. La interpretación anterior de agosto quedó superseded.

## Patrón reusable
1. leer metadata provider o un registry firmado/observado;
2. validar existencia exacta del tab;
3. solo después leer GViz/API y validar país, periodo, estados e identidad;
4. si el tab no existe, HOLD fail-closed;
5. nunca copiar otro mes o aceptar fallback silencioso;
6. write plan únicamente desde fuente real validada y con autorización.

## Fix implementado
- registry source-safe de tabs observados;
- enforcement que elimina/rechaza phantom tabs de GViz;
- planner Agosto provider-tab-first;
- re-read final14 periodos/28 tabs/616 visitas/agosto0;
- decisión `HOLD_AUGUST_REQUIRED_PROVIDER_TABS_MISSING`.

## Contenido para manuales/cursos
- UX DEV vs Auth real;
- source-safe vs protected runtime;
- mínimo privilegio e identidad por rol;
- metadata provider como gate de existencia;
- riesgo de fallback de conectores/APIs;
- troubleshooting por fuente/tab/periodo/identidad;
- conflicto o ausencia → HOLD, no inferencia.

## Siguiente actualización
Cuando exista la fuente autorizada de agosto, repetir metadata/source-safe, validar el delta, ejecutar write autorizado/readback y luego preprod protegida antes del cutover.