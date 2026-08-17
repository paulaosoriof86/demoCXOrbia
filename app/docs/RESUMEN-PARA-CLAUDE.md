# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-17 12:51 -06:00  
**Estado:** `SAME_CANDIDATE__ADMIN_PASS_FROZEN__HISTORICAL_SHOPPER_PASS_FROZEN__AUTHORITY_COMPOSITION_REGRESSION_SOURCE_FIXED__DEV_RUNTIME_VALIDATION_PENDING`

No nueva candidata/rama/PR. No reconstruir Auth, Shoppers, Finanzas, HR, KPI ni módulos ya resueltos. No tocar `app/modules` ni `app/core` por este bloque.

## No tocar / no reprocesar

- Historical Shopper run `31906391682`: PASS congelado. Reset único consumido. Continuación `passwordResets=0`; no volver a cargar credencial histórica, reconciliarla ni repetir request08.
- TARGET_B Admin: password sign-in real PASS run `32049054855`; Paula ya pudo ingresar. No crear, rotar, borrar ni reemplazar Admin.
- I1/I2: PASS.
- HR histórica: no reimportar.
- Finanzas source-safe/histórico de pagos ya construidos: no reconstruir ni sustituir.
- exact identity contract: no matching por nombre/email/teléfono/WhatsApp/username.

## Candidata canónica

Se verificó que el entry vivo conserva los adapters canónicos vigentes, incluyendo:

- `tya-cumulative-read-model-v2.js` (último fix funcional 14-ago, exact identity contract);
- `tya-canonical-shopper-portal-v2.js` (último fix funcional 14-ago);
- `tya-canonical-finance-read-model-v2.js` (último fix funcional 14-ago);
- `tya-protected-auth-hr-authority-bridge-v2.js`;
- `tya-canonical-state-semantics-v2.js`;
- `tya-financial-canonical-source-safe-adapter.js`.

Conclusión: no hay evidencia de que el DEV sea una candidata antigua. El defecto actual está en la composición/compatibilidad entre capas, no en que se hayan perdido los módulos completos.

## Root cause localizado

### Proyecto/periodos

Membership publica `projectIds=['cinepolis']` como proyecto raíz/programa. El core del prototipo almacena en `CX.data.projects` filas de periodo (`cinepolis-YYYY-MM`). Helpers heredados filtraban `scopeProjectId` contra `p.id`, produciendo cero periodos aunque HR/currentPeriod estuvieran correctos.

### Postulaciones

`tya-live-source-inplace-apply.js` generaba `hr-post-*` desde visitas HR asignadas/agendadas/fuera de rango y las trataba como `_posts`. Eso explica UI con postulaciones aunque runtime indicara `Posts proyecto: 0`.

Regla congelada: **asignación HR ≠ postulación Shopper ≠ postulación aprobada CXOrbia**.

### 660 HR vs 616 protegidas

HR viva = 15 periodos/660 visitas hasta agosto. Overlay protegido observado = 616; diferencia exacta = 44 visitas de agosto. No reimportar ni reprocesar 616. El compositor debe conservar 660 y enriquecer solo por crosswalk técnico exacto. IDs `shp-*` o Mi Perfil no vinculado se investigan únicamente como aliases/crosswalk faltantes del periodo nuevo.

### Finanzas

Finance V2 sigue presente. Una visita activa sin match financiero cae fail-closed a `pending_financial_source`; eso no invalida el histórico ya trabajado. Primero recuperar navegación y validar mayo/junio/histórico existente antes de crear cualquier fuente nueva.

## Delta source-only aplicado

Nuevo `app/adapters/tya-phase-a-authority-compat-v1.js`:

1. retira únicamente `hr-post-*` de `_posts` y conserva las asignaciones como `__hrAssignmentProjection` read-only;
2. preserva postulaciones persistidas como autoridad separada;
3. hace compatible membership root-project/program con filas de periodo por matching técnico exacto;
4. conserva scope de país/proyecto;
5. cero provider writes.

`app/index-backend-dev.html` lo carga antes de `tya-protected-auth-hr-authority-bridge-v2.js`.

Commits: `8a0fa58105644b81e3e27f59a98774b025fded1f`, `6594ef961177ede87dfabb0945f8dcc39c8920c8`. Source lock: `SOURCE-LOCK-PHASE-A-CANONICAL-AUTHORITY-REGRESSION-ROOT-CAUSE-SOURCE-PASS-20260817.md`.

## UI / Claude

No rediseñar Dashboard, Shoppers, Postulaciones, Finanzas ni selectores para esconder el problema. No copiar una versión anterior de módulos. El fix es de autoridad/composición. Cualquier ajuste UI futuro debe surgir solo de P0 reproducible posterior al runtime fix y documentarse por archivo.

NDA/confidencialidad doble: P1 no bloqueante por decisión operativa actual de Paula, salvo que impida sesión o rutas. No automatizar consentimiento.

## Siguiente frontera exacta

1. source/runtime validation del delta sin provider writes;
2. DEV deploy del mismo HEAD únicamente bajo gate;
3. comprobar proyecto + 15 periodos + agosto;
4. comprobar que Posts refleje solo persistencia real;
5. revisar `identityReviewQueue`/aliases exactos de agosto sin tocar histórico PASS;
6. validar Mi Perfil/Histórico y Finanzas existentes;
7. validar KPI derivados contra HR/state semantics;
8. solo después cerrar I3/I4 según evidencia, sin regresar a Auth Admin.

## Clasificación

- Reusable CXOrbia: scope root-project/period y separación assignment/postulation.
- Exclusivo cliente: TyA/Cinépolis y evidencia 660/616.
- Claude/prototipo: no tocar módulos/core; preservar delta.
- Academia: documentar patrón de autoridad semántica/no reproceso.
- Sin impacto Claude: implementación adapters/backend; sí requiere no revertirla.
