# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-22  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_EMPALMADA_HOLD_FIX_APPLIED_CONTROLLED_RUNNERS_BOOTSTRAPPED_R20_REMOTE_FIX_PENDING_NO_DEPLOY`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- `main`, nueva rama/PR y force push: prohibidos.
- Hosting DEV, deploy, producción, imports y writes reales: no realizados.

## 2. Lectura obligatoria

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md`.
3. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.
4. Addenda vigentes de Academia, patrones reutilizables y antidesvío.
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
7. `app/docs/VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.
8. `app/docs/AUDITORIA-CANDIDATA-V174-CORTE2A-SOURCE-LOCK-20260722.md`.
9. `app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json`.
10. `backend/contracts/cxorbia-controlled-runners-v1.json`.
11. CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, Academia, tracker, PR #7 y HEAD vivo.

## 3. Lock prevalente

Para candidatas frontend `GO` sin `P0_PROVEN`:

`AUDIT_LANE_READY → AUDITED_GO → APPLY_DELTA_DIRECTLY → COMMIT/PUSH ATÓMICO → POST-GATES → VALIDACIÓN VISUAL → FREEZE`

Carril de aplicación permitido:

- checkout Git autenticado nativo; o
- `CXORBIA_ATOMIC_APPLY_RUNNER`.

Carril de gates con navegador permitido:

- entorno local completo y reproducible; o
- `CXORBIA_READONLY_POST_GATES_RUNNER`.

Continúan prohibidos Contents API secuencial para delta funcional, blobs/trees fuera del runner, workflows genéricos, `incoming/`, Drive/Base64 manual, PowerShell/CMD para Paula, copias manuales y otra candidata cuando la actual ya fue auditada GO.

## 4. Runners controlados autorizados

Paula autorizó exclusivamente el 2026-07-22:

### `CXORBIA_ATOMIC_APPLY_RUNNER`

- Workflow: `.github/workflows/cxorbia-atomic-apply-runner.yml`.
- Script: `tools/release/cxorbia-atomic-apply-runner.mjs`.
- Contrato: `backend/contracts/cxorbia-controlled-runners-v1.json`.
- Gate: `tools/qa/cxorbia-controlled-runners-contract-gate.mjs`.
- Resultado: un único commit funcional no forzado sobre la rama viva.
- Alcance inicial: delta frontend auditado bajo `app/`, con rutas protegidas fail-closed.

### `CXORBIA_READONLY_POST_GATES_RUNNER`

- Workflow: `.github/workflows/cxorbia-readonly-post-gates-runner.yml`.
- Script: `tools/release/cxorbia-readonly-post-gates-runner.mjs`.
- Request: `.github/cxorbia-gate-requests/request.json`.
- Perfil: `V174_R20_M1_CORTE2A`.
- Entorno: Node 24 + Playwright 1.55.0 + Chromium efímero.
- Permisos: contents read-only; artifacts y comentario sanitizado en PR #7.

Request bootstrap: `enabled:false`. No se ejecutaron aún gates remotos ni una aplicación funcional real.

## 5. Bootstrap único

La instalación inicial mediante commits de infraestructura fue autorizada porque los runners aún no existían.

No aplicó candidata ni delta funcional. No autoriza futuros empalmes por Contents API.

Gate local:

`PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`

- blockers: 0;
- warnings: 0;
- deploy/merge/producción/data writes: false.

## 6. V174 y Phase A

- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional V174: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Corrección focalizada: `0acdc6772f2d4a7743dea0992a4279241dcb79d7`.
- Corte 2A canonical: PASS.
- Report frontend runtime: PASS.
- Verificador V174: PASS.
- M1/Corte 1: preservado.
- Backend, adapters, contratos, tools, overlays y `CX.data`: preservados.

## 7. Fuente HR viva

- 14 periodos.
- 28 tabs.
- 616 visitas.
- GT: 476.
- HN: 140.
- 209 shoppers source-safe.
- `JULIO 26`: `tab_scoped_compact`.
- `JULIO 26 HN`: `full_identity`.

Julio 2026:

- 44 visitas;
- 41 asignadas;
- 3 sin asignar;
- 28 realizadas;
- 26 cuestionarios;
- 20 submitidas;
- 6 sin submitir;
- 2 cuestionarios pendientes;
- 0 pagos confirmados.

## 8. Pendiente R20 real

El commit local Codex `ec20ff49262a4c315995a278479931d6017ef798` no fue publicado y no cuenta como avance remoto.

Causa raíz comprobada:

`R20_INVENTORY_BUILDER_NOT_USING_CANONICAL_HEADER_VARIANT_RESOLVER`

La rama remota todavía requiere reproducir la corrección para:

- usar `headerVariants` R20;
- reconocer `tab_scoped_compact` y `full_identity`;
- respetar `contextualMissingAllowedIn` y `coalesce_equal_or_single_nonempty`;
- publicar `public_gviz_gid_verified_inventory` solo con 14 periodos, 28 tabs, 616 visitas y cache-busting por GID verificados.

## 9. Gates antes de Hosting DEV

Deben pasar conjuntamente:

1. header variants R20;
2. builder inventario R20;
3. HR in-place;
4. contexto/histórico/reportes Corte 1;
5. frontend report runtime;
6. proyecto/periodo/KPI R20;
7. Corte 2A canonical;
8. M1 regression lock;
9. verificador V174;
10. smoke remoto `fresh=1` solo tras autorización de Hosting DEV;
11. validación visual por rol;
12. comparación transversal por `sourceRevision`.

## 10. Siguiente bloque exacto

`CERRAR BOOTSTRAP DOCUMENTAL → REPRODUCIR CORRECCIÓN R20 EN REMOTO → ACTIVAR REQUEST READ-ONLY CONTRA HEAD EXACTO → R20 + M1 + CORTE2A + VERIFICADOR → DOCUMENTAR → DECIDIR HOSTING DEV`.

## 11. Estado seguro

Sin merge, Hosting DEV, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, pagos ni base vieja conectada.
