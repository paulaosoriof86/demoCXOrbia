# CAMBIOS-BACKEND-V57.md

## 2026-06-30 - Fase B2/B3 backend bulletins sobre V57

- Se uso el ZIP local `C:\Users\paula\Downloads\Prototype development request CXOrbia V57.zip` para confirmar/portar la base visual vigente.
- Se copio `/app` desde V57 y se preservaron los archivos backend ya construidos: `app/core/backend-config.js`, `app/core/backend-config-preview-dev.js`, `app/core/backend-firebase.js`, `app/core/backend-finance-benefits.js`, `app/core/backend-cxdata-finance-read.js`, `app/core/backend-operational-actions.js`, `app/core/backend-preview-status.js`, `app/core/backend-bulletins.js`, `app/index-backend-dev.html` y `firebase/**`.
- `app/index.html` se mantiene como demo normal y no carga backend global.
- `app/index-backend-dev.html` queda como preview backend DEV.
- `backend-preview-status` reporta fuente `firestore`, `localStorage/demo` o `pending`; Auth; tenant; proyecto; conteos; y ultimo error.
- `backend-bulletins` alimenta `CX.notif` desde Firestore sin tocar `modules/tablon.js`.
- `backend-bulletins` persiste leidos/no leidos en `tenants/{tenantId}/bulletinReads/{readId}`.
- `backend-bulletins` expone `CX.backendBulletins.createBulletin(...)` para crear novedades en preview DEV.
- `firestore.rules` queda preparado localmente para `bulletins` y `bulletinReads`, sin publicar.
- Se elimino cualquier prompt de navegador para credenciales DEV.
- Validaciones: dry-run bulletins OK, validator OK, `node --check` OK; emulador Firestore pendiente por falta de Java en PATH.
- No deploy, no Hosting, no merge, no produccion.

Registro de cambios específico para continuidad V57/backend.

## 2026-06-30 — Bridge backend para tablón/novedades

Motivo:

- Paula compartió referencia visual de Orbit con tablón/modal de novedades y pidió considerarlo para Orbia/CXOrbia.
- Se documentó para Claude como mejora visual y para backend como modelo de datos vivo.

Archivos creados/modificados:

- `app/core/backend-bulletins.js`: bridge Firestore para alimentar `CX.notif` sin modificar módulos UI.
- `app/index-backend-dev.html`: carga `backend-bulletins.js` solo en preview backend DEV.
- `firebase/schema/cxorbia-bulletins-v1.json`: schema inicial para novedades/tablón.
- Issue #4: requerimiento Claude/frontend del tablón modal.
- Issue #5: modelo backend Firestore para tablón.
- Issue #6: port V57 completo manteniendo backend DEV.

Qué hace el bridge:

- Lee novedades Firestore desde el tenant activo.
- Convierte documentos Firestore al formato actual de `CX.notif`.
- Persiste leído/no leído en `bulletinReads`.
- Permite crear novedades desde el store actual sin tocar `modules/tablon.js`.

Impacto:

- No se modificó `/app/modules`.
- No se modificó `app/index.html`.
- No se hizo deploy.
- No se tocó producción.
- El bridge solo se carga en `app/index-backend-dev.html`.

Pendiente/riesgo:

- Falta publicar/validar reglas Firestore específicas para `bulletins` y `bulletinReads` en DEV.
- Falta validar visualmente con Auth OK.
- Falta que Claude implemente el modal de novedades al inicio si no queda cubierto por `modules/tablon.js`.

## 2026-06-30 — Diagnóstico honesto preview backend

Archivos modificados:

- `app/core/backend-preview-status.js`
- `app/core/backend-firebase.js`

Qué cambió:

- El badge de preview ya no debe decir “conectado” solo porque cargó el script.
- Ahora distingue fuente: `firestore`, `localStorage/demo` o `pending`.
- Muestra tenant, Auth, proyecto y conteos.
- El adapter marca `window.CX_BACKEND_DATA_SOURCE` y `window.CX_BACKEND_LAST_STATE`.
- Si el backend falla, el preview debe declarar que sigue usando localStorage/demo.

Impacto:

- No se modificó `/app/modules`.
- No se modificó `app/index.html`.
- No se hizo deploy.
- No se tocó producción.
- No se cargaron datos nuevos.

Pendiente/riesgo:

- Falta validar visualmente en navegador sobre la base V57 una vez que el ZIP V57 quede portado al repo o al worktree local.
- Falta cerrar Auth DEV con flujo seguro y sin pedir información privada a Paula.

## 2026-06-30 — Inicio fase B2 sobre prototipo V57

Motivo:

- Paula entregó `Prototype development request CXOrbia V57.zip` como prototipo más reciente de Claude.
- Se debe trabajar backend sobre V57 sin perder Firebase DEV, reglas, Auth DEV, HR histórico, beneficios y documentación ya construida.
- Paula recordó que la documentación debe guardarse en GitHub porque no está descargando paquetes manualmente.

Archivos creados en repo:

- `PLAN-TRABAJO-BACKEND-V57.md`
- `PENDIENTES-PROTOTIPO-V57.md`
- `RESUMEN-PARA-CHATGPT-BACKEND-V57.md`
- `RESUMEN-PARA-CLAUDE-V57.md`
- `INCIDENCIAS-INTEGRACION-BACKEND-V57.md`

Trabajo iniciado:

- Se actualizó la documentación viva de continuidad para V57.
- Se separaron pendientes reales de Claude de incidencias de integración backend.
- Se mantiene como siguiente fase activa el port del preview backend sobre V57.

Impacto:

- No se hizo deploy.
- No se tocó producción.
- No se activó backend global.
- No se modificó `/app/modules` desde backend.
- No se cargaron nuevos datos reales.

Pendiente/riesgo:

- El ZIP V57 debe convertirse en la base visual de la rama de trabajo antes de validar backend visualmente.
- El conector GitHub permitió documentar y preparar la fase, pero el port completo del ZIP V57 al repo requiere commit masivo o apoyo de Codex/PowerShell si el conector no permite subir todos los archivos directamente.
- Siguiente gate: `app/index-backend-dev.html` sobre V57 debe mostrar si lee Firestore o localStorage/demo.
