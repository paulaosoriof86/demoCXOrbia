# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-22  
**Estado:** ACTIVO Y OBLIGATORIO

## 0. Estado vivo

Estado actual:

`V174_EMP almada_HOLD_FIX_APPLIED_CONTROLLED_RUNNERS_BOOTSTRAPPED_R20_REMOTE_FIX_PENDING_NO_DEPLOY`

Corrección tipográfica canónica del estado:

`V174_EMPALMADA_HOLD_FIX_APPLIED_CONTROLLED_RUNNERS_BOOTSTRAPPED_R20_REMOTE_FIX_PENDING_NO_DEPLOY`

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- V174 funcional: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Corrección focalizada V174: `0acdc6772f2d4a7743dea0992a4279241dcb79d7`.
- HEAD previo al bootstrap de runners: `b5f63459ab096689e364ab85ab3c89f2640bc25c`.
- Runners controlados: instalados; todavía no activados sobre una solicitud funcional real.
- Hosting DEV, merge, producción, imports y writes reales: no realizados.

## 1. Lectura obligatoria

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

## 2. Lock prevalente de operación

Para candidatas frontend `GO` sin `P0_PROVEN`:

`AUDIT_LANE_READY → AUDITED_GO → APPLY_DELTA_DIRECTLY → COMMIT/PUSH ATÓMICO → POST-GATES → VALIDACIÓN VISUAL → FREEZE`

El empalme funcional puede ejecutarse únicamente mediante:

- checkout Git autenticado nativo; o
- `CXORBIA_ATOMIC_APPLY_RUNNER`.

Los gates post-empalme con navegador pueden ejecutarse únicamente mediante:

- entorno local completo y reproducible; o
- `CXORBIA_READONLY_POST_GATES_RUNNER`.

No nueva rama/PR, `main`, force, Contents API secuencial funcional, workflow genérico, `incoming/`, Drive/Base64 manual, CMD/PowerShell para Paula ni copias manuales.

## 3. Runners controlados autorizados

Únicos runners autorizados por Paula el 2026-07-22:

### 3.1 Aplicación atómica

- Nombre: `CXORBIA_ATOMIC_APPLY_RUNNER`.
- Workflow: `.github/workflows/cxorbia-atomic-apply-runner.yml`.
- Script: `tools/release/cxorbia-atomic-apply-runner.mjs`.
- Contrato: `backend/contracts/cxorbia-controlled-runners-v1.json`.
- Gate: `tools/qa/cxorbia-controlled-runners-contract-gate.mjs`.
- Alcance inicial: delta frontend auditado bajo `app/`, con paths protegidos fail-closed.
- Resultado esperado: un único commit funcional no forzado en la rama viva.

### 3.2 Post-gates read-only

- Nombre: `CXORBIA_READONLY_POST_GATES_RUNNER`.
- Workflow: `.github/workflows/cxorbia-readonly-post-gates-runner.yml`.
- Script: `tools/release/cxorbia-readonly-post-gates-runner.mjs`.
- Solicitud: `.github/cxorbia-gate-requests/request.json`.
- Perfil inicial: `V174_R20_M1_CORTE2A`.
- Entorno: Node 24 + Playwright 1.55.0 + Chromium efímero.
- Permisos: repository read-only; artifacts y comentario sanitizado en PR #7.

El request bootstrap permanece `enabled:false`; no se ejecutaron todavía gates remotos ni Playwright.

## 4. Bootstrap único autorizado

La instalación inicial se realizó mediante commits de infraestructura en la rama viva porque los runners aún no existían.

Esta excepción no aplica una candidata ni autoriza futuros empalmes funcionales por Contents API. Finaliza al quedar instalados los runners, su contrato, gate y documentación.

Gate local de estructura:

`PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`

- Blockers: 0.
- Warnings: 0.
- Deploy/merge/producción/data writes: false.

## 5. V174 y Corte 2A

- Candidata: `CANDIDATA_V174_ACUMULADA_20260722`.
- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Empalme funcional: seis módulos exactos.
- Backend, adapters, contratos, tools, overlays y `CX.data`: preservados.
- Ausencia financiera: `0` real se conserva; ausencia queda `null`.
- Report frontend runtime: PASS.
- Corte 2A canonical: PASS.
- Verificador V174: PASS.
- Aggregate vigente antes del bootstrap: `1019c6e2660d0e1b2d9433d5d92ac3f6148ef6eeb6534ad0bd115cd68404f300`.

## 6. Fuente HR viva y M1

Fuente validada:

- 14 periodos.
- 28 tabs.
- 616 visitas.
- GT: 476.
- HN: 140.
- 209 shoppers source-safe.
- `JULIO 26`: `tab_scoped_compact`.
- `JULIO 26 HN`: `full_identity`.

Julio 2026:

- 44 visitas.
- 41 asignadas.
- 3 sin asignar.
- 28 realizadas.
- 26 cuestionarios.
- 20 submitidas.
- 6 sin submitir.
- 2 cuestionarios pendientes.
- 0 pagos confirmados.

M1 permanece preservado. El único cierre técnico pendiente es publicar en la rama viva la corrección reproducible del builder R20 y reejecutar R20 + M1 compuesto en el runner read-only.

## 7. Corrección R20 pendiente en remoto

Codex comprobó localmente que el builder de inventario usaba resolución legacy distinta del contrato R20 y preparó un commit local no publicado.

La rama remota todavía conserva la implementación legacy. No se considera aplicado el commit local `ec20ff49262a4c315995a278479931d6017ef798`.

Causa raíz comprobada:

`R20_INVENTORY_BUILDER_NOT_USING_CANONICAL_HEADER_VARIANT_RESOLVER`

Siguiente corrección focalizada:

- reutilizar `headerVariants` del contrato R20;
- reconocer `tab_scoped_compact` y `full_identity` sin hardcode mensual;
- respetar `contextualMissingAllowedIn` y `coalesce_equal_or_single_nonempty`;
- publicar `public_gviz_gid_verified_inventory` solo tras validar 14 periodos, 28 tabs, 616 visitas y cache-busting por GID.

## 8. Lock anti-regresión

Antes de Hosting DEV o freeze deben pasar conjuntamente:

1. header variants R20;
2. builder inventario R20;
3. HR in-place;
4. contexto/histórico/reportes Corte 1;
5. frontend report runtime;
6. proyecto/periodo/KPI R20;
7. Corte 2A canonical;
8. M1 regression lock;
9. verificador V174;
10. smoke remoto `fresh=1` solo después de autorización de Hosting DEV;
11. validación visual por rol;
12. comparación transversal por `sourceRevision`.

## 9. Estado seguro

Sin merge, Hosting DEV, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, pagos ni base vieja conectada.

## 10. Siguiente bloque exacto

`CERRAR BOOTSTRAP DOCUMENTAL DE RUNNERS → REPRODUCIR CORRECCIÓN R20 EN REMOTO → ACTIVAR REQUEST READ-ONLY CONTRA EL HEAD EXACTO → R20 + M1 + CORTE2A + VERIFICADOR → DOCUMENTAR RESULTADO → SOLO DESPUÉS DECIDIR HOSTING DEV`.
