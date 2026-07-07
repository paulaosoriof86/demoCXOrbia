# Smoke gate fail fix - revision-admin post V89

Fecha: 2026-07-06

## Bloque completado

Se revisó el artifact `phase-a-rc-smoke-report` que Paula descargó desde GitHub Actions y se identificó la causa raíz del fallo del workflow.

## Causa raíz

El gate falló por un hard fail único:

- `local_script_missing`
- Script referenciado: `modules/revision-admin.js`
- Archivo esperado: `app/modules/revision-admin.js`

El reporte también mostró warnings de residuos de texto P0 mitigados por el guard de copy seguro, pero esos warnings no eran el motivo del fallo.

## Corrección aplicada

Se restauró `app/modules/revision-admin.js` desde la baseline V89 empalmada.

Motivo:

- `app/index.html` ya cargaba `modules/revision-admin.js`.
- El archivo sí existía en el paquete V89.
- La ausencia del archivo rompía el gate por script local faltante.
- Es un P0 estructural de carga, no una mejora visual.

## Qué contiene el módulo restaurado

El módulo define:

- `CX.revisionStore`.
- Estados granulares de revisión: pendiente, en revisión, requiere corrección, aprobada para submitido, submitido registrado, rechazada, conflicto HR y cancelada.
- `CX.revisionAdmin` como modal de revisión de visita.
- Separación didáctica y operativa entre cuestionario, revisión, submitido y liquidación.
- Advertencia de que HR sync real queda pendiente de activación backend.

## Estado del warning restante

El warning de residuos de fuente queda vivo y documentado:

- está mitigado visualmente por `app/core/production-copy-guard.js`;
- no bloquea RC si el gate no tiene hard fails;
- debe resolverse después con patch permanente por archivo.

## Impacto Academia

Este bloque afecta Academia porque refuerza la separación de estados:

- cuestionario realizado/completado;
- revisión admin;
- aprobado para submitido;
- submitido registrado;
- liquidación candidata;
- pago confirmado.

Pendiente Academia:

- actualizar cursos/manuales para explicar estos estados de revisión.
- validar visualmente que `a_backend_prepared` y `a_ops_conflicts_route` abren correctamente.

## Estado seguro

Sin deploy, sin producción, sin merge, sin Firestore/Auth/Storage reales, sin HR writes reales, sin Make/Gemini/mensajería/correo real y sin datos sensibles.

## Siguiente paso

Esperar o revisar nuevo run del workflow disparado por el commit. Si el nuevo gate queda sin hard fails, la rama puede pasar a RC Phase A controlada pendiente de smoke visual/consola.
