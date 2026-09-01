# PENDIENTES PROTOTIPO — V159 CORTE 0

Fecha inicial: 2026-07-17  
Actualización: 2026-07-18

## Cerrado y no reabrir

- Auditoría V159.
- Empalme V159.
- Commit de empalme `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`.
- Manifest, build-lock y verificador.
- Gates estructurales.
- Preflight semántico estático de proyecto/periodo/HR/histórico.
- Restauración exacta de workflows/gate alterados durante el intento fallido.
- Comparación neta contra el checkpoint técnico previo: cero archivos modificados.
- Diagnóstico focalizado del intento Hosting DEV: deploy no ejecutado y causa localizada antes del deploy.
- Registro de baseline y contratos Phase A reconciliados con V159 empalmada.
- Checkpoint histórico V113/V114 retirado como fuente operativa.
- P0 frontend demostrado: no.

No solicitar V160 ni reabrir backend, adapter, mapping, importadores, contratos, empalme o auditoría general desde cero.

## Pendiente técnico inmediato del Corte 0

1. Confirmar la evidencia sanitizada del rerun R15G activado por `6e36f2f2f9621d90390e9215d2f3bfa0efdceb15`.
2. Aceptar únicamente reportes con `ok:true` y cero blockers.
3. Mantener la deriva shopper 215/216 como warning de revisión R11D; no completar, borrar ni inventar identidades.
4. Ejecutar el workflow manual R15G restaurado con `DEPLOY_DEV_ROOT_R15G`.
5. Publicar únicamente el build V159 exacto en Hosting DEV.
6. Ejecutar browser gate de proyecto/periodo/KPI/histórico.
7. Ejecutar smoke remoto Admin, Shopper, Cliente y Academia.
8. Entregar URL y checklist visual a Paula.
9. Congelar `ACTIVE_BASELINE` solo después de validación visual sin P0.

## Pendiente frontend/Claude

No existe pendiente frontend nuevo confirmado por el saneamiento técnico.

Claude solo recibe una tarea si la revisión visual demuestra:

- P0 frontend reproducible;
- archivo/módulo exacto;
- rol y flujo afectados;
- esperado vs observado;
- impacto reusable y Academia;
- criterio de validación.

P1/P2 se acumulan por archivo/módulo y no bloquean el freeze.

## Mejoras y reglas reutilizables que ya quedaron documentadas

- Empalme físico y baseline visual son estados distintos.
- Una versión empalmada no se declara activa sin post-gates y validación visual.
- El último freeze visual permanece como rollback, no como runtime vigente.
- Proyecto y periodo nunca comparten identidad.
- Una deriva de conteo no se corrige inventando o borrando entidades.
- Los documentos históricos no pueden competir con índice, plan y checkpoint canónicos.
- El mismo build debe pasar gate local, Hosting DEV, smoke remoto y revisión visual.

## Academia pendiente en Corte 0

Validar sobre el mismo build V159:

- rutas y contenido por rol;
- listado, búsqueda, recomendaciones, categorías y deep links;
- manuales, cursos y certificaciones presentadas;
- edición, versionado, archivo/restauración;
- notificaciones;
- proyecto vs periodo;
- source-safe snapshot vs runtime live;
- liquidación vs pago;
- proveedores e integraciones todavía apagados.

## Estado seguro

Sin deploy ejecutado en este bloque, sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
