# PLAN COMPLEMENTARIO FROZEN V2 — I3 CANONICAL MONOTONIC CLOSURE
## CXORBIA RECOVERY — GO-LIVE
## 2026-09-24

**ID:** `CXORBIA-I3-CANONICAL-MONOTONIC-CLOSURE-PLAN-V2-20260924`  
**Estado:** `FROZEN_ACTIVE_UNTIL_I3_GO`  
**Supersede:** `CXORBIA-I3-CANONICAL-MONOTONIC-CLOSURE-PLAN-20260924` únicamente para estado/orden de ejecución posterior a VRM-042.  
**Iteración:** I3 — FUNCTIONAL CLOSURE / PRE-I4  
**Producción:** DO_NOT_TOUCH.

## 1. Objetivo no modificable

Cerrar I3 sobre UNA candidata canónica acumulativa e incremental, preservando toda mejora aprobada y todo finding VRM-001…último, sin otra rama, candidata, overlay, reimport, auditoría general ni metodología.

## 2. Causa raíz que el plan corrige

El defecto repetido no fue pérdida del historial Git. Fue pérdida de **autoridad efectiva**:
- varias sources productivas podían ser ejecutables en distintos jobs;
- Module Truth podía autocertificar currentBlob sin volver a probar autoridad aprobada independiente;
- PASS histórico no se revocaba mecánicamente al aparecer drift;
- findings, source, Module Truth y readiness evolucionaban por separado;
- el oráculo terminal no validaba suficientemente semántica humana;
- y, adicionalmente, una implementación correcta podía ser sombreada por otro adapter/facade cargado después (`RC-MONO-06 semantic owner shadowing`).

La solución es convertir canonicidad en invariancia mecánica, no sólo documental.

## 3. Estado del plan

### C0 — FREEZE/ANTI-PÉRDIDA
**CERRADO MATERIALMENTE.**

Existen y están sellados:
- addendum root cause canonical monotonic;
- addendum semantic owner shadowing;
- ledger FULL VRM-001…VRM-042;
- locks de cierre;
- siguiente ID reservado: VRM-043.

### C1 — SINGLE AUTHORITY ENFORCEMENT
**CERRADO MATERIALMENTE.**

Readback:
- canonical functional source = `d8aad982ae4b47e66bf949d906b6c7ede8866f84`;
- descriptor único activo;
- source/tree se derivan del descriptor;
- top-level historical source/tree eliminados;
- 8 PRE-I4 one-shot jobs históricos deshabilitados;
- terminal `certify` sólo puede ejecutar cuando descriptor = `READY_FOR_TERMINAL_CERTIFICATION`;
- Gate21 queda bloqueado mientras I3=HOLD;
- VRM-037 diagnostic deriva source del mismo authority job;
- Run347: `I3 single canonical candidate authority guard = SUCCESS`.

No se crea Gate22.

### C2 — P0 CLOSURE
**ACTIVO.**

#### C2.1 VRM-037 + VRM-042 — PRIMER BLOQUE
VRM-037: histórico/KPI/Profile/Beneficios/Reportes shopper.  
VRM-042: semantic owner shadowing de shopper history/KPI.

Evidencia ya demostrada:
- HR José Sarat = 5 total / 5 realizadas.
- facade efectivo = 6 total / 5 realizadas.
- `shoppers.js` excluye `__pendingPlatformAssignmentOverlay` en KPI.
- `tya-c6-domain-consistency-bridge.js::shopperStats` no lo excluye.
- portal shopper consume el facade global.
- la autoridad histórica f836 ya tenía la misma contradicción: no existe allí un delta limpio que recuperar.

Acción:
1. cerrar readback dinámico del sexto registro;
2. adjudicar un solo semanticOwner para history/KPI;
3. mantener `visitsForShopper` operacional para estados pendientes cuando corresponda;
4. separar `confirmed/history stats` de pending assignment/postulation;
5. no duplicar una asignación/postulación en vistas del shopper;
6. corregir owner general, jamás José/Paula por hardcode;
7. test focal exacto HR + Paula s3 + GT/HN;
8. avanzar descriptor sólo a un descendiente de d8aad.

#### C2.2 VRM-036 — CERTIFICACIONES
- adjudicar autoridad histórica exacta;
- recuperar si se demuestra;
- si no se adjudica en el pase focal acotado, implementar el contrato congelado en owner actual;
- ambiguos review-only;
- cero certificación/eligibilidad inventada.

#### C2.3 VRM-039 — RECURSOS + FINANZAS
Recursos:
- autoridad aprobada real;
- Storage/metadata/roles/readback cuando contrato lo exige;
- empty-state no equivale automáticamente a módulo completo.

Finanzas:
- obligaciones/honorarios HR y reembolsos parciales preservados;
- ingreso/margen/CxC sólo con fuente demostrada;
- fail-closed seguro no equivale a “completo”.

#### C2.4 RE-PROOF
VRM-033, 034, 035, 038, 040, 041 pasan a `PROVEN_CLOSED` sólo sobre la candidata acumulativa terminal.

### C3 — MODULE TRUTH + TERMINAL CUMULATIVE PROOF
**PENDIENTE HASTA C2.**

Obligatorio:
- 20/20 módulos MATCH contra autoridad independiente;
- registrar semanticOwner/override/load-order de contratos críticos;
- búsqueda de override tardío = 0 no adjudicados;
- ledger VRM-001…último continuo;
- Admin + Paula s3 + GT + HN + Cliente;
- HR misma fresh sourceRevision;
- desktop/mobile;
- Recursos, Certificaciones, Finanzas;
- cero QA/undefined/lenguaje técnico/duplicados;
- mismo source → manifest → build → artifact → Gate20 → Gate21.

### C4 — UNA SOLA VISUALIZACIÓN HUMANA
**BLOQUEADO.**

Sólo cuando C3 PASS:
- una URL DEV;
- ruta corta Admin/Shopper;
- Paula visualiza una vez la candidata realmente terminal.

Hallazgo nuevo = VRM-043+ en el MISMO ledger y mismo C2/C3. No abre nueva iteración.

PASS humano:
- congelar aceptación;
- I3=GO del artifact exacto;
- solicitar UNA autorización fresca para I4.

## 4. Regla de velocidad

Cada P0:
`EVIDENCIA → OWNER → búsqueda histórica acotada → recuperar si existe → si no, corregir directamente → gate focal → seguir`.

No volver a:
`auditoría general → recomposición general → nueva visualización parcial`.

## 5. Cross-workflow control

El push de control 4abef2… generó registros de tres workflows legacy adicionales, pero el readback de GitHub devuelve `jobs=[]` para esos runs y sus definiciones exactas están limitadas a PR/otra rama. No existe evidencia de deploy paralelo en ese commit, por lo que NO se clasifican como causa material actual.

Regla permanente: ningún workflow distinto del carril canónico puede desplegar `cxorbia-backend-dev` para esta rama/candidata. Si aparece un job material de deploy paralelo, se abre el siguiente VRM y se bloquea terminal certification.

## 6. Siguiente acción exacta

Terminar VRM-037/042 dynamic row proof; luego ejecutar un único fix del semanticOwner general y su focal. No se solicita autorización para ello.
