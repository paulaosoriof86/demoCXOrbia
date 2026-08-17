# SOURCE LOCK — PHASE A CANONICAL AUTHORITY REGRESSION · ROOT CAUSE · SOURCE PASS

**Fecha:** 2026-08-17 12:48 -06:00  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `SAME_CANDIDATE__NO_REPROCESS__ROOT_CAUSE_LOCALIZED__SOURCE_FIX_APPLIED__DEV_DEPLOY_NOT_EXECUTED`

## 1. Decisión prevalente

No crear candidata, rama, PR, usuario Admin ni Shopper histórico nuevos. No reconstruir Finanzas, HR, Auth, perfiles, certificaciones ni históricos ya resueltos. La candidata viva conserva los adapters canónicos V2 más recientes; el hallazgo actual es una regresión de **composición/compatibilidad de autoridades**, no una pérdida general de módulos.

Congelados y no repetibles:

- I1 PASS.
- I2 PASS.
- Historical Shopper run `31906391682` PASS, identidad/crosswalk/historia E2E preservados; reset único consumido; continuación `passwordResets=0`.
- request08 consumido/no rerun.
- TARGET_B Admin real sign-in PASS run `32049054855`; no crear/rotar/reemplazar Admin.
- HR histórica/actual no se reimporta.
- fuente financiera source-safe e histórico de pagos existentes no se reconstruyen.

## 2. Confirmación de candidata canónica

El entry vivo `app/index-backend-dev.html` carga la línea canónica vigente, entre otros:

- `tya-cumulative-read-model-v2.js` — último cambio funcional observado 2026-08-14 (`8de42cd...`, shared exact identity contract).
- `tya-canonical-shopper-portal-v2.js` — último cambio funcional observado 2026-08-14 (`e7ce5ae...`, shared identity contract).
- `tya-canonical-finance-read-model-v2.js` — último cambio funcional observado 2026-08-14 (`c1e6a3e...`, runtime contract activation).
- `tya-protected-auth-hr-authority-bridge-v2.js` — dynamic all-period HR authority + restored-session reconciliation.
- `tya-canonical-state-semantics-v2.js` — actionable out-of-range + exact linked-owner normalization.
- `tya-financial-canonical-source-safe-adapter.js` — exact financial links + historical payment truth.

No existe evidencia de que el DEV mostrado sea una candidata frontend antigua. Se prohíbe cherry-pick/rollback de módulos completos para “traer versiones mejores” sin P0 reproducible por archivo.

## 3. Causa raíz reproducible A — proyecto/periodos vacíos

El contrato de Auth/membership publica `projectIds=['cinepolis']` como scope de **proyecto raíz/programa**. El core histórico del prototipo usa `CX.data.projects` como filas de **periodo**, cuyos IDs son `cinepolis-YYYY-MM`, y varios helpers heredados interpretaban `scopeProjectId` como si fuera el ID de una fila de periodo.

Resultado: sesión y dashboard podían conocer `currentProjectId='cinepolis'` y `currentPeriodId='cinepolis-2026-08'`, mientras los selectores filtraban `p.id==='cinepolis'` y devolvían cero opciones.

Esto es incompatibilidad semántica entre el nuevo scope backend y el contrato Proyecto(programa)/Periodo ya existente; no falta HR ni proyecto real.

## 4. Causa raíz reproducible B — falsas “postulaciones”

`tya-live-source-inplace-apply.js` contiene `mapPosts(visits)`, que proyectaba asignaciones/agendamientos HR a registros sintéticos `hr-post-*`, estado pendiente/aprobada y `aprobadaPor='HR TyA'`, y los colocaba en `CX.data._posts`.

La evidencia runtime mostraba `Posts proyecto: 0` mientras la UI presentaba aprobadas/reprogramaciones. Por lo tanto, la UI no estaba mostrando postulaciones persistidas de la plataforma: estaba consumiendo una proyección HR semánticamente incorrecta.

Regla congelada: **asignación HR ≠ postulación Shopper ≠ postulación aprobada CXOrbia**.

## 5. HR 660 vs overlay 616 — interpretación correcta

La HR viva leída directamente contiene 15 periodos y 660 visitas hasta agosto-2026. Agosto = 44 visitas (GT 34 + HN 10). Los KPI estructurales verificados contra la HR fueron 44 total, 32 asignadas, 12 sin asignar, 25 agendadas, 7 sin agendar, 18 realizadas y 26 pendientes de realizar.

El estado protegido reporta 616 visitas, exactamente 44 menos. Esto demuestra que el overlay protegido persiste hasta un corte previo, mientras la HR operacional ya incluye agosto. El compositor V2 preserva las 660 visitas y solo enriquece por llaves exactas. No se debe reimportar HR ni rehacer las 616 visitas históricas para cerrar esa diferencia.

La consecuencia visible —IDs `shp-*`, histórico parcial o Mi Perfil no vinculado— se trata como **crosswalk exacto faltante en la composición del periodo nuevo**, no como permiso para deduplicar por nombre, email, teléfono, username o similitud ni para reprocesar Auth histórico.

## 6. Finanzas — no reconstruir

La rama conserva `tya-financial-canonical-source-safe-adapter.js` y `tya-canonical-finance-read-model-v2.js`. El modelo vigente incluye toda visita realizada, mantiene autoridad de la fuente financiera exacta y deja filas sin match como `pending_financial_source/reviewRequired`, sin permitir lote/pago silencioso.

La ausencia de fuente financiera exacta para una visita activa de agosto no invalida ni reemplaza el histórico financiero ya construido. Primero se recupera navegación por periodos y se valida que mayo/junio e histórico existente vuelvan a ser accesibles; solo una fuente nueva realmente faltante se incorpora después, sin reconstruir lo ya conciliado.

## 7. Delta source-only aplicado

### Nuevo adapter
`app/adapters/tya-phase-a-authority-compat-v1.js`

Responsabilidades limitadas:

1. elimina de `CX.data._posts` únicamente registros sintéticos `hr-post-*` generados desde HR y conserva esa información por separado como `__hrAssignmentProjection` read-only;
2. mantiene las postulaciones de plataforma como autoridad distinta;
3. hace compatible el scope membership `projectIds` con proyecto raíz/programa y filas de periodo, comparando por ID exacto, `rootProjectId` o `programKey`;
4. conserva filtros por país y no relaja tenant/project scope;
5. cero provider writes.

### Wiring
`app/index-backend-dev.html` carga el adapter antes de `tya-protected-auth-hr-authority-bridge-v2.js`, para que la HR quede saneada antes de que el compositor capture `hrState.posts`.

Commits source-only:

- `8a0fa58105644b81e3e27f59a98774b025fded1f` — adapter.
- `6594ef961177ede87dfabb0945f8dcc39c8920c8` — wiring.

Combined status observado para `6594ef...`: `cxorbia/c6-skip13-auth-access-adjudication/overall = success`.

## 8. Límites del PASS

Este lock es **SOURCE PASS**, no runtime/DEV deploy PASS.

En este bloque:

- Auth writes: 0
- password changes/resets: 0
- Shopper provider writes: 0
- Firestore writes: 0
- HR writes/imports: 0
- Rules/Storage/Make/Gemini/pagos: 0
- deploy: 0
- merge: false
- producción: false

No se declara corregido en navegador hasta desplegar exactamente este HEAD bajo gate DEV y ejecutar E2E/readback.

## 9. Pendiente exacto, sin reproceso

1. validar source/runtime contract de este delta contra el estado canónico ya existente;
2. desplegar el mismo HEAD a DEV solo bajo gate autorizado;
3. comprobar proyecto + 15 periodos visibles y agosto activo;
4. comprobar `Posts proyecto = postulaciones persistidas` y que asignaciones HR permanezcan en Visitas/Reservas sin transformarse en postulaciones;
5. inspeccionar `identityReviewQueue` y crosswalk exacto de agosto reutilizando perfiles/aliases existentes, sin tocar histórico PASS ni resetear credenciales;
6. validar Mi Perfil/Histórico de una identidad exacta y luego Finanzas mayo/junio/agosto sobre sus fuentes ya existentes;
7. validar KPI derivados `cuestPend`, `sinSubmitir`, `fueraRango` contra `tya-canonical-state-semantics-v2` y HR, sin reescribir dashboard;
8. NDA doble queda P1 no bloqueante salvo que impida sesión/rutas.

## 10. Clasificación

- **Reusable CXOrbia:** compatibilidad root-project/period scope; separación assignment/postulation.
- **Exclusivo cliente:** datos TyA/Cinépolis, 660/616 y verificación agosto.
- **Claude/prototipo:** no cambio de módulos/core; documentar que no debe reconstruir UI por estos hallazgos.
- **Academia:** documentar patrón de autoridad semántica y no reproceso; sin cambio de contenidos de cursos.
- **Sin impacto Claude:** lógica backend/adapters; sí requiere que Claude no revierta el delta en futuras candidatas.
