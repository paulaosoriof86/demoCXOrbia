# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `STOP_RETRY_CLIENT_MEMBERSHIP_WRITE_AUTH_REQUIRED__NO_HOSTING_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Codex: opcional, no dependencia operativa;
- carril: ChatGPT + runners controlados de GitHub.

## 2. Base técnica preservada

V7.2-P0F1 permanece empalmada en `33d6f4f14272f82dca9d9c7c0cc119a9f89619bd`.

La autoridad canónica fue reconciliada en `fb8d8897bb24f2f634bc5594dca4e8d610daf910` y los gates source/static + Lab obtuvieron PASS en run `31009570981`, artifact `8931809583`:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

Cobertura preservada: `53/53` blobs críticos base, `4/4` adicionales, failures `0`, secretos `0`.

## 3. Bloque autorizado de Hosting DEV

Paula autorizó el 2026-08-05 a las 07:52 -06:00 un único Hosting DEV y gates acumulativos, con:

- máximo un deploy Hosting DEV;
- cero Cloud Run;
- cero Firestore/Auth/Rules/Storage/HR writes;
- cero Make/Gemini/pagos;
- cero merge/producción;
- STOP_RETRY antes de cualquier deploy si fallaba un preflight.

## 4. Predeploys ejecutados y causa raíz corregida

Todos los intentos se detuvieron antes del deploy. `hostingDeployAttempts=0` y `hostingDeploysThisRun=0` en cada evidencia.

### 4.1 Autoridad source obsoleta

El gate C6 todavía invocaba el manifiesto parcial A+B. Se rebasó sobre la composición Phase A activa:

- commit funcional: `26062218d1f2527f6815caf99f94b3cea94944da`;
- apply run: `31013265981`;
- resultado: PASS atómico.

### 4.2 Conteo HR congelado

El selector histórico exigía exactamente `616` visitas, mientras la autoridad HR viva devolvió `660`. Se activó el selector dinámico sin conteo congelado:

- commit funcional: `06e120d11776307cd63dbc78ed72b8b814a3a0a7`;
- apply run: `31013682915`;
- `frozenVisitCountAssumed=false`.

### 4.3 Alias de decisión Cliente

El gate heredado esperaba `PASS_C6_CLIENT_AUTH_READBACK`, mientras el contrato canónico devuelve `PASS_C6_CLIENT_AUTH_MEMBERSHIP_READBACK`. Se agregó alias contextual, preservando la decisión canónica:

- commit funcional: `23aebfedeb03a0e041312a6e3b97bf5916f64d41`;
- apply run: `31014231883`.

### 4.4 Diagnóstico exacto

Se agregó telemetría sanitizada de etapa, sin secretos ni valores de credenciales:

- commit funcional: `fc65fe85d12744dfcfeb21f682c23a4cebb788da`;
- apply run: `31014615498`.

## 5. Bloqueo comprobado actual

La evidencia vigente cerró en:

```text
client_auth_materialization__readback__CLIENT_MEMBERSHIP_READBACK_MISMATCH
```

Esto demuestra:

- el usuario Auth de Portal Cliente existe;
- no está deshabilitado;
- nombre, contraseña y claims canónicos pasaron, porque el fallo ocurrió después de esa validación;
- el documento de membresía `tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1` está ausente o no coincide con el contrato canónico;
- el materializador histórico del 2026-08-02 creó el usuario y claims, pero registró `firestoreWrites: 0`, por lo que no materializó la membresía requerida por el contrato v2.

No es un problema de Login V7.2, HR, contraseña ni deploy. Es una deuda de materialización de membresía del Portal Cliente.

## 6. Solución exacta requerida

Un único bloque limitado a DEV debe:

1. tomar snapshot read-only del usuario y membresía;
2. confirmar target único y claims exactos;
3. crear o normalizar exclusivamente `tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1`;
4. permitir máximo `1` Firestore membership write y `0` Auth user creates/password changes;
5. ejecutar idempotencia, readback y rollback dry-run;
6. solamente con PASS, reactivar el mismo bloque para el único Hosting DEV aún no utilizado.

Este write no estaba incluido en la autorización vigente y no se ejecutó.

## 7. Phase A preservada

Se mantienen HR e histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 8. Estado seguro

```text
HOSTING_DEPLOY_ATTEMPTS=0
HOSTING_DEPLOYS=0
CLOUD_RUN_DEPLOYS=0
FIRESTORE_WRITES=0
AUTH_WRITES=0
PASSWORD_CHANGES=0
RULES_WRITES=0
STORAGE_WRITES=0
HR_WRITES=0
MERGE=false
PRODUCTION=false
```

## 9. Siguiente acción exacta

`AUTORIZAR UN ÚNICO REPAIR DEV DE MEMBRESÍA CLIENTE, MÁXIMO 1 FIRESTORE MEMBERSHIP WRITE, CON SNAPSHOT + IDEMPOTENCIA + READBACK + ROLLBACK DRY-RUN; DESPUÉS RETOMAR EL ÚNICO HOSTING DEV AÚN NO CONSUMIDO`.
