# FREEZE CORTE 0B — ACTIVE BASELINE V161C

Fecha: 2026-07-20
Estado: `ACTIVE_BASELINE_FROZEN`

## Aprobación humana

Paula emitió en la conversación actual la aprobación exacta:

`APROBADO CON OBSERVACIONES NO BLOQUEANTES`

La revisión visual cubrió login, Cliente, Operativo, Shopper, Academia, postulación, reservas, perfil, Dashboard Financiero, Liquidaciones y Lotes de Pago. No se demostró P0.

## Runtime congelado

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Runtime: V161C/R21.
- Commit de empalme: `ab862d2e2a92993238ee96d214c7024fccb22c1a`.
- ZIP SHA-256: `7504b80eed202fff801b1ce39f1028c91dc8446e56670c932042a4fb4a4e74e8`.
- Manifest: `app/docs/MANIFEST-V161C-EMPALME-DIRECTO-20260719.json`.
- Aggregate: `7075f70822e3fed8442d62b56e1467fa643facd756aa88258ae2d6d6bdc95cdf`.
- Build DEV validado: `v161c-r21-source-safe-20260719-dev`.
- Commit desplegado: `8950ef47a8dd0e6f86ad368ffb68b2be638accb6`.
- Run técnico: `29712762494` — SUCCESS.
- Run Hosting DEV/remoto: `29716601804` — SUCCESS.

## Alcance congelado

- 14 periodos y 616 visitas, junio 2025–julio 2026.
- GT 476; HN 140.
- Julio 2026: 44 visitas, 39 asignadas, 5 sin asignar, 4 disponibles y 1 bloqueada por elegibilidad.
- Proyecto y periodo separados.
- Login/roles tenant, fuente canónica R21 y estado source-safe visibles.
- 0 blockers, 0 errores de página, 0 errores de consola, 0 PII expuesta y 0 escrituras de datos.

## Observaciones no bloqueantes trasladadas

- Corte 1: reportes/exportaciones e histórico visible.
- Corte 2: reservas elegibles, ciclo shopper y perfil por llave estable.
- Corte 3: honorarios, modelo local/delegado/regional, regalías, cruce financiero y lotes.
- Cortes 4/6: datos shopper mediante backend protegido + Auth/RBAC.
- Claude/Academia: manual profundo, reportes UI, copy sin `Q1/Q2` y perfil protegido humano.

## Decisión

V161C pasa a ser la única `ACTIVE_BASELINE` vigente. V131 queda únicamente como referencia histórica previa, no como baseline activa.

## Siguiente bloque

`CORTE 1 — CONTEXTO, HR, HISTÓRICO, REPORTES Y EXPORTACIÓN`

El Corte 1 deberá terminar con build exacto en DEV, revisión visual de Paula, corrección focalizada si aplica, aprobación explícita y freeze. No puede comenzar Corte 2 antes de esa revisión visual y freeze.

Estado seguro: sin merge, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
