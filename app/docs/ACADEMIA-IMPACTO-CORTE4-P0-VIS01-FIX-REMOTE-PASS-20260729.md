# ACADEMIA — Impacto Corte 4 · P0-C4-VIS-01

**Fecha:** 2026-07-29  
**Estado:** `REMOTE_REVALIDATION_PASS__HUMAN_VISUAL_PENDING`

## Aprendizaje reusable

El caso demuestra que un PASS de proveedor o de Hosting no basta para garantizar semántica correcta en navegador.

Patrón reusable:

`BACKEND REAL SELECCIONADO + AUTH NO DISPONIBLE => ESTADO VACÍO/FAIL-CLOSED + fallbackUsed=false`

Nunca:

`BACKEND REAL SELECCIONADO + AUTH NO DISPONIBLE => DEMO/localStorage`.

## Capas que deben enseñarse por separado

1. proyecto/base nueva;
2. Rules/read policy;
3. Auth y principal temporal;
4. adapter `CX.data`;
5. estado inicial antes del primer render;
6. fuente efectiva visible;
7. fixtures/demo;
8. Hosting/proof;
9. navegador local/remoto;
10. validación humana.

## Hallazgo metodológico

Después del fix principal, el diagnóstico local encontró `CX_CORTE4_READONLY.fallbackUsed` indefinido aunque la UI ya no mostraba demo. Esto no era el P0 original, pero sí una inconsistencia observable del contrato. Se corrigió inicializando el estado del guard desde el primer vaciado, antes de esperar Auth.

## Resultado

- diagnóstico local final PASS;
- browser remoto final PASS;
- exactly one Hosting DEV de revalidación para la autorización;
- 0 data writes;
- producción/merge 0.

## Manuales/cursos/rutas por rol

No actualizar todavía capturas definitivas de Academia hasta que Paula cierre la revalidación visual humana y Corte 4 quede congelado. Cuando cierre, reemplazar cualquier ejemplo que sugiera que la ausencia de Auth habilita datos demo.

## Clasificación

- Reusable CXOrbia: sí.
- Exclusivo TyA: solo identificadores del Firebase DEV.
- Claude/prototipo: sin cambio de UI.
- Academia: impacto directo.
- Notificaciones/rutas operativas: sin cambio funcional en este bloque.
