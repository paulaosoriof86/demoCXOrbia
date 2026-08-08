# PHASE A — AVANCE V159 CORTE 0

Fecha inicial: 2026-07-17  
Actualización: 2026-07-18

## Cerrado y preservado

- Auditoría focalizada V159 completada.
- Decisión GO confirmada sin P0.
- `APPLY_DELTA_DIRECTLY` ejecutado.
- Commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`.
- Manifest, build-lock y verificador generados y reconciliados.
- Gates estructurales iniciales PASS.
- Preflight semántico estático PASS.
- Backend, overlays, multi-proyecto, HR source-safe, `CX.data`, importadores, reviewQueue, rollback y reconciliaciones preservados.
- No corresponde solicitar V160, reauditar V159 ni repetir el empalme.
- Workflows/gate alterados durante el intento fallido fueron restaurados y su delta neto quedó en cero.

## Estado actual

`CORTE_0_POST_GATES_RERUN_PENDING_EVIDENCE`

V159 permanece:

`EMPALMED_PENDING_POST_GATES` / `TECHNICAL_PASS_PENDING_VISUAL`

No es todavía `ACTIVE_BASELINE`.

## Pasos intermedios completados en Corte 0

1. Se leyó la evidencia sanitizada del intento anterior de Hosting DEV.
2. Se confirmó que el deploy no se ejecutó; el fallo ocurrió en gates locales después de catorce pasos previos PASS.
3. Se identificó que un builder temporal R18A colapsaba proyecto y periodo.
4. Se confirmó que el builder canónico R15G ya genera proyecto `cinepolis` y periodo con llave propia.
5. La deriva shopper 215/216 se clasificó como warning de revisión R11D, sin inventar, completar o borrar identidades.
6. Se corrigió la ruta del manifest en `build-lock.js`.
7. Se reconciliaron registry, atomicidad, fast lane, contrato y verificador Phase A con V159 empalmada pendiente de freeze.
8. Se marcó como superado el checkpoint histórico V113/V114 que competía con las fuentes canónicas.
9. Se reactivó el workflow canónico R15G con el commit `6e36f2f2f9621d90390e9215d2f3bfa0efdceb15`.
10. Se actualizaron checkpoint, CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES y Academia.

## Evidencia esperada del gate activo

El rerun debe producir `ok:true` y cero blockers en:

1. source semantics R15G;
2. smoke Admin, Shopper y Cliente;
3. proyecto, periodo, KPI e histórico.

Warnings R11D permanecen visibles y no autorizan materialización ni cambios de identidad.

## Pendiente exacto del Corte 0

1. Confirmar evidencia sanitizada del rerun post-empalme.
2. Ejecutar el workflow manual Hosting DEV R15G con `DEPLOY_DEV_ROOT_R15G`.
3. Publicar únicamente el build V159 exacto en `hosting:cxorbia-dev`.
4. Ejecutar smoke remoto del mismo build.
5. Validar visualmente:
   - login TyA;
   - proyecto vs periodo;
   - cambio real de KPIs, filas e histórico;
   - Dashboard, Proyectos, Periodos, Histórico y Visitas;
   - Admin, Shopper, Cliente y Academia;
   - copy honesto de integraciones.
6. Corregir focalizadamente solo si aparece diferencia reproducible.
7. Congelar V159 como `ACTIVE_BASELINE` si no existe P0.

## Avance del plan Phase A

- Corte 0: en progreso; gobierno, gates y documentación reconciliados.
- Corte 1: no iniciado formalmente, aunque sus fuentes, mapping, conteos y adapters ya están preparados y no se reconstruyen.
- Cortes 2–7: piezas contractuales y source-safe existentes preservadas; se ejecutan por gate cuando corresponda.
- Corte 8: producción sigue HOLD hasta cerrar los cortes previos y recibir autorización específica.

## Plan posterior al freeze

`CORTE 1 CONTEXTO/HR/HISTÓRICO → CORTE 2 SHOPPER/OPERACIÓN → CORTE 3 FINANZAS/PAGOS → CORTE 4 BACKEND LIMPIO/CX.data READ-ONLY → CORTE 5 MATERIALIZACIÓN DEV → CORTE 6 AUTH/RBAC → CORTE 7 HR SYNC/EVIDENCIAS → CORTE 8 PRODUCCIÓN`

Nada de esto empieza desde cero: adapters, mapping, materialization plan, importadores, Auth readiness, reviewQueue, rollback y contratos de sync ya existen.

## Claude/prototipo

- Sin tarea frontend nueva confirmada.
- No generar paquete general ni pedir V160.
- Claude solo interviene ante P0 frontend reproducible localizado por archivo/módulo.
- P1/P2 se documentan sin bloquear el freeze.

## Academia

- Sin cambio de UX o contenido en el saneamiento técnico.
- Pendiente smoke por rol y validación del mismo build V159.
- Debe reflejar proyecto vs periodo, source-safe vs runtime live, revisión humana, certificaciones presentadas, liquidación vs pago, notificaciones y proveedores apagados.

## Bloqueos vivos

- El conector disponible no expone `workflow_dispatch` para ejecutar el Hosting DEV manual.
- El runtime local no dispone de credencial Firebase/Google.
- Firebase nuevo y vacío sigue bloqueado por IAM para el corte correspondiente; no bloquea el saneamiento técnico actual, pero sí el futuro Corte 4.

## Clasificación

- Reusable CXOrbia: estado transicional empalmado→post-gates→freeze y fuentes canónicas únicas.
- Exclusivo TyA/Cinépolis: 14 periodos, 616 visitas, 44 por periodo y revisión R11D 215/216.
- Claude/prototipo: sin pendiente nuevo confirmado.
- Academia: validación por rol y actualización solo ante cambio real.
- Sin impacto Claude: registry, manifest, build-lock, gates, validadores y checkpoints.

## Estado seguro

PR #7 draft/open/no merge. Sin deploy ejecutado en este bloque, producción, imports reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
