# PLAN COMPLEMENTARIO FROZEN V3 — I3 CANONICAL MONOTONIC CLOSURE
## CXORBIA RECOVERY — GO-LIVE
## 2026-09-24

**ID:** `CXORBIA-I3-CANONICAL-MONOTONIC-CLOSURE-PLAN-V3-20260924`  
**Estado:** `FROZEN_ACTIVE_UNTIL_I3_GO`  
**Supersede:** V2 únicamente para estado y siguiente acción.  
**Iteración:** I3 — FUNCTIONAL CLOSURE / PRE-I4  
**Producción:** DO_NOT_TOUCH.

## OBJETIVO

Cerrar I3 sobre UNA candidata canónica, acumulativa, incremental y monotónica, con:
- VRM-001…último en ledger append-only;
- 20/20 módulos adjudicados contra autoridad independiente;
- un solo semantic owner por contrato crítico;
- misma source en proof, Module Truth, manifest, artifact y Gate21;
- cero regresiones silenciosas;
- una sola visualización humana final.

## CAUSA RAÍZ PREVALENTE

1. Múltiples product-source authorities ejecutables dentro del mismo workflow.
2. Module Truth parcialmente autorreferencial.
3. PASS histórico no revocado automáticamente por drift posterior.
4. Findings/source/readiness separados.
5. Oráculo terminal técnico pero semánticamente insuficiente.
6. Semantic owner shadowing: un adapter tardío podía redefinir un contrato ya correcto.

La solución ya está incorporada mecánicamente: descriptor único + ledger append-only + authority guard + jobs históricos deshabilitados + readiness derivado.

## ESTADO MATERIAL ACTUAL

### C0 — ANTI-PÉRDIDA / FREEZE
**CERRADO.**
- Root-cause addenda congelados.
- Ledger FULL vigente VRM-001…VRM-042.
- Próximo ID: VRM-043.
- Ningún finding puede desaparecer por omisión.

### C1 — SINGLE AUTHORITY ENFORCEMENT
**CERRADO Y PROBADO.**
- Source canónica funcional viva: `8913a30e3bd1bd3e851d9736ff87e1bae51c30ff`.
- Predecessor: `d8aad982ae4b47e66bf949d906b6c7ede8866f84`.
- Authority guard PASS.
- Sources históricas por job ya no son ejecutables.
- 8 jobs PRE-I4 one-shot históricos deshabilitados.
- `certify` y Gate21 bloqueados mientras descriptor=HOLD.
- No Gate22.

### C2.1 — VRM-037 + VRM-042
**FIXED_SOURCE_PROVEN_NO_DEPLOY.**

Causa exacta:
- José Sarat HR confirmado = 5 visitas / 5 realizadas.
- Runtime operacional = 6 porque conserva una asignación de agosto HN:
  `hr_2026-08_hn_5_0fae44594f` / `AGOSTO 26 HN!5`
  con `pendingOverlay=true`, `assignmentSource=platform`, `assignmentSyncStatus=pending_hr`.
- Esa visita debía seguir visible operacionalmente, pero un facade tardío la mezclaba con histórico/KPI confirmado.

Fix canónico:
- operational visits conservan pending assignment;
- confirmed history excluye pending platform overlays;
- shopperStats y Mi Perfil histórico delegan en el mismo semantic owner;
- Mis Visitas conserva la asignación operacional;
- Admin KPI drill usa el mismo universo confirmado.

Prueba:
- source diff monotónico exacto PASS;
- regresiones PASS;
- mismos datos vivos HR/Firestore de Run349:
  José operational=6, confirmed history=5, pending=1;
  control shopper=1/1;
- deploys=0.

Evidence:
- Run 351 / `36038277262`;
- artifact `10825625581`;
- digest `sha256:229e235b9a3918194b5a656b235305acf89ec199635ac35eaee8d6104ca9b2d0`.

### C2.2 — VRM-036 CERTIFICACIONES
**ACTIVO / DATA ADJUDICATION, NO CODE RECOVERY.**

Source provenance:
- owners actuales = byte-exact del approved successor `61cf7120...`.
- No falta el módulo bueno.

Carryover actual:
- evidencia histórica preservada;
- 42 candidatos;
- 22 deterministic technical-ID matches;
- legacy statuses: 40 approved / 2 failed;
- `certifications=[]`;
- `carryoverConfirmed=false`;
- `eligibilityGranted=false`;
- faltan `reviewedBy/reviewedAt/auditRef`.

Regla:
- no inventar certificación/eligibilidad;
- componer evidencia histórica exacta por identidad para que no desaparezca;
- ambiguos permanecen review-only;
- separar “evidencia histórica aprobada legacy” de “certificación vigente habilitante”.

Cierre requerido:
1. exact identity projection;
2. historial visible humano;
3. cero grant de eligibility sin autoridad;
4. Module Truth MATCH sólo cuando esa proyección esté compuesta/probada.

### C2.3 — VRM-039 RECURSOS + FINANZAS
**ACTIVO / RUNTIME-DATA PROOF, NO CODE RECOVERY.**

Resources:
- owners actuales = byte-exact approved successor `50b6a25d...`.
- Firestore metadata es autoridad conectada.
- count=0 no constituye proof funcional.
- binary Storage permanece fail-closed si no está authorized+rulesValidated.
- Cierre: crear/editar/leer/eliminar metadata fixture DEV con ACK + roles + cleanup 0; comprobar UX humana. No inventar recursos de negocio.

Finance:
- owners core coinciden; `modules/finanzas.js` coincide con último successor `4aeb41ca...`.
- no rollback de código.
- HR puede demostrar obligaciones/honorarios y reembolsos parciales.
- ingreso/margen/CxC/pago sólo si existe fuente financiera exacta.
- Cierre: mismo HR revision + obligaciones correctas + campos sin fuente mostrados humanamente como no disponibles, no como 0 inventado; CRUD/pago sólo con ACK.

### C2.4 — RE-PROOF TERMINAL
VRM-033/034/035/038/040/041 siguen `FIXED_NOT_PROVEN_TERMINAL`.
No reimplementar; sólo volver a probar en candidata acumulativa final.

## C3 — TERMINAL CUMULATIVE PROOF
**PENDIENTE HASTA C2.2/C2.3.**

Obligatorio:
- 20/20 modules MATCH;
- ledger VRM-001…último continuo;
- semanticOwner/override/load-order adjudicados;
- Admin + Paula s3 + shopper GT + HN + Cliente;
- HR misma fresh sourceRevision;
- Perfil/histórico/KPIs/Mis Visitas/Beneficios/Reportes;
- Reservas/Postulaciones;
- Recursos;
- Certificaciones;
- Finanzas/Liquidaciones;
- desktop/mobile;
- cero QA/undefined/técnico/duplicados;
- exact served bytes;
- una sola source → manifest → build → artifact → Gate20 → Gate21;
- no rebuild.

## C4 — UNA SOLA VISUALIZACIÓN HUMANA
**BLOQUEADO.**

Sólo después de C3 PASS.
Si aparece hallazgo nuevo:
- VRM-043+;
- mismo ledger;
- mismo source lineage;
- mismo C2/C3;
- no nueva iteración, branch, candidata ni metodología.

PASS humano:
- I3=GO del artifact exacto;
- solicitar UNA autorización fresca para I4.

## REGLA DE VELOCIDAD

Para cada P0:
`autoridad ya congelada → owner exacto → prueba focal → fix si corresponde → evidence receipt → siguiente`.

No auditoría general.
No búsqueda histórica indefinida.
No deploy parcial a Paula.
No producción.

## SIGUIENTE ACCIÓN EXACTA

1. VRM-036: proyectar y probar carryover histórico exacto sin otorgar eligibility.
2. VRM-039 Resources: CRUD metadata DEV + role/readback + cleanup.
3. VRM-039 Finance: same-revision semantic proof.
4. Actualizar Module Truth.
5. C3 terminal único.
