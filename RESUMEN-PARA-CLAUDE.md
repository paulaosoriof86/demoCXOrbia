# RESUMEN-PARA-CLAUDE.md

## ESTADO VIGENTE — 2026-07-29

### Baseline y cortes

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- M1 / Corte 1 / Corte 2A: `FROZEN/APROBADO`.
- Corte 3: `FROZEN_ACTIVE_BASELINE`.
- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; **no crear V183/R33**.
- R26–R32: 135/135 PASS; HR remota, Hosting DEV y smoke de pagos PASS.

### Verdad financiera congelada

- Mayo 2026: 44 pagadas, 0 pendientes, 42 vínculos exactos, 2 reviews, CxP GT Q0 / HN L0.
- Junio 2026: 2 pagadas, 42 pendientes, GT pagado Q451 / HN L0.
- CXOrbia no ha ejecutado pagos ni lotes reales.

### Corte 4 — backend, no tarea frontend

Objetivo: `FIREBASE NUEVO Y VACÍO → CX.data READ-ONLY → MISMA INTERFAZ → CERO WRITES`.

Hardening ya validado:

- interfaz pública `CX.data` preservada;
- backend desactivado por defecto;
- `readOnly=true` / `writeMode=disabled`;
- persistencia y acciones operativas bloqueadas;
- backend vacío = vacío;
- error de lectura fail-closed;
- no fallback mock/localStorage;
- Rules candidate preparado, no desplegado;
- gate `PASS_READONLY_POST_GATES`.

`cxorbia-backend-dev` continúa excluido por no ser nuevo/vacío. No copiarlo, conectarlo ni reutilizarlo.

Firebase nuevo: `cxorbia-tya-dev-260729-c4`.

### Corte 4 — gates cerrados

**Gate 1 · identidad nueva: PASS**

- commit `b18f0b6cf74afb8b3ac770a73231c6cf1353b37c`;
- `TARGET_PROJECT_IDENTITY_VERIFIED_C4`;
- provider writes=0.

**Gate 2 · vacío integral: PASS**

- request `corte4-verify-new-empty-firebase-dev-20260729-05`;
- commit `7b0e40f8607b80a4f37238314a66064af35c5e6d`;
- identidad=true / vacío=true / unavailable=0 / nonempty=0;
- apps=0 / Auth users=0 / Firestore DB=0 / Storage buckets=0;
- Hosting=1 `DEFAULT_SITE` administrado por Firebase, sin `USER_SITE`/release como señal de contenido;
- provider writes=0.

El verificador requirió dos correcciones focalizadas de backend: query Auth count-only válida y separación entre infraestructura Hosting provider-default y contenido/despliegue real. No es trabajo de Claude.

### Lo que Claude NO debe hacer ahora

- no preparar V183/R33;
- no reinterpretar HR;
- no reabrir Finanzas/Corte 3;
- no tocar `backend/contracts`, adapters, tools, workflows, Rules, secrets ni configuración provider;
- no introducir persistencia local/mock para suplir Firestore;
- no activar proveedores reales desde módulos UI;
- no crear otra candidata por Corte 4.

### Siguiente gate backend, no frontend

Pendiente autorización expresa para:

1. registrar/configurar una Web App DEV sin secretos en repo;
2. inicializar únicamente Firestore + Auth bootstrap mínimo temporal para lectura protegida;
3. desplegar `backend/rules/firestore.corte4-readonly.rules` solo en DEV;
4. activar solo lectura;
5. smoke `CX.data` con `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz preservada, writes=0;
6. validación visual y freeze Corte 4.

El Auth bootstrap de Corte 4 es temporal/mínimo para la prueba read-only. Auth/RBAC completo continúa en Corte 6.

### Backlog frontend no bloqueante preservado

- PDF sin gráfica visible al imprimir;
- Excel con formato básico;
- mejora transversal de `reportKit`;
- copy genérico de fuentes;
- cualquier ajuste futuro se hará por archivo/módulo con evidencia reproducible y no reabre Corte 3.

### Academia

Debe reflejar la diferencia entre:

1. credencial estructuralmente válida;
2. permiso IAM;
3. identidad nueva verificada;
4. vacío integral verificado;
5. infraestructura provider-default (`DEFAULT_SITE`) vs contenido/despliegue;
6. Web App;
7. Auth bootstrap;
8. Firestore;
9. Rules;
10. lectura read-only;
11. escritura/materialización posterior.

No presentar “proyecto vacío verificado” como “CX.data ya conectado”.

### Siguiente bloque exacto backend

`AUTORIZAR BOOTSTRAP DEV READ-ONLY → WEB APP DEV → FIRESTORE/AUTH BOOTSTRAP MÍNIMO → RULES READ-ONLY → ACTIVAR LECTURA DEV → SMOKE CX.data → VALIDACIÓN VISUAL → FREEZE CORTE 4`.

## Referencias históricas que siguen vigentes donde no contradigan este estado

- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE1-LIVE-HR-REPORTES-20260720.md`.
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-SOURCE-SAFE-IMPORTERS-R4-20260711.md`.
- `app/docs/CLAUDE-PACKAGE-ACCUMULATED-PHASE-A-TYA-20260709.md`.
- Addenda posteriores de candidatas/Corte 2A/Corte 3 quedan como trazabilidad histórica, pero el baseline vigente es V182 congelada.

## Estado seguro

Sin merge, producción, Rules deploy, Firestore/Auth/Storage/HR data writes, imports, pagos, lotes reales, Make ni Gemini live.
