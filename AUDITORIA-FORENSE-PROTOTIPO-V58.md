# CXOrbia — Auditoría forense del prototipo V58

Fecha: 2026-07-01
Archivo auditado: `Prototype development request CXOrbia V58.zip`
Base comparativa disponible: `Prototype development request CXOrbia V52.zip`
Rama backend protegida: `release/cxorbia-tya-rc-20260630`
HEAD backend antes de documentar V58: `7668569e2500015d3036c881bbdaa0803e6d0c3b`

## Veredicto ejecutivo

V58 es una actualización válida del prototipo/frontend generada por Claude. Debe tratarse como la nueva base visual/prototipo para próximas correcciones de Claude, pero **NO reemplaza ni contiene el backend V57**.

No se debe sobrescribir el repo completo con el ZIP V58. Debe integrarse de forma controlada sobre la rama backend actual, preservando:

- `firestore.rules`
- `firebase/client-write-tools/*`
- `app/index-backend-dev.html`
- `app/core/backend*.js`
- `app/core/backend-config*.js`
- `app/core/backend-dev-auth.local.js` local ignorado
- `firebase/auth-dev-tools/output/*` local ignorado
- `.env`

## Estado de datos TyA

Los datos TyA vivos/históricos no están dentro del ZIP V58. V58 conserva datos ficticios/demo y referencias a `localStorage`.

Esto significa que **no se han perdido los datos TyA del trabajo backend anterior**; simplemente todavía no están visibles en el prototipo porque el gate backend no está cerrado y no se ha cargado la base TyA completa.

Evidencia acumulada previa que sigue vigente:

- HR histórico V4 fue trabajado/cargado en fases previas de backend DEV.
- Beneficios shoppers fueron cargados/validados en fases previas.
- El gate visible todavía no demuestra `Fuente: firestore` + `Tenant: tya` + conteos TyA en UI.
- Mientras el preview muestre demo/localStorage, no puede considerarse backend conectado.

## Comparativo V58 vs V52

Resultado de auditoría sobre ZIP:

- Archivos V58: 85
- Archivos V52: 79
- Archivos nuevos: 6
- Archivos modificados: 33
- Archivos eliminados: 0
- Archivos iguales: 46

Archivos nuevos relevantes en V58:

- `app/core/manuales-data.js`
- `app/docs/CAMBIOS-PROTOTIPO.md`
- `app/docs/CHECKLIST-VALIDACION-PROTOTIPO.md`
- `app/docs/PENDIENTES-PROTOTIPO.md`
- `app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md`
- `app/sw.js`

## Avances reales de V58 que deben preservarse

- PWA: `sw.js`, `CX.setFavicon`, `CX.setupPWA`.
- Login white-label: logo cliente, países configurados, texto “Desarrollado por CXOrbia”.
- Roles nuevos: `coordinador` y `aliado` con alcance por país.
- Manuales completos: `core/manuales-data.js`, visor amplio en Academia.
- Recursos del proyecto: Documentos evoluciona a recursos/visor/generación IA.
- IA multi-proveedor: Gemini, OpenAI, Anthropic y custom en `CX.ai`.
- Integraciones con estado honesto: no promete prueba real si falta backend.
- Finanzas: CxC/CxP editables y pago por shopper.
- CRM: ficha 360, propuestas vinculadas, proyectos/cuentas/tareas cruzadas.
- Importador: SheetJS para Excel real y flujo de refinamiento.
- Documentación interna nueva en `app/docs`.

## Hallazgos críticos V58

### P0 — V58 no trae backend V57

No están presentes en el ZIP:

- `firestore.rules`
- `firebase/client-write-tools/*`
- `app/index-backend-dev.html`
- `app/core/backend-config-preview-dev.js`
- `app/core/backend-dev-auth.local.js`

Acción: integrar V58 solamente como actualización de prototipo/frontend, no como reemplazo total.

### P0 — V58 sigue en localStorage/demo

Se detectan múltiples referencias a `localStorage` y datos demo. Esto es aceptable en prototipo, pero no puede presentarse como backend conectado.

Acción: Claude debe corregir el estado visual cuando backend esté conectado para que no muestre `localStorage/demo`.

### P0 — `banca` sigue filtrándose

Se detectan referencias a proyecto/tema/demo de banca, incluyendo:

- `core/data.js`: `Proyecto Banca`, `Cliente Banca (demo)`.
- `core/config.js`: tema `Esmeralda (banca)`.
- CRM/catálogos/documentos con referencias genéricas a banca.

Acción: en tenant TyA no debe aparecer `banca` como proyecto/demo ni como dato operativo.

### P0 — Python reaparece en README

`README.md` recomienda `python3 -m http.server`. Esto contradice la metodología de backend CXOrbia.

Acción: Claude debe corregir documentación del prototipo para indicar preview con Node, no Python.

### P0 — Codificación

Se detectó carácter corrupto en:

- `modules/aprendizaje.js:100`: fallback `�’`.

Acción: corregir UTF-8 real desde origen, no reemplazar masivamente carácter por carácter.

### P0 — Contradicción TyA/genérico en importador

`modules/importador.js` conserva texto `Migración desde versión anterior de TyA`, aunque la documentación indica que el importador se volvió genérico.

Acción: volverlo genérico para CXOrbia; TyA debe quedar como plantilla/import específico, no como etiqueta fija.

### P0 — IA no cerrada

`modules/importador.js` conserva `simulateAnalysis`. Si no hay llave/API debe mostrarse fallback honesto; con llave debe usar `CX.ai.ask`.

## Estado del smoke backend más reciente

Último reporte local recibido:

- Rama y HEAD local/remoto correctos.
- `backend-dev-auth.local.js` existe, está ignorado y no versionado.
- Validadores V57 OK.
- Firebase Auth REST OK para admin TyA y usuario externo smoke.
- `tenants/tya` leído por admin TyA: OK.
- `tenants/tya/projects`: NO OK.
- Admin TyA denegado en `tenants/otro`: OK.
- Usuario externo denegado en `tenants/tya`: OK.
- Servidor Node no quedó activo: pendiente.
- No hubo HTTP 200 ni module render smoke.

Conclusión: el gate backend sigue incompleto. No cargar base TyA completa todavía.

## Decisión operativa

1. V58 pasa a ser la nueva referencia de prototipo para Claude.
2. Backend V57 se preserva como capa separada y no debe ser revertido.
3. La siguiente fase backend debe reparar:
   - lectura/listado de `tenants/tya/projects`;
   - servidor Node local estable;
   - HTTP 200;
   - module render smoke;
   - badge `Fuente: firestore` y `Tenant: tya`;
   - ausencia de `localStorage/demo` y `banca` en tenant TyA.
4. Solo después del gate se carga piloto TyA pequeño; no base completa.
