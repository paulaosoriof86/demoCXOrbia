# RESUMEN PARA CLAUDE — ADDENDUM R20/M1

**Fecha:** 2026-07-23  
**Estado:** `V174_PRESERVADA_SIN_NUEVA_CANDIDATA`

## Resultado

La corrección de lectura HR y los gates R20/M1 se resolvieron en backend/tools. Claude no debe producir otra candidata por este bloque.

## Preservado del frontend

- V174 permanece empalmada.
- Los seis módulos V174 no se modificaron.
- `CX.data` conserva su interfaz exacta.
- El bridge financiero mantiene `0` confirmado distinto de `null`.
- Corte 2A canonical permanece PASS.
- Reportes frontend runtime permanecen PASS.

## No modificar desde Claude

- builder R20;
- contratos HR;
- runners GitHub Actions;
- source lock/build-lock;
- adapters live;
- Cloud Run y `fresh=1`;
- reglas de `sourceRevision`;
- conteos actuales como constantes frontend.

## Fuente actual observada

La ejecución read-only leyó:

- 14 periodos;
- 28 tabs;
- 616 visitas;
- 476 GT y 140 HN;
- 209 shoppers source-safe;
- julio 2026 con 44 visitas.

Estos valores son evidencia de la HR en el momento del gate. No deben convertirse en fixtures ni hardcodes.

## Reglas reutilizables para el prototipo

- Las variantes de encabezado se resuelven por contrato, no por nombre del mes.
- La ausencia de `ID CINEMA` nunca inventa un identificador.
- La asignación, agendamiento, realización, cuestionario, submitido, liquidación y pago son estados separados.
- Liquidación y pago solo se confirman con fuente financiera.
- Cambio de proyecto y periodo debe conservar el mismo alcance y `sourceRevision` en Dashboard, Visitas, Liquidaciones y Reportes.
- Una sesión Shopper sin identidad verificable continúa fail-closed.

## Pendiente para Claude

No existe pendiente nuevo de implementación derivado del bloque R20. Permanecen únicamente las validaciones visuales y mejoras P1/P2 ya registradas.

No pedir ni entregar otra candidata antes de cerrar:

`source lock final → gates finales → Hosting DEV → validación visual → freeze Phase A`.

## Academia

Incorporar posteriormente, sin bloquear producción:

- diferencias entre snapshot, lectura viva y sourceRevision;
- resolver encabezados por contrato;
- ausencia distinta de cero;
- evidencia técnica distinta de aprobación visual;
- liquidación distinta de pago.

## Clasificación

- **Reusable CXOrbia:** reglas anteriores.
- **Exclusivo cliente:** conteos TyA observados.
- **Claude/prototipo:** cero cambio requerido ahora.
- **Academia:** contenido pendiente no bloqueante.
- **Sin impacto Claude:** runners, source lock, Playwright y artifacts.
