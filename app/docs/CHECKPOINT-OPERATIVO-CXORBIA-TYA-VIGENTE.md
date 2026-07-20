# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-19
Estado: `VISUAL_REVIEW_COMPLETED_WITH_NONBLOCKING_FINDINGS_PENDING_EXPLICIT_APPROVAL`

## 1. Repositorio y runtime

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Runtime empalmado: V161C.
- Commit de empalme: `ab862d2e2a92993238ee96d214c7024fccb22c1a`.
- Manifest: `app/docs/MANIFEST-V161C-EMPALME-DIRECTO-20260719.json`.
- Aggregate: `7075f70822e3fed8442d62b56e1467fa643facd756aa88258ae2d6d6bdc95cdf`.
- Build publicado en DEV: `v161c-r21-source-safe-20260719-dev`.
- URL visual: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.

## 2. Frontera de promoción

La última `ACTIVE_BASELINE` congelada continúa siendo V131 como referencia de rollback.

V161C completó empalme, post-gates R21, Hosting DEV, smoke remoto y revisión visual humana. V161C sigue `active:false` y `visualValidated:false` hasta que Paula emita aprobación explícita y se ejecute el freeze de Corte 0B.

## 3. Alcance canónico del Corte 0B

- Inventario contractual: `tya-hr-tab-inventory-r20-v1`.
- Periodos: junio 2025 a julio 2026.
- 14 periodos, 28 pestañas, 616 visitas.
- Países: GT 476, HN 140.
- Agosto 2026 detectado y excluido de este corte de forma explícita y reversible.
- Julio 2026: 44 visitas, 39 asignadas, 5 sin asignar, 4 disponibles y 1 bloqueada por elegibilidad.
- Referencias shopper protegidas: 209.
- Diferencia `209/216`: revisión no bloqueante; no inventar, fusionar ni eliminar identidades.
- Pagos confirmados o inferidos: 0.

## 4. Evidencia técnica y Hosting DEV

- Run técnico: `29712762494` — SUCCESS.
- Artifact técnico: `8449340543`.
- Run Hosting DEV: `29716601804` — SUCCESS.
- Commit desplegado: `8950ef47a8dd0e6f86ad368ffb68b2be638accb6`.
- Artifact DEV: `8450820491`.
- Digest DEV: `sha256:f207df387fe0449fc8382093097cb9c316746b60fdc42d8feaa67abe098dc96f`.
- Decisión: `PASS_R21_HOSTING_DEV_AND_REMOTE_SMOKE`.
- 0 blockers, 0 errores de página, 0 errores de consola, 0 PII expuesta y 0 escrituras de datos.

## 5. Revisión visual de Paula

Paula revisó login, Cliente, Operativo, Shopper, Academia, postulación, reservas, perfil, finanzas, liquidaciones y lotes. La revisión general se considera satisfactoria y no demostró P0.

Hallazgos no bloqueantes:

- P2: manuales todavía tipo curso y superficiales.
- P1: reportes/exportaciones pendientes de funcionamiento real.
- P1: reservas lista todas las sucursales; debe filtrar elegibles no asignadas y todavía no postulables.
- P1: perfil shopper muestra copy técnico, código y `null`; datos reales requieren backend protegido/Auth.
- P1: honorarios y modelo local/delegado/regional pendientes de configuración.
- P1: regalías solo deben aplicar a proyectos locales configurados.
- P1: flujo cruce financiero → validada → lote → pago debe quedar explícito.
- P2: sustituir jerga `Q1/Q2` por lenguaje de negocio en postulación.

Documento completo: `VALIDACION-VISUAL-V161C-OBSERVACIONES-PAULA-20260719.md`.

## 6. Asignación por corte

- Corte 1: contexto, HR, histórico, reportes y exportaciones.
- Corte 2: reservas, postulaciones, asignaciones, shopper por llave estable y certificaciones.
- Corte 3: honorarios, modelo local/delegado/regional, regalías, liquidaciones, cruce y lotes.
- Cortes 4/6: datos shopper protegidos mediante backend nuevo + Auth/RBAC.
- Claude/Academia futuro: manual profundo, reportes UI, copy postulación y perfil protegido humano.

## 7. Siguiente bloque exacto

```text
APROBADO CON OBSERVACIONES NO BLOQUEANTES
-> freeze V161C como ACTIVE_BASELINE
-> actualizar checkpoint/registry/PR
-> iniciar CORTE 1: CONTEXTO, HR, HISTORICO, REPORTES Y EXPORTACION
```

No iniciar Corte 1 antes del freeze de Corte 0B.

Estado seguro: sin merge, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
