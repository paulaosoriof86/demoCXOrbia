# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE Y CONGELADO

**Fecha de congelamiento V1.1:** 2026-08-26
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`
**SYNC_EPOCH de producto:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`
**PLAN_ID Phase A:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`
**MASTER_PLAN_VERSION:** `1.1.0`
**MASTER_PLAN_STATUS:** `FROZEN`
**currentIteration Phase A:** `I5-G2`
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY`
**currentMasterStep:** `M3_TERMINAL_13_CLOSURE`
**PHASE_A:** `98/100`
**PRODUCTION_REAL_READINESS:** `69/100`
**ACTIVE_BLOCKER:** `M3_TERMINAL_13_AND_G2B_PROVIDER_PROMOTION_MECHANISM`

## 1. Autoridad y anti-descarrilamiento

Este archivo es el único plan operativo vigente hacia producción y postproducción. V1.1 sustituye únicamente la secuencia pendiente de V1.0 mediante `PCR-20260826-PRODUCTION-ACCELERATION-01`; todo gate previamente demostrado PASS permanece cerrado y no se reabre por cambio de conversación.

Autoridad de ejecución, en orden:
1. identidad/hash de este master plan congelado;
2. `backend/config/cxorbia-phase-a-continuity-lock.json`;
3. receipts/evidencia terminal de la fase;
4. validator authority + direct GitHub readback;
5. tombstones + consumed ledger + aliases;
6. checkpoint/execution/source lock como mirrors.

PR #7 y GitHub Actions son no autoritativos. Un request, execute marker, workflow, comentario, conversación anterior o artefacto histórico nunca puede autorizar ejecución por sí mismo.

Cualquier cambio futuro del plan requiere otro `PLAN_CHANGE_REQUEST` con causa demostrada, alcance, impacto, hash anterior/propuesto, riesgo, autorización explícita vigente y actualización atómica de plan + lock + índice + evidencia. Ningún hallazgo crea otra metodología automáticamente.

## 2. Estado cerrado que no se reabre

Permanecen PASS/FROZEN:
- I1–I4, R1–R4, G1 y G2-A;
- M1 `CLOSED_PASS`;
- M2/F0 `CLOSED_PASS_4_OF_4`;
- M3-0 `CLOSED_PASS_DIRECT_GITHUB_READBACK`;
- `M3_FINITE_QUEUE_BATCH_1` y `M3_FINITE_QUEUE_BATCH_2`;
- mecanismo M3 certificado;
- 17/30 HOLD históricos ya inertizados/tombstoneados.

F0 cerró el universo finito con 142 hallazgos clasificados, 4/4 exhaustividad y 0 superficies write-capable sin clasificar. No se abre Tramo 15 ni otra auditoría general salvo drift demostrable del universo bloqueado.

Quedan exactamente 13 residuales M2:
`RC15-CP-005`, `RC15-CP-014`, `RC15-CP-017`, `RC15-CP-025`, `RC15-CP-028`, `RC15-CP-029`, `RC15-CP-045`, `RC15-CP-063`, `RC15-CP-074`, `RC15-CP-078`, `RC15-CP-090`, `RC15-CP-091`, `RC15-CP-094`.

G2-B conserva P0 probado `G2B_CANONICAL_WRITE_PATH_DISABLED_OR_UNROUTED`. El source-fix existe, pero la última recuperación terminó `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; provider deploy/smoke no fue ejecutado, por lo que no constituye prueba de fallo del source-fix en proveedor.

## 3. Camino crítico congelado hacia producción

### M3 TERMINAL — F1/F2 · cierre de los 13 residuales

Objetivo: terminar una sola vez el universo M2 pendiente y cerrar M3, sin Batch 4, nueva metodología ni rediscovery.

Para cada uno de los 13 IDs se debe demostrar:
- hallazgo original y objeto exacto;
- plano afectado: producto/source, mecanismo/control-plane, provider, evidencia o autoridad;
- autoridad viva actual;
- si la fuente/runtime requiere reparación o solo inertización histórica;
- riesgo actual y relación con G2-B;
- disposición terminal reproducible.

Disposiciones permitidas: `INERTIZED_WITHOUT_EXECUTION`, `CLOSED_PASS_ALREADY_TERMINAL`, `FIXED_SOURCE_CONTROL_PLANE`, o `P0_PROVEN_STOP` con evidencia reproducible.

Criterio de salida: 13/13 terminales, cola M3=0, autoridad canónica alineada, readback remoto exacto, cero provider/data/frontend funcional writes y `M3_CLOSED_PASS`.

Regla dura: no existe `M3_FINITE_QUEUE_BATCH_4`. Un P0 real se corrige focalmente; no reabre F0/M1/M2.

### F3 — reparación y certificación del mecanismo provider G2-B

Objetivo: reparar el mecanismo de promoción antes de volver a intentar G2-B. No es un nuevo preflight superficial.

Debe producir y certificar `PROVIDER_PROMOTION_MECHANISM_V1` con:
- release tuple inmutable: source SHA, source-fix SHA, build/image digest cuando aplique, ambiente, Cloud Run service, Hosting site, authorization ID y budgets;
- autorización estructurada; prohibido depender de prefijos/frases de commit o texto libre;
- `RELEASE_AUTHORIZATION` separado de `PROVIDER_MUTATION_LEASE`;
- lease consumido únicamente al iniciar una mutación provider real;
- pre-readback y drift gate antes de provider access;
- checkout/source pin exacto;
- identidad/IAM/token validados antes de mutación;
- budgets fail-closed;
- idempotencia;
- punto de rollback antes del deploy;
- post-readback de Cloud Run revision/image y Hosting release/version;
- clasificación inequívoca: `PRODUCT_P0`, `MECHANISM_P0` o `EXTERNAL_TRANSPORT_OUTAGE`;
- un `skipped`, job sin runner o cero steps nunca se clasifica como fallo de producto.

Se reutilizan patrones ya demostrados útiles en CXOrbia, incluido direct trusted runner con source gate, lease, idempotencia y rollback plan, adaptados al release actual. No se crean rutas paralelas innecesarias.

Criterios de salida acumulativos:
1. `G2B_PROVIDER_PROMOTION_MECHANISM_PASS`;
2. `G2B_RECOVERY_LANE_PASS`.

Hasta ambos PASS: provider mutations = 0.

### F4 — Recovery G2-B one-shot real

Solo con autorización explícita vigente para esta fase.

Budget máximo: 1 Cloud Build, 1 update de `cxorbia-live-hr-dev`, 1 deploy de Hosting. Firestore/Auth/Storage/HR externa/datos o credenciales reales/pagos/Rules/Make/Gemini = 0.

Criterio de salida: `RECOVERY_PASS_FULL`, o STOP terminal con una única causa demostrada. Sin retry automático.

### F5 — aceptación sintética integral

Solo `CXORBIA_E2E_SYNTH_*` en la misma plataforma canónica. Cubrir roles y flujos Phase A autorizados, capturar evidencia visible, cleanup total y post-clean readback.

Criterio: PASS integral + cero residuo sintético.

### F6 — Freeze Phase A como release inmutable

Crear Release Manifest con source SHA, release SHA, hashes/config, build/image digest, Cloud Run revision, Hosting release/version, receipts, data fingerprints y readbacks.

Criterio: `PHASE_A_RELEASE_100_FROZEN`.

El 100% Phase A pertenece al release certificado. Un defecto posterior abre incidente/patch release y no reescribe retroactivamente el historial.

### F7 — readiness integral preproducción

Ejecutar sobre el release exacto: seguridad/IAM/Rules/secrets, tenant isolation, migración, Auth/RBAC, HR viva/histórica, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, multi-proyecto, sync HR↔plataforma, E2E/regresión, carga/cuotas, failure injection, idempotencia, backup/restore, rollback, observabilidad, alertas, runbooks, Claude y Academia.

Criterio: `GO` o `GO_WITH_WARNINGS` sin P0. `HOLD/NO_GO` requiere evidencia reproducible, no sospecha.

### F8 — cutover de producción

Requiere autorización específica. Preservar backup/export, restore verificable, deployment exacto del manifest, provider readbacks, smoke por rol/flujo y punto de rollback. Nunca conectar la base legacy.

Criterio: release exacto operando y reconciliado en proveedor.

### F9 — aceptación postproducción

Ventana formal objetivo: 24 horas después del cutover. Monitorear Auth, HR, sync, shoppers, visitas, evidencias, liquidaciones/pagos, errores, performance, drift y alertas.

Criterio: `POSTPROD_ACCEPTED`.

### F10 — modelo operativo permanente

Incidentes, patches, observabilidad continua, backups/restores periódicos, evidence TTL, seguridad, revalidaciones programadas, cambios Claude/Academia y mejoras futuras.

## 4. Escalera de producción real

La métrica ejecutiva es `PRODUCTION_REAL_READINESS`.

- actual: `69/100`;
- M3 terminal cerrado: `74/100`;
- F3 mecanismo provider + carril G2-B PASS: `76/100`;
- F4 recovery G2-B PASS: `81/100`;
- F5 aceptación sintética PASS: `86/100`;
- F6 release inmutable: `90/100`;
- F7 readiness GO/GO_WITH_WARNINGS: `95/100`;
- F8 cutover: `98/100`;
- F9 postproducción aceptada: `100/100`.

`PHASE_A=98/100` permanece como métrica técnica hasta F5/F6. No se aumenta porcentaje por diagnóstico, documentación o preparación sin gate cerrado.

## 5. Presupuesto de tiempo y circuit breaker

Objetivo operativo, no garantía contractual:
- trabajo técnico activo estimado hasta cutover: 17–28 horas;
- objetivo calendario de go-live si no aparece P0 nuevo y provider/IAM/transporte están disponibles: 36–48 horas;
- circuit breaker: 72 horas calendario.

Si el camino crítico supera 72 horas, no se permite continuar con “pendiente evidencia”, “otro retry” u “otra revisión” como explicación. Debe existir y documentarse exactamente una causa: `PRODUCT_P0`, `MECHANISM_P0` o `EXTERNAL_TRANSPORT_OUTAGE`, con owner, evidencia, reparación/contención y nueva estimación.

Máximo una iteración consecutiva de diagnóstico sin cambio de evidencia/estado. La siguiente iteración debe materializar reparación, cerrar el gate o STOP causal.

## 6. Contrato obligatorio de cada bloque

Antes de actuar cada bloque declara:
- objetivo y criterios de entrada;
- alcance exacto;
- mutaciones permitidas/prohibidas;
- provider/data budget;
- evidencia requerida;
- salida y STOP/rollback;
- autorización necesaria;
- documentos a sincronizar;
- clasificación `Reusable CXOrbia / Exclusivo cliente / Claude-prototipo / Academia / Sin impacto Claude`.

Toda ejecución sensible usa evidencia/readback. Si no está documentado, no se hizo.

## 7. Invariantes preservados

- prototipo manda; backend no rediseña `/app/modules` ni `/app/core`;
- `APPLY_DELTA_DIRECTLY` para candidata frontend GO/no P0 bajo el lock vigente;
- base nueva y limpia; legacy solo export/import de datos reales limpios;
- CX.data conserva exactamente su interfaz;
- multi-tenant por `tenantId` + `projectId`;
- HR histórica/completa, shoppers, certificaciones, liquidaciones/pagos y multi-proyecto;
- sync HR↔plataforma con identidad estable, idempotencia y revisión de conflictos;
- datos sensibles protegidos; UTF-8 sin BOM;
- Make/Gemini/pagos solo en su bloque y con gate humano;
- ningún deploy/merge/producción sin autorización requerida;
- ningún éxito sin evidence/readback;
- no nueva rama, PR, candidata o workflow como sustituto de una causa raíz.

## 8. Continuidad entre conversaciones

Al iniciar o retomar:
1. leer índice vigente;
2. leer continuity lock;
3. verificar versión/hash de este master plan;
4. leer evidence/cursor del bloque actual;
5. resolver HEAD vivo dinámicamente;
6. continuar exactamente desde `currentMasterStep`.

Una conversación nueva no reinicia metodología, autorizaciones consumidas, gates PASS ni porcentajes demostrados.

## 9. Próximo paso exacto

`M3_TERMINAL_13_CLOSURE`.

Resolver los 13 residuales individualmente y cerrar M3 en una única frontera terminal. Provider/data/deploy/merge/frontend funcional permanecen en cero durante este bloque.
