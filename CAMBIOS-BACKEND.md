# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`PASS_C6_LIVE_USER_ADMIN_STATIC_SOURCE_GATE_TERMINAL__STAFF_REPAIR_BOOTSTRAP_PREWRITE_CONTRACT_READY__PROVIDER_SNAPSHOT_PENDING__NO_PROVIDER_READS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## Bloque 2026-08-11 — static live-user-admin PASS

Se cerró terminalmente el gate source-only preparado en el bloque anterior, reutilizando el runner read-only ya existente y sin crear workflow nuevo.

Evidencia:

```text
checkoutHead=9d16521ac67c7a9fa7cd6de393e778bc6a05876b
runId=31513528713
jobId=93852916856
decision=PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT
blockers=[]
warnings=[]
```

`tools/qa/cxorbia-controlled-runners-contract-gate.mjs` ahora exige también `tools/qa/cxorbia-c6-live-user-admin-source-gate.mjs` y falla si la decisión o el safe-state live-user-admin no son exactos.

El request de control quedó deshabilitado para perfiles provider/browser: el bloque ejecutó solo el preflight source-only obligatorio.

Archivo creado:

```text
app/docs/evidence/C6-LIVE-USER-ADMIN-STATIC-GATE-LATEST.json
```

## Prewrite focal preparado

Se creó:

```text
backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json
```

El contrato reconcilia sin superposición:

- R1/Super con target A;
- R2/Admin con target B;
- R3/Ops con target C;
- target D como acceso adicional de Operaciones;
- `R4_CLIENT_HISTORICAL` como viejo repair Cliente, distinto del target D.

Se preservan create-before-retire, `DISABLE_ONLY_NO_DELETE`, idempotencia, readback y rollback dry-run.

### Corrección de write budget

El viejo hard cap Auth=14 queda superseded porque excluía el target D adicional y precede el contrato live user-doc/audit. El nuevo prewrite registra **16 únicamente como peor caso teórico antes del snapshot**; no autoriza writes y no es cap final. El cap final se congela después del provider snapshot read-only.

## Reglas de usuario preservadas

Los cuatro accesos iniciales siguen `TYA_COMPLETE`. El alta futura exige `TyA completo` o `Proyectos específicos`, editable después; sin wildcard ni herencia silenciosa. No se vuelve a pedir scope inicial.

Backend source preservado, todavía sin deploy:

```text
backend/contracts/c6-live-user-admin-v1.json
backend/runtime/hr-live-service/user-admin.mjs
backend/runtime/hr-live-service/server.mjs
backend/runtime/hr-live-service/package.json
backend/runtime/hr-live-service/Dockerfile
firebase.json
```

No se modificó `app/modules/configuracion.js` desde backend.

## HR

M6 continúa COMPLETE: HR viva 2026-08 = 34 GT + 10 HN = 44. No se reabrió ni remapeó.

## Métrica estable

```text
M1 35 = COMPLETE
M2 20 = COMPLETE
M3 15 = COMPLETE
M4  5 = COMPLETE
M5  8 = 3/8 COMPLETE
M6  5 = COMPLETE
M7  5 = PENDING
M8  3 = PENDING
M9  3 = PENDING
M10 1 = PENDING
```

**Avance certificado: 83%. Restante: 17%.**

## Siguiente acción exacta

`C6 STAFF REPAIR/BOOTSTRAP PROVIDER SNAPSHOT READ-ONLY`.

Debe realizar una sola observación Auth focal source-safe, adjudicar reutilización de A únicamente con owner-binding independiente, verificar colisiones técnicas con inputs transitorios y congelar write budget + rollback dry-run. No reabrir las 340 identidades.

## Seguridad

```text
providerReadsCurrentBlock=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
deploys=0
merge=false
production=false
```