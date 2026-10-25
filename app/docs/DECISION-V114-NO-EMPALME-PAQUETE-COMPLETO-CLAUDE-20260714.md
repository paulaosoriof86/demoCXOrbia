# DECISIÓN V114 — NO EMPALME Y PAQUETE COMPLETO PARA CLAUDE

Fecha: 2026-07-14

## Decisión

V114 no se empalma ni reemplaza la baseline activa.

Razones:

- el propio ZIP se declara corte parcial;
- manifest/build-lock V114 no fueron regenerados;
- `node docs/verify-manifest.mjs` falla;
- smoke completo del corte no fue ejecutado;
- persisten residuos de proyecto/periodo en Finanzas y Academia;
- el backlog frontend comercializable acumulado sigue siendo sustancial.

V114 se conserva como candidata incremental de trabajo para que Claude continúe sobre la versión más avanzada, sin volver a una candidata anterior.

## Paquete preparado

`PAQUETE-CLAUDE-CXORBIA-V114-A-V115-COMPLETO-COMERCIALIZABLE-20260714.zip`

Incluye instrucción maestra, backlog completo por módulo, evidencia forense, gate de aceptación/smoke, impacto Academia y contratos reutilizables a reflejar. No contiene datos ni reglas de cliente real y no pide tareas backend.

## Estado de seguridad

- Sin empalme ni actualización de baseline.
- Sin deploy, producción, writes o imports.
- Sin Firebase/Auth/Storage/Make/Gemini/pagos.

## Clasificación

- Reusable CXOrbia: backlog comercializable, gate reproducible, contexto canónico y estados honestos.
- Exclusivo TyA/Cinépolis: no incluido en el paquete.
- Claude/prototipo: totalidad del paquete V114 → V115.
- Academia: matriz transversal por módulo y rol.
- Sin impacto Claude: IAM/Firebase, adapters, importadores backend y producción.
