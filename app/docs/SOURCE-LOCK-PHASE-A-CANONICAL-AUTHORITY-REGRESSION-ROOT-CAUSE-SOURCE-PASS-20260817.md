# SOURCE LOCK — PHASE A CANONICAL AUTHORITY REGRESSION · ROOT CAUSE · SOURCE PASS

**Fecha original:** 2026-08-17 12:48 -06:00  
**Sincronización de plan:** 2026-08-17 13:28 -06:00  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `SAME_CANDIDATE__NO_REPROCESS__ROOT_CAUSE_LOCALIZED__SOURCE_FIX_APPLIED__UNIFIED_PLAN_BOUND__DEV_DEPLOY_NOT_EXECUTED`

## 1. Decisión prevalente

No crear candidata, rama, PR, usuario Admin ni Shopper histórico nuevos. No reconstruir Finanzas, HR, Auth, perfiles, certificaciones ni históricos ya resueltos. La candidata viva conserva los adapters canónicos V2 más recientes; el hallazgo actual es una regresión de **composición/compatibilidad de autoridades**, no una pérdida general de módulos.

Para **secuencia, porcentaje formal y pasos intermedios**, este source lock se ejecuta dentro del plan:

`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Ese addendum integra Cortes 0B→8 + S1→S6 + I1→I5. Este archivo conserva la autoridad sobre el delta técnico de composición/compatibilidad del 17-ago.

## 2. Congelados y no repetibles

- I1 PASS.
- I2 PASS.
- Historical Shopper run `31906391682` PASS; identidad/crosswalk/historia E2E preservados; reset único consumido; continuación `passwordResets=0`.
- request08 consumido/no rerun.
- TARGET_B Admin real sign-in PASS run `32049054855`; no crear/rotar/reemplazar Admin.
- HR histórica/actual no se reimporta.
- fuente financiera source-safe e histórico de pagos existentes no se reconstruyen.
- materialización/deploy legal V0.4 previos no se rerun.

## 3. Confirmación de candidata canónica

El entry vivo `app/index-backend-dev.html` carga la línea canónica vigente, incluyendo:

- `tya-cumulative-read-model-v2.js`;
- `tya-canonical-shopper-portal-v2.js`;
- `tya-canonical-finance-read-model-v2.js`;
- `tya-protected-auth-hr-authority-bridge-v2.js`;
- `tya-canonical-state-semantics-v2.js`;
- `tya-financial-canonical-source-safe-adapter.js`.

No existe evidencia de que el DEV mostrado sea una candidata frontend antigua. Se prohíbe cherry-pick/rollback de módulos completos para “traer versiones mejores” sin P0 reproducible por archivo.

## 4. Causa raíz reproducible A — proyecto/periodos vacíos

El contrato Auth/membership publica `projectIds=['cinepolis']` como scope de **proyecto raíz/programa**. El core del prototipo usa `CX.data.projects` como filas de **periodo**, con IDs `cinepolis-YYYY-MM`. Helpers heredados interpretaban el scope como si fuera ID de periodo.

Resultado: sesión/dashboard podían conocer `currentProjectId='cinepolis'` y `currentPeriodId='cinepolis-2026-08'`, mientras selectores filtraban por `p.id==='cinepolis'` y devolvían cero.

Esto es incompatibilidad semántica, no ausencia de HR/proyecto.

## 5. Causa raíz reproducible B — falsas postulaciones

`tya-live-source-inplace-apply.js` proyectaba asignaciones/agendamientos HR a registros sintéticos `hr-post-*`, incluso con `aprobadaPor='HR TyA'`, y los colocaba en `CX.data._posts`.

Regla congelada: **asignación HR ≠ postulación Shopper ≠ postulación aprobada CXOrbia**.

## 6. HR 660 vs overlay 616

HR viva contiene 15 periodos y 660 visitas hasta agosto-2026. Agosto = 44 (GT 34 + HN 10). KPI estructurales comprobados: 44 total, 32 asignadas, 12 sin asignar, 25 agendadas, 7 sin agendar, 18 realizadas y 26 pendientes de realizar.

Protected overlay observado = 616, exactamente 44 menos. Interpretación: overlay anterior + HR nueva. El compositor debe preservar 660 y enriquecer únicamente por llaves exactas.

IDs `shp-*`, histórico parcial o Mi Perfil no vinculado se tratan como **crosswalk exacto faltante del periodo nuevo**, nunca como permiso para deduplicar por nombre/email/teléfono/username/similitud ni reprocesar Auth histórico.

## 7. Finanzas — no reconstruir

La rama conserva Finance V2 y el adapter source-safe/historical payments. Toda visita realizada sin match financiero exacto queda `pending_financial_source/reviewRequired` y no entra a lote/pago silencioso.

Primero validar mayo/junio/histórico existentes después de recuperar navegación. Solo una fuente nueva realmente faltante de agosto se incorpora después; nunca se reconstruye lo conciliado.

## 8. Delta source-only aplicado

### Nuevo adapter
`app/adapters/tya-phase-a-authority-compat-v1.js`

Responsabilidades:

1. retirar de `CX.data._posts` registros sintéticos `hr-post-*` y conservar assignments HR en `__hrAssignmentProjection` read-only;
2. preservar postulaciones persistidas como autoridad separada;
3. compatibilizar membership root-project/program con filas de periodo por ID/rootProjectId/programKey exactos;
4. conservar scope país/proyecto;
5. cero provider writes.

### Wiring

`app/index-backend-dev.html` carga el adapter antes de `tya-protected-auth-hr-authority-bridge-v2.js`.

Commits source-only base:

- `8a0fa58105644b81e3e27f59a98774b025fded1f`;
- `6594ef961177ede87dfabb0945f8dcc39c8920c8`.

Combined status observado para `6594ef...`: `cxorbia/c6-skip13-auth-access-adjudication/overall = success`.

## 9. Límites del PASS

Este lock es **SOURCE PASS**, no runtime/DEV deploy PASS.

En el delta funcional:

- Auth writes: 0;
- password changes/resets: 0;
- Shopper provider writes: 0;
- Firestore writes: 0;
- HR writes/imports: 0;
- Rules/Storage/Make/Gemini/pagos: 0;
- deploy: 0;
- merge: false;
- producción: false.

No declarar corregido en navegador hasta desplegar exactamente el HEAD vigente bajo gate DEV y ejecutar E2E/readback.

## 10. Integración obligatoria con S1→S6

Este source lock corresponde principalmente a **S1 canonical runtime** y prepara la continuidad de S3/I3. No elimina S2→S6.

- S1: validar runtime exacto del delta actual en I3.2→I3.6/I3.10;
- S2: persistencia CX.data ya cerrada arquitectónicamente en I2, se valida por flujo en I4;
- S3: I3.8/I3.9 Shopper nuevo provider-backed siguen pendientes;
- S4: HR bidireccional/Make queda I4;
- S5: Finance queda I4 preservando fuentes;
- S6: E2E same-build cierra I4 y se repite final en I5.

## 11. Pendiente exacto dentro de I3

1. I3.2 runtime validation + exact DEV deploy bajo gate;
2. I3.3 proyecto + 15 periodos + AGO + 660;
3. I3.4 posts persistidos separados de assignment HR;
4. I3.5 identityReviewQueue/crosswalk exacto agosto;
5. I3.6 Mi Perfil/Histórico;
6. I3.7 legal receipt provider ACK/readback durable + reload/new-tab;
7. I3.8 Admin create/update de un único Shopper nuevo provider-backed;
8. I3.9 Shopper nuevo login/reload/new-tab/segundo contexto;
9. I3.10 KPI derivados/state semantics;
10. I3.11 cierre integral same-build.

El Admin existente PASS y el Shopper histórico PASS no sustituyen I3.8/I3.9.

## 12. P1 legal

Paula realizó la interacción humana V0.4 y reportó doble presentación. Duplicidad = P1 mientras no impida sesión/rutas. No automatizar consentimiento. Receipt durable sigue pendiente I3.7.

## 13. Clasificación

- **Reusable CXOrbia:** compatibilidad root-project/period scope; separación assignment/postulation; crosswalk plan S1→S6.
- **Exclusivo cliente:** datos TyA/Cinépolis, 660/616 y verificación agosto.
- **Claude/prototipo:** no cambio de módulos/core; no reconstruir UI por estos hallazgos.
- **Academia:** reflejar autoridad semántica/no reproceso y cubrir I4.10.
- **Sin impacto Claude:** lógica backend/adapters; sí requiere no revertir el delta.

## 14. Siguiente acción exacta

`I3.2_PHASE_A_AUTHORITY_COMPAT_RUNTIME_VALIDATION_AND_EXACT_DEV_DEPLOY_NO_REPROCESS`.