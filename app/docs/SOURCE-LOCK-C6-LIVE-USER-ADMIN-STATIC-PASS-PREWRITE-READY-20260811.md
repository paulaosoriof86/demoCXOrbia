# SOURCE LOCK — C6 live user-admin static PASS + staff prewrite ready

**Fecha:** 2026-08-11  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `PASS_C6_LIVE_USER_ADMIN_STATIC_SOURCE_GATE_TERMINAL__STAFF_REPAIR_BOOTSTRAP_PREWRITE_CONTRACT_READY__PROVIDER_SNAPSHOT_PENDING__NO_PROVIDER_READS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Gate terminal ejecutado

Se reutilizó el runner read-only ya existente `CXORBIA_READONLY_POST_GATES_RUNNER`; no se creó workflow, rama, PR, proyecto o servicio nuevo.

El checkout terminal fue la rama viva exacta en:

```text
checkoutHeadSha=9d16521ac67c7a9fa7cd6de393e778bc6a05876b
workflowRunId=31513528713
workflowJobId=93852916856
```

La validación obligatoria `tools/qa/cxorbia-controlled-runners-contract-gate.mjs` incorporó como requisito `tools/qa/cxorbia-c6-live-user-admin-source-gate.mjs`. El job terminó `success` con:

```text
decision=PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT
blockers=[]
warnings=[]
```

El preflight falla si el gate live-user-admin no devuelve exactamente `PASS_C6_STAFF_TARGET_DIGEST_AND_LIVE_USER_ADMIN_BACKEND_SOURCE_ONLY` o si reporta provider/Auth/Firestore/deploy/production distinto de cero/false.

Evidencia source-safe: `app/docs/evidence/C6-LIVE-USER-ADMIN-STATIC-GATE-LATEST.json`.

## 2. Seguridad del gate

El request de control quedó deliberadamente `enabled=false`; por tanto no se ejecutó ningún perfil provider/browser. Solo corrió el preflight source-only obligatorio.

```text
providerReads=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HRWrites=0
deploys=0
merge=false
production=false
```

## 3. M5c cerrado

```text
M5a live-user-admin contract source-only       = COMPLETE 1/8
M5b executable backend source materialized     = COMPLETE 1/8
M5c static terminal gate                       = COMPLETE 1/8
M5 remaining                                   = 5/8 PENDING
```

**Avance certificado: 83%. Restante: 17%.** El denominador permanece congelado.

## 4. Prewrite focal preparado

Se creó `backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json` para unificar sin superposición:

- los tres grupos históricos staff R1/Super, R2/Admin y R3/Ops;
- el cuarto acceso inicial de Operaciones como `targetAlias=D`, explícitamente distinto del viejo grupo histórico Cliente;
- el grupo histórico Cliente se renombra contractualmente `R4_CLIENT_HISTORICAL` para evitar colisión semántica con el nuevo target D;
- retirement histórico siempre `DISABLE_ONLY_NO_DELETE` y solo después de canonical readback;
- snapshot, idempotencia y rollback dry-run obligatorios antes del primer write.

## 5. Corrección de presupuesto de writes

El hard cap histórico de 14 Auth writes **no puede reutilizarse** porque no contemplaba el acceso adicional de Operaciones y precede el contrato vivo de documento de usuario/auditoría.

El contrato nuevo registra solo un máximo teórico pre-snapshot de Auth = 16. **No es autorización de ejecución ni cap final.** El cap exacto se congela únicamente después del snapshot provider read-only, cuando se conozca si A puede reutilizar el canónico existente y se confirme el estado real de todos los focales.

## 6. Siguiente gate exacto

`C6 STAFF REPAIR/BOOTSTRAP PROVIDER SNAPSHOT READ-ONLY`.

Objetivo: una sola observación source-safe de Auth focal para:

- confirmar población congelada o detener por drift;
- verificar los ocho históricos/focales y el canónico Cliente validado;
- adjudicar reutilización de A solo con owner-binding independiente, nunca por unicidad de rol;
- comprobar colisiones técnicas A–D usando inputs transitorios, sin emitir login/email/UID/password/nombre;
- congelar el cap exacto de writes y el rollback dry-run.

Si falta un input transitorio indispensable, el gate debe detenerse antes de cualquier provider write y declarar el faltante exacto; no se reabre el universo 340.

## 7. No reabrir

- M1–M4 y M6;
- plan Auth V4 de 340 perfiles;
- SKIP13/MultiAuth/HashConfig/direct runner;
- PREWRITE/Activation general;
- HR mapping;
- frontend acumulativo;
- scopes iniciales de los cuatro accesos.

## 8. Clasificación

- **Reusable CXOrbia:** gate terminal source-only, prewrite focal, snapshot/readback/rollback, no silent scope inheritance.
- **Exclusivo TyA:** focales R1–R4, targets A–D y baseline Auth 228.
- **Claude/prototipo:** sin cambio UI en este bloque; wiring localizado sigue pendiente.
- **Academia:** diferenciación entre alta, alcance, retiro reversible y trazabilidad.
- **Sin impacto Claude:** provider snapshot/prewrite técnico y write budget.
