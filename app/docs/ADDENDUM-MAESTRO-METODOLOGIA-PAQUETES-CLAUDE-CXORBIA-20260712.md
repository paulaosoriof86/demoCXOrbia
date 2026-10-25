# ADDENDUM MAESTRO — METODOLOGÍA DE AUDITORÍA Y PAQUETES PARA CLAUDE
## CXOrbia · regla transversal permanente
Fecha: 2026-07-12

## Objetivo

Evitar que una candidata de Claude se acepte por declaraciones, presencia de código o capturas aisladas. Cada entrega se compara contra el paquete exacto que originó la corrección, la baseline viva inmediata y el estado real del repo.

## Fuentes obligatorias

Antes de auditar: última ZIP, candidata anterior/source lock, paquete exacto enviado a Claude, maestro/addenda, PR #7/rama viva, última auditoría, `CAMBIOS-BACKEND.md` o addendum, `RESUMEN-PARA-CLAUDE.md` o addendum y `PENDIENTES-PROTOTIPO.md` o addendum.

## Matriz de afirmaciones

Cada afirmación de Claude termina como:

- `PASS_COMPROBADO`: prueba funcional independiente reproducida;
- `PASS_ESTRUCTURAL`: código coherente sin reproducción completa de runtime;
- `PARCIAL`: corrige el caso principal pero deja variantes;
- `FAIL`: el comportamiento contradice la afirmación;
- `NO_PROBABLE`: el entorno no permite verificar;
- `HEREDADO`: ya existía y no pertenece al delta.

La presencia de función, comentario, manifest o captura no equivale por sí sola a PASS comprobado.

## Auditoría mínima

1. Identidad externa/interna, archivos modificados/agregados/eliminados, scripts, sintaxis, manifest, build lock y hashes.
2. Delta real separado de acumulado heredado, regresiones, cambios fuera de alcance y mejoras locales/backend que deben preservarse.
3. Prueba funcional del caso exacto y un caso negativo o límite.
4. Roles, rutas, consola/page errors, responsive nativo y modo sin fixtures cuando el alcance lo requiera.
5. Impacto en Academia, manuales, rutas, notificaciones, tenant/proyecto/país/rol, monedas, permisos, source-safe y Phase A TyA.

No se acepta una prueba debilitada. Si se pidió que cada shopper vea solo su país, no es PASS que vea todos los países del proyecto.

## Decisión de empalme

Empalmar selectivamente y continuar cuando no exista P0, manifest/sintaxis estén correctos, los cambios sean reales y los pendientes restantes sean P1/P2. Los P1/P2 se documentan y acumulan; no generan automáticamente otro paquete.

Bloquear y devolver a Claude solo ante P0 comprobado: fuga de alcance, mezcla de países/monedas, dato incompleto procesado como pago, ruta crítica rota, pérdida de módulos/scripts, manifest no reproducible, promesa de integración real inexistente o regresión operativa Phase A.

## Regla de paquete Claude

Solo crear un nuevo paquete cuando exista P0 comprobado o Paula lo solicite expresamente.

Contenido máximo:

1. `README.md`;
2. instrucción única ejecutable;
3. checklist;
4. evidencia técnica mínima.

No incluir maestro completo, backend, contratos, migración, Firebase, workflows, gates, HR, datos reales, Make/Gemini ni tareas ajenas a Claude.

Cada tarea debe indicar archivo, comportamiento comprobado, corrección exacta, criterio de aceptación, prueba positiva, prueba negativa/límite, archivos prohibidos y lista `NO REABRIR`.

## Retroalimentación

Debe mostrar evidencia reproducible, por qué la prueba de Claude fue insuficiente o cambió el criterio, clasificación PASS/PARCIAL/FAIL y alcance mínimo de la siguiente entrega.

## Cierre documental

Actualizar auditoría forense, resumen Claude, pendientes prototipo, cambios/addendum, impacto Academia, PR #7, decisión de baseline/source lock/bloqueo y siguiente bloque exacto.

## Clasificación transversal

- Reusable CXOrbia;
- Exclusivo TyA/cliente;
- Claude/prototipo;
- Academia;
- Sin impacto Claude.

## Frase para instrucciones formales del proyecto

> Antes de aceptar o empalmar cualquier candidata de Claude, compara la última ZIP contra la baseline viva, el paquete exacto enviado a Claude y el repo actual; verifica cada afirmación con prueba funcional positiva y negativa. Solo genera un nuevo paquete Claude si existe un P0 comprobado o Paula lo solicita. El paquete debe contener exclusivamente tareas de frontend/Claude, máximo 3–5 tareas críticas, evidencia reproducible, criterios de aceptación y lista de puntos ya cerrados que no deben reabrirse. Si solo quedan P1/P2, documenta, empalma selectivamente y continúa Phase A.

Este addendum se lee antes de cada auditoría, retroalimentación, paquete Claude, decisión de empalme o source lock. No fija números de versión.