# RESUMEN PARA CLAUDE — Arquitectura backend TyA corregida y estado canónico

**Fecha:** 2026-07-29  
**Estado:** `NO_NUEVA_CANDIDATA__PRESERVAR_FIXES_CORE__CANONICAL_BACKEND_RECOVERED__AUG_HN_SOURCE_HOLD`

## Contexto vinculante
- Legacy TyA Consultores actual = plataforma a retirar; solo datos útiles limpios.
- `cxorbia-backend-dev` = backend DEV canónico de CXOrbia con TyA como primer tenant; NO es legacy.
- `cxorbia-tya-dev-260729-c4` = sandbox técnico usado para probar fail-closed/empty-backend; NO es destino de materialización.
- Hosting público actual de TyA se conserva para el cutover final.

## Qué debe preservar Claude
- fail-closed sin demo/localStorage;
- backend vacío como estado válido;
- null-safety proyecto/período;
- limpieza de DOM/shell al cambiar rol;
- entrypoint sin assets inexistentes;
- gate de integridad de scripts;
- proyecto padre configurable separado de periodo;
- selector de proyecto no debe listar meses/periodos como proyectos.

## Modelo semántico confirmado
El plan canónico reutilizado R6/R16D confirma:
- 1 tenant TyA;
- 1 proyecto padre `cinepolis`;
- periodos como hijos del proyecto;
- visitas dentro del periodo;
- 14 periodos / 616 visitas en el source lock histórico hasta julio.

Los 29 documentos `projects` actualmente existentes en Firestore incluyen materialización previa period-country y pilotos. No deben tomarse como modelo final solo porque estén poblados. Backend los comparará/reutilizará mediante R16E; Claude no debe rediseñar nada para acomodar esa estructura previa.

## Hallazgo de fuente actual
HR viva avanzó a 15 periodos / 684 visitas / 236 referencias shopper protegidas.

Julio 2026 está consistente: GT34/HN10.

`AGOSTO 26 HN` está en HOLD de fuente:
- 34 filas visitables;
- columna País=GT en las 34;
- no debe presentarse como HN confiable ni sincronizarse/materializarse hasta corrección/confirmación de HR.

Si el frontend llega a mostrar estados de fuente, debe ser honesto: `requiere revisión de fuente`, nunca fingir sincronización correcta.

## Shoppers y certificaciones
- Backend canónico ya contiene 215 shoppers; no se recrean.
- Certificaciones materializadas=0 y no están embebidas en shopper.
- Se hará refresh legacy dirigido de shoppers nuevos/actualizados + historial de certificaciones ya presentadas.
- El shopper no debe repetir una certificación existente cuando el carryover esté materializado.

## Qué NO debe hacer Claude
- no crear nueva candidata por esta corrección;
- no modificar `app/modules` por la distinción de backends;
- no reintroducir datos demo para ocultar faltantes;
- no asumir que `cxorbia-backend-dev` debe vaciarse o reemplazarse;
- no hardcodear Cinépolis como producto global;
- no convertir meses/países en proyectos independientes en el modelo de producto;
- no tratar `AGOSTO 26 HN` como fuente válida mientras el HOLD siga abierto.

## Siguiente bloque backend
R16E provider compare read-only contra `cxorbia-backend-dev`: clasificar `create/update/noop/review`, preservar extras, cero deletes/writes y producir plan exacto posterior.

## Clasificación
- **Reusable CXOrbia:** proyecto vs periodo; fail-closed; migración incremental; fuente inconsistente a review.
- **Exclusivo TyA:** IDs concretos, HR y carryover legacy.
- **Academia:** actualizar rutas/manuales de proyecto-periodo, certificaciones y revisión de fuente.
