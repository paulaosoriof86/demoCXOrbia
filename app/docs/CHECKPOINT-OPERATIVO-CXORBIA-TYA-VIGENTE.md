# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-21  
**SYNC_EPOCH de producto:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**PLAN_ID Phase A:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentIteration:** `I5-G2`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**currentMasterStep:** `F0_RC15_CONTROL_PLANE_WRITE_SURFACE_INVENTORY`  
**PHASE_A:** `98/100`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7`, draft/open/unmerged

## Plan congelado

Único plan vigente: `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, versión `1.0.0`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`, Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`.

No puede modificarse ni sustituirse por otro plan salvo `PLAN_CHANGE_REQUEST` con autorización explícita de Paula y actualización atómica. Planes/addenda previos quedan históricos.

## Estado preservado

I1–I4 PASS/FROZEN; R1–R4 PASS; G1 PASS/FROZEN; G2-A PASS/FROZEN. G2-B pendiente.

Recovery `i5-g2b-p0-writepath-recovery-20260821-02`: `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; providerMutationExecutions=0; request consumido; sin retry/replay.

## RC15 F0 — avance de causa raíz

La matriz vigente contiene **68 hallazgos clasificados** y F0 continúa porque la cobertura todavía no es exhaustiva. Hay **18 HOLD** residuales para tratamiento conjunto F1/F2.

HOLD previos preservados: `CP-005`, `CP-011`, `CP-014`, `CP-017`, `CP-025`, `CP-028`, `CP-029`, `CP-030`, `CP-031`.

Nuevos HOLD de este tramo:
- `CP-045` — C6 hold-profile: request histórico activo con `providerReadsAuthorizedMax=0`, mientras el workflow puede leer provider y luego escribir evidence/estado; falta enforcement del budget y lock.
- `CP-055` — remaining-shopper identity: workflow/script conecta directamente el RTDB legacy `tya-plataforma` y luego publica evidence; viola la regla vigente export/import-only.
- `CP-056` — visit identity crosswalk: request `enabled=true` sin terminalización; provider-read + writer de evidence.
- `CP-058` — live-HR provider capability preflight: lee provider y hace commit de evidence por varios trigger paths sin validar realmente el request ni consultar primero el continuity lock.
- `CP-059` — legacy shoppers/certifications refresh: conexión directa al RTDB legacy + writer de evidence; request histórico sigue activo.
- `CP-063` — profile-extra: request `enabled=true/consumed=false`; llegada de bundle cifrado activa provider-read + state writer.
- `CP-066` — canonical backend anomaly probe: request activo; provider-read + state writer.
- `CP-067` — canonical backend Phase A gap: writer repetible de evidence con request activo.
- `CP-068` — canonical backend readonly inventory: provider-read + writer de evidence con request activo.

También se demostraron fail-closed o read-only sin mutación sensible nuevos carriles: credential handoff key/dryrun consumidos, materialization R16/R16C/R16D/R16E read-only, Hosting C6 live-domain consumido STOP_RETRY, credential continuity consumido, M10 source-bound antiguo, I4A consumed guard, offline credential gate, Corte4 identity probe read-only, auth mapping consumido, full-profile V2 e identity bridge V3 consumidos.

### Causa raíz sistémica refinada

El bucle no proviene de un único workflow. Está demostrado que coexistieron: (1) autoridad histórica no terminalizada de provider/source/state; (2) workflows llamados “read-only” que escriben estado canónico del repo; (3) al menos un workflow de provider-read que no hace cumplir su artefacto de request; y (4) rutas históricas con conexión directa a la base legacy, contrarias a la arquitectura vigente. F1 debe tombstonear todo el residuo y F2 debe imponer master plan + continuity lock + consumed ledger antes de cualquier provider/legacy access o repository-state mutation.

## Incidente metodológico del tramo

Durante el uso del conector se creó por error un archivo inerte `dummy` y se eliminó inmediatamente en el commit siguiente. La comparación `d38953e1...01607dc2` devuelve `files=[]`: el árbol final volvió exactamente al estado anterior. No hubo provider/data/deploy side effects. Queda documentado para no ocultar una mutación fallida/accidental.

## Siguiente exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`: continuar inventario hasta que todos los workflows/requests/execute markers capaces de mutar proveedor, datos, producto, fuente, legacy access o estado canónico estén clasificados y todo `workflow_dispatch` haya sido revisado.

Hasta cerrar F0: provider/data/deploy/recovery/synthetic-stage writes=0; merge=false.
