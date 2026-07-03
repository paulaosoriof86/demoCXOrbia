# RESUMEN-PARA-CLAUDE.md

## 2026-07-03 - Addendum RC V74 Cloud frontend

Ver addendum vigente en `app/docs/RESUMEN-PARA-CLAUDE-RC-V74-20260703.md`.

Resumen ejecutivo para Claude:

- Conservar HR Source V74: no derivar `sourceRef` desde URL, `parsed_with_warnings.canImport=false`, sync bloqueado salvo `ready_for_import && canImport===true`, gates visuales y contrato DEV informativo.
- Corregir versionado: el ZIP fue recibido como V74, pero docs y releases internos aun dicen V72.
- Corregir Finanzas: reemplazar `En vivo` por estado honesto mientras no haya backend/cruce real.
- Corregir Automatizaciones/Make: no presentar POST real; el prototipo solo loguea/notifica localmente.
- Corregir IA: API keys y llamadas reales deben ser backend server-side antes de produccion.
- Profundizar SaaS multi-tenant: permisos por rol, feature flags por tenant/plan/pais/modulo, releases con targeting, confirmacion y rollback.
- Profundizar propuestas: wizard comercial completo, plantillas requeridas, estados completos y conversion futura a proyecto.
- No reemplazar la rama backend ni borrar `app/index-backend-dev.html`, `app/core/backend-*.js`, `tools/` o docs del PR #7.

## 2026-07-03 - Addendum HR Source V70

Ver addendum vigente en `app/docs/RESUMEN-PARA-CLAUDE-HR-SOURCE-V70-20260703.md`.

## 2026-06-30 - Estado B2/B3 backend V57

- La RC `release/cxorbia-tya-rc-20260630` fue actualizada contra el ZIP local `Prototype development request CXOrbia V57.zip`.
- La base visual V57 no debe mezclarse con la rama vieja `feat/firebase-backend-dev-config-20260627`.
- `app/index.html` queda como demo/prototipo normal sin backend global.
- `app/index-backend-dev.html` queda como preview backend DEV.
- El backend de novedades/tablón se resolvio sin tocar `modules/tablon.js`.
- Claude solo debe recibir pendientes visuales reales del prototipo V57, no fallas del preview backend DEV.
- Issue #4 sigue siendo frontend/Claude: incorporar tablón/modal de novedades si el prototipo visual lo requiere.
- Issue #5 queda cubierto a nivel backend local con modelo `bulletins`/`bulletinReads`, pendiente validacion con emulador/reglas cuando haya Java.
- Issue #6 queda avanzado: V57 + backend DEV preservado, sin deploy ni produccion.

Resumen vivo para entregar a Claude/frontend sin mezclar incidencias de integración backend con mejoras reales del prototipo.

## 2026-06-30 — Actualización V57 recibida

Paula entregó `Prototype development request CXOrbia V57.zip` como nueva base visual más reciente de Claude. Desde este punto, el backend debe trabajarse sobre V57 sin perder Firebase DEV, reglas, Auth DEV, HR histórico, beneficios y documentación previa.

Documentos específicos creados:

- `PLAN-TRABAJO-BACKEND-V57.md`
- `PENDIENTES-PROTOTIPO-V57.md`
- `RESUMEN-PARA-CHATGPT-BACKEND-V57.md`
- `RESUMEN-PARA-CLAUDE-V57.md`
- `INCIDENCIAS-INTEGRACION-BACKEND-V57.md`
- `CAMBIOS-BACKEND-V57.md`

Reglas de continuidad:

- V57 es la nueva referencia visual/funcional.
- No usar la rama backend vieja como base visual.
- No tocar `/app/modules` para resolver backend.
- Mantener `app/index.html` como prototipo normal.
- Mantener `app/index-backend-dev.html` como único preview backend DEV.
- Cada nueva entrega de Claude debe revisarse antes de seguir para no perder backend ni documentación.

Pendientes Claude actualizados:

- Ver `PENDIENTES-PROTOTIPO-V57.md`.

Incidencias backend separadas:

- Ver `INCIDENCIAS-INTEGRACION-BACKEND-V57.md`.

Siguiente gate backend:

1. Portar preview backend sobre V57.
2. Mostrar fuente real: Firestore o localStorage/demo.
3. Mostrar Auth OK o error claro.
4. Mostrar tenant `tya`.
5. Mostrar conteos Firestore TyA.
6. Validar admin y shopper sin mezclar datos demo.

## 2026-06-30 — Continuidad RC V56 + backend DEV

### 1. Regla de trabajo

- La base visual correcta previa fue `release/cxorbia-tya-rc-20260630`.
- Esa RC venía del prototipo V56 completo y correcto.
- No usar como base visual la rama `feat/firebase-backend-dev-config-20260627` porque está divergida.
- No modificar `/app/modules` ni reescribir lógica del frontend desde backend.
- No modificar `app/index.html` para activar backend global sin autorización final.
- El único preview backend debe ser `app/index-backend-dev.html`.
- Todo cambio debe quedar documentado en `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` e incidencias backend separadas.

### 2. Estado backend DEV real

Firebase DEV:

- Proyecto: `cxorbia-backend-dev`.
- Tenant: `tya`.
- Firestore DEV configurado.
- Reglas Firestore DEV publicadas.
- Auth DEV ficticio creado/importado.
- HR histórico V4 cargado.
- `shopperBenefits` cargado.
- Lectura admin OK.
- Lectura shopper propia OK.
