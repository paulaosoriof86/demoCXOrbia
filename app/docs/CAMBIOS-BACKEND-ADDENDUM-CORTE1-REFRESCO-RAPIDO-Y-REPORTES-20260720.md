# Cambios backend — Corte 1 refresco rápido y reportes

Fecha: 2026-07-20
Estado: `DEV_PROMPT_REFRESH_PASS_FRONTEND_REPORTS_PENDING`

## Evidencia visual

Paula confirmó que la HR actualiza KPI y disponibilidad de shopper, pero una recarga manual no iniciaba la comprobación y el cambio podía aparecer varios minutos después. Reportes Cliente volvió a funcionar; Reportes Admin sigue imprimiendo la página completa y el diseño solicitado no está implementado.

## Causa raíz de latencia

El watcher principal revisaba por foco/visibilidad y cada 60 segundos. El servicio además conserva un cache source-safe antes de reconstruir y canonizar la HR completa. La recarga manual podía mostrar la revisión anterior hasta el siguiente ciclo.

## Cambio aplicado

- Nuevo `app/adapters/tya-live-source-fast-trigger.js`.
- Comprueba la fuente al cargar, en `pageshow` y cada 15 segundos.
- `tools/release/tya-source-safe-live-binding-build-r22.mjs` lo incorpora y verifica en el build exacto.
- Cloud Run DEV se desplegó con cache de 15 segundos.

No se modificaron `app/modules/**` ni `app/core/**`.

## Evidencia de despliegue

- Run: `29799752544`.
- Job: `88538293485`.
- Source HEAD: `74857f7be31503052d90cdd00b5d0cc3e6afc476`.
- Decisión: `PASS_LIVE_HR_PROMPT_REFRESH_DEV_DEPLOY`.
- Artefacto: `8483321397`.
- Digest: `sha256:b5386d5a9c4a7f2d4ad385026bd2d795de59c7e54b2b8cf73d972fd516fc6d86`.
- Revisión smoke: `ec6bf1ee3a15d1d1068a3a5573a2a6e64be127faaa95c70de8eb2414955b9604`.
- Cache comprobado: `15000 ms`.

## Reportes frontend pendientes

Documento vinculante: `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE1-LATENCIA-REPORTES-DISENO-20260720.md`.

- `app/modules/operacion-extra.js`: PDF imprime página completa; edición no modifica el entregable; Excel genera CSV; no inventar métricas sin fuente.
- `app/modules/cliente-extra.js`: exportación básica funciona, pero falta branding y gráficas.
- `app/core/cliente-data.js`, `app/modules/cliente.js`: Panorama debe separar operación por periodo de scores pendientes.

## Clasificación

- Reusable CXOrbia: trigger de comprobación inmediata y periódica.
- Exclusivo cliente: HR TyA/Cinépolis y cache DEV.
- Claude/prototipo: Reportes Admin, plantilla multiformato y Panorama.
- Academia: manuales posteriores al cierre visual.
- Sin impacto Claude: Cloud Run, Hosting, gates y workflow temporal.

## Estado seguro

Sin merge, producción, importaciones, escrituras HR/Firestore/Auth/Storage, pagos, Make o Gemini live.
